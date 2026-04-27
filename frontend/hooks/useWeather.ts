import { useState, useEffect, useCallback, useRef } from 'react';
import type { Shipment } from './useShipments';

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  forecast: string;
  weatherRisk: 'Low' | 'High';
}

export interface ShipmentContext {
  weather: WeatherData | null;
  traffic: string;
  lastUpdated: number; // timestamp of last fetch
}

export function useShipmentContext(shipments: Shipment[]) {
  const [contexts, setContexts] = useState<Record<string, ShipmentContext>>({});
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchWeatherAndTraffic = useCallback(async () => {
    if (shipments.length === 0) return;

    const newContexts: Record<string, ShipmentContext> = {};

    for (const shipment of shipments) {
      let weather: WeatherData | null = null;
      
      // Use the current location or the next transit stop for weather
      const location = shipment.currentLocation || shipment.route[0];

      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current_weather=true`);
        if (res.ok) {
          const data = await res.json();
          const current = data.current_weather;
          const code = current.weathercode;
          
          let condition = 'Clear';
          let forecastText = 'Clear skies expected.';
          let weatherRisk: 'Low' | 'High' = 'Low';
          
          if (code >= 1 && code <= 3) { condition = 'Clouds'; forecastText = 'Partly cloudy conditions expected.'; }
          else if (code >= 45 && code <= 48) { condition = 'Fog'; forecastText = 'Reduced visibility due to fog.'; weatherRisk = 'High'; }
          else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) { condition = 'Rain'; forecastText = 'Rain expected along the route.'; weatherRisk = 'High'; }
          else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) { condition = 'Snow'; forecastText = 'Snowfall expected.'; weatherRisk = 'High'; }
          else if (code >= 95) { condition = 'Thunderstorm'; forecastText = 'Thunderstorms in the area.'; weatherRisk = 'High'; }

          weather = {
            temp: Math.round(current.temperature),
            condition,
            icon: '',
            forecast: forecastText,
            weatherRisk
          };
        }
      } catch (error) {
        console.error("Failed to fetch weather from Open-Meteo", error);
        // Fallback just in case network fails
        weather = { temp: 25, condition: 'Clear', icon: '', forecast: 'Unable to fetch real-time weather.', weatherRisk: 'Low' };
      }

      // Use real traffic from Directions API if available
      const baseTraffic = shipment.trafficLevel || 'Low';
      const traffic = shipment.trafficDelayText ? `${baseTraffic} (${shipment.trafficDelayText})` : baseTraffic;

      newContexts[shipment.id] = { weather, traffic, lastUpdated: Date.now() };
    }

    setContexts(newContexts);
  }, [shipments]);

  // Initial fetch
  useEffect(() => {
    fetchWeatherAndTraffic();
  }, [fetchWeatherAndTraffic]);

  // Auto-refresh every 60 seconds with real API data
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log('[SwiftRoute] Refreshing weather & traffic data...');
      fetchWeatherAndTraffic();
    }, 60000); // Every 1 minute

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchWeatherAndTraffic]);

  return { contexts, refreshContexts: fetchWeatherAndTraffic };
}
