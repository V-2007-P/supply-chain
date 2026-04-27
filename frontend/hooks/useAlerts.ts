import { useState, useEffect, useCallback } from 'react';
import type { Shipment } from './useShipments';
import type { ShipmentContext } from './useWeather';

export interface Alert {
  id: string;
  shipmentId: string;
  type: 'traffic' | 'weather' | 'combined' | 'prediction';
  severity: 'Low' | 'Medium' | 'High';
  title: string;
  message: string;
  delay: string;
  route: string;
  timestamp: Date;
  prediction?: string;
}

function formatDelay(seconds: number): string {
  if (seconds <= 0) return '0 min';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins} min`;
}

function generateAlerts(shipments: Shipment[], contexts: Record<string, ShipmentContext>): Alert[] {
  const alerts: Alert[] = [];

  for (const shipment of shipments) {
    const ctx = contexts[shipment.id];
    if (!ctx) continue;

    const routeLabel = `${shipment.source}–${shipment.destination}`;
    const weather = ctx.weather;
    const trafficLevel = shipment.trafficLevel || 'Low';

    let trafficDelaySecs = 0;
    if (shipment.durationInTraffic && shipment.duration) {
      trafficDelaySecs = Math.max(0, shipment.durationInTraffic - shipment.duration);
    }

    const isHighTraffic = trafficLevel === 'High';
    const isMediumTraffic = trafficLevel === 'Medium';
    const isBadWeather = weather && ['Rain', 'Snow', 'Thunderstorm', 'Fog'].includes(weather.condition);
    const isHighWeatherRisk = weather?.weatherRisk === 'High';

    // Combined alert — both weather AND traffic are bad
    if (isBadWeather && (isHighTraffic || isMediumTraffic)) {
      const weatherPenalty = Math.round(trafficDelaySecs * (weather?.condition === 'Thunderstorm' ? 0.3 : 0.15));
      const combinedDelay = trafficDelaySecs + weatherPenalty;
      
      alerts.push({
        id: `${shipment.id}-combined`,
        shipmentId: shipment.id,
        type: 'combined',
        severity: 'High',
        title: 'Combined Risk Alert',
        message: `${weather?.condition} + ${trafficLevel.toLowerCase()} traffic on ${routeLabel} route. Road conditions deteriorating.`,
        delay: `+${formatDelay(combinedDelay)}`,
        route: routeLabel,
        timestamp: new Date(),
      });
      continue;
    }

    // Traffic-only alert
    if (isHighTraffic || isMediumTraffic) {
      alerts.push({
        id: `${shipment.id}-traffic`,
        shipmentId: shipment.id,
        type: 'traffic',
        severity: isHighTraffic ? 'High' : 'Medium',
        title: `${isHighTraffic ? 'Heavy' : 'Moderate'} Traffic Alert`,
        message: `${isHighTraffic ? 'Severe congestion' : 'Moderate slowdown'} detected on ${routeLabel} route.`,
        delay: trafficDelaySecs > 0 ? `+${formatDelay(trafficDelaySecs)}` : 'Monitoring',
        route: routeLabel,
        timestamp: new Date(),
      });
    }

    // Weather-only alert
    if (isBadWeather) {
      let weatherDelaySecs = 0;
      if (shipment.duration) {
        const factor = weather?.condition === 'Thunderstorm' ? 0.20 : weather?.condition === 'Snow' ? 0.25 : 0.10;
        weatherDelaySecs = Math.round(shipment.duration * factor);
      }

      alerts.push({
        id: `${shipment.id}-weather`,
        shipmentId: shipment.id,
        type: 'weather',
        severity: isHighWeatherRisk ? 'High' : 'Medium',
        title: `${weather?.condition} Weather Alert`,
        message: `${weather?.condition} conditions (${weather?.temp}°C) impacting ${routeLabel} route. ${weather?.forecast}`,
        delay: weatherDelaySecs > 0 ? `+${formatDelay(weatherDelaySecs)}` : 'Monitoring',
        route: routeLabel,
        timestamp: new Date(),
      });
    }

    // Always add a delay-reason based alert if the shipment has one (from initial data)
    if (shipment.delayReason && !isBadWeather && !isHighTraffic && !isMediumTraffic) {
      alerts.push({
        id: `${shipment.id}-delay`,
        shipmentId: shipment.id,
        type: shipment.delaySegment?.type === 'weather' ? 'weather' : 'traffic',
        severity: shipment.risk === 'High' ? 'High' : 'Medium',
        title: shipment.risk === 'High' ? 'Critical Delay' : 'Delay Notice',
        message: `${shipment.delayReason} on ${routeLabel} route.`,
        delay: shipment.eta.includes('Delayed') ? shipment.eta.replace('Delayed ', '') : 'Active',
        route: routeLabel,
        timestamp: new Date(),
      });
    }
  }

  // Sort: High first, then Medium, then Low
  const severityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
  alerts.sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));

  return alerts;
}

// Fetch AI prediction for all shipments from Groq
async function fetchAIPredictions(
  shipments: Shipment[], 
  contexts: Record<string, ShipmentContext>,
  historicalInsight: string
): Promise<Alert[]> {
  const predictionAlerts: Alert[] = [];

  // Build a batch prompt for all shipments
  const shipmentData = shipments.map(s => {
    const ctx = contexts[s.id];
    return {
      id: s.id,
      route: `${s.source} → ${s.destination}`,
      weather: ctx?.weather?.condition || 'Unknown',
      temp: ctx?.weather?.temp || 'N/A',
      traffic: s.trafficLevel || 'Unknown',
      trafficDelay: s.trafficDelayText || 'None',
      currentRisk: s.risk,
      delayReason: s.delayReason || 'None',
    };
  });

  const prompt = `You are a logistics AI risk analyst. Analyze these active shipments using real-time weather, traffic data, and historical patterns.

Real-Time Shipment Data:
${JSON.stringify(shipmentData, null, 2)}

Historical Pattern: ${historicalInsight}

For each shipment, predict:
1. Will it be delayed? By how much?
2. What is the primary risk factor?
3. What action should the operations team take?

Return ONLY valid JSON in this exact format:
{
  "predictions": [
    {
      "shipmentId": "SHP101",
      "riskLevel": "High",
      "predictedDelay": "+45 min",
      "reason": "Brief explanation combining weather + traffic + historical data",
      "action": "Specific operational recommendation"
    }
  ]
}`;

  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) return predictionAlerts;

    const data = await res.json();
    const predictions = data.predictions || [];

    for (const pred of predictions) {
      const shipment = shipments.find(s => s.id === pred.shipmentId);
      if (!shipment) continue;

      predictionAlerts.push({
        id: `${pred.shipmentId}-prediction`,
        shipmentId: pred.shipmentId,
        type: 'prediction',
        severity: pred.riskLevel === 'High' ? 'High' : pred.riskLevel === 'Medium' ? 'Medium' : 'Low',
        title: `AI Prediction: ${pred.shipmentId}`,
        message: pred.reason || 'AI analysis complete.',
        delay: pred.predictedDelay || 'On Time',
        route: `${shipment.source}–${shipment.destination}`,
        timestamp: new Date(),
        prediction: pred.action,
      });
    }
  } catch (err) {
    console.error('AI prediction fetch failed:', err);
  }

  return predictionAlerts;
}

export function useAlerts(
  shipments: Shipment[], 
  contexts: Record<string, ShipmentContext>,
  historicalInsight?: string
) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<Alert[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  const refreshAlerts = useCallback(() => {
    const newAlerts = generateAlerts(shipments, contexts);
    setAlerts(newAlerts);
  }, [shipments, contexts]);

  // Generate rule-based alerts whenever data changes
  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  // Fetch AI predictions once on mount and every 60 seconds
  const fetchPredictions = useCallback(async () => {
    if (shipments.length === 0 || Object.keys(contexts).length === 0) return;
    setLoadingPredictions(true);
    const aiAlerts = await fetchAIPredictions(shipments, contexts, historicalInsight || '');
    setPredictions(aiAlerts);
    setLoadingPredictions(false);
  }, [shipments, contexts, historicalInsight]);

  useEffect(() => {
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 60000);
    return () => clearInterval(interval);
  }, [fetchPredictions]);

  // Auto-refresh rule-based alerts every 15 seconds
  useEffect(() => {
    const interval = setInterval(refreshAlerts, 15000);
    return () => clearInterval(interval);
  }, [refreshAlerts]);

  // Combine: rule-based alerts first, then AI predictions
  const allAlerts = [...alerts, ...predictions];

  return { alerts: allAlerts, refreshAlerts, predictions, loadingPredictions, fetchPredictions };
}
