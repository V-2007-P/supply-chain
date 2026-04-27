"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Bell, Activity, Truck, AlertTriangle, CheckCircle2, Clock, BrainCircuit, X, MapPin, CloudRain, Sun, Wind, CloudLightning, TrafficCone, Zap, RefreshCw } from "lucide-react";
import { useShipments, Shipment, Stop } from "@/hooks/useShipments";
import { useShipmentContext } from "@/hooks/useWeather";
import { useLogisticsData } from "@/hooks/useLogisticsData";
import { useAlerts, Alert } from "@/hooks/useAlerts";

// Dynamically load Map to prevent SSR issues
const OpsMap = dynamic(() => import('@/components/ops/OpsMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading Global Map...</div>
});

export default function OpsDashboard() {
  const router = useRouter();
  const { shipments, updateShipmentRoute, mounted } = useShipments();
  const { contexts } = useShipmentContext(shipments);
  const { insights, loading: dataLoading, getRiskLevel, getInsightMessage } = useLogisticsData();

  // Build historical insight string for AI context
  const historicalInsight = insights 
    ? `Rainy weather causes ${(insights.delayByWeather['rainy'] || 0).toFixed(0)}% delays. Long distance (>200km) has ${(insights.delayByDistance['Long (> 200km)'] || 0).toFixed(0)}% delay rate. Trucks delay ${(insights.delayByVehicle['truck'] || 0).toFixed(0)}% of the time.`
    : '';

  const { alerts, refreshAlerts, loadingPredictions, fetchPredictions } = useAlerts(shipments, contexts, historicalInsight);
  const [focusedShipment, setFocusedShipment] = useState<Shipment | null>(null);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  useEffect(() => {
    // Auth check
    if (sessionStorage.getItem("ops_auth") !== "true") {
      router.push("/ops-login");
    }
  }, [router]);

  if (!mounted) return null;

  const calculateRouteDistance = (route: Stop[]) => {
    let dist = 0;
    const p = 0.017453292519943295;
    const c = Math.cos;
    for (let i = 0; i < route.length - 1; i++) {
      const lat1 = route[i].lat, lon1 = route[i].lng;
      const lat2 = route[i+1].lat, lon2 = route[i+1].lng;
      const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
      dist += 12742 * Math.asin(Math.sqrt(a));
    }
    return dist;
  };

  const getShipmentRisk = (shipment: Shipment) => {
    if (!contexts[shipment.id] || !insights) return shipment.risk;
    const weather = contexts[shipment.id].weather?.condition || "Clear";
    const dist = calculateRouteDistance(shipment.route);
    return getRiskLevel(weather, dist, "truck");
  };

  // Override shipments with dataset-driven risk
  const enrichedShipments = shipments.map(s => ({
    ...s,
    risk: getShipmentRisk(s) as "Low" | "Medium" | "High"
  }));

  const totalShipments = enrichedShipments.length;
  const highRisk = enrichedShipments.filter(s => s.risk === "High").length;
  const delayed = enrichedShipments.filter(s => s.eta.includes("Delayed")).length;
  const active = enrichedShipments.filter(s => s.status === "In Transit").length;

  const analyzeWithAI = async (shipment: Shipment) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const context = contexts[shipment.id];
      const dist = calculateRouteDistance(shipment.route);
      const datasetInsight = getInsightMessage(context?.weather?.condition || 'Clear', dist, 'truck');

      const prompt = `
        You are an expert logistics route optimization AI. Your job is to analyze REAL-TIME conditions and suggest an ALTERNATE route that avoids traffic congestion and adverse weather.

        CURRENT SHIPMENT:
        - Route: ${shipment.route.map(r => r.name).join(" → ")}
        - Origin: ${shipment.source} | Destination: ${shipment.destination}
        - Current Weather: ${context?.weather?.condition || 'Unknown'} (${context?.weather?.temp || 'N/A'}°C)
        - Weather Risk: ${context?.weather?.weatherRisk || 'Unknown'}
        - Weather Forecast: ${context?.weather?.forecast || 'N/A'}
        - Current Traffic: ${context?.traffic || 'Unknown'}
        - Traffic Delay: ${shipment.trafficDelayText || 'None detected'}
        - Existing Delay Reason: ${shipment.delayReason || 'None'}

        HISTORICAL DATA PATTERNS:
        ${historicalInsight || 'No historical data available'}
        ${datasetInsight}

        INSTRUCTIONS:
        1. If weather is adverse (Rain/Storm/Fog/Snow) OR traffic is Medium/High, you MUST suggest an alternate route through cities/highways with BETTER weather and LESS traffic.
        2. The optimizedRoute MUST contain real Indian city coordinates (lat/lng) that form a geographically valid path from ${shipment.source} to ${shipment.destination}.
        3. Prefer national highways and expressways that bypass congested urban areas.
        4. Use historical data patterns to justify your risk assessment.
        5. If conditions are already optimal (clear weather, low traffic), respond with the current route and explain why no change is needed.

        Return ONLY valid JSON in this exact format:
        {
          "risk": "High" or "Medium" or "Low",
          "reason": "Detailed explanation combining weather + traffic + historical data",
          "suggestion": "Specific route change recommendation with city names",
          "optimizedRoute": [
            { "lat": number, "lng": number, "name": "City/Hub Name", "type": "Origin" or "Transit" or "Destination" }
          ]
        }
      `;

      let analysisResult = null;
      if (process.env.GROQ_API_KEY || true) { // ALWAYS TRY API ROUTE
        const res = await fetch('/api/groq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        if (!res.ok) {
          throw new Error(`API Error: ${await res.text()}`);
        }

        analysisResult = await res.json();
        if (analysisResult.error) throw new Error(analysisResult.error);
      } else {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Provide realistic dummy fallback based on shipment
        if (shipment.id === "SHP101") {
          analysisResult = {
            risk: "High",
            reason: "Severe traffic congestion detected on NH19 causing 2+ hours delay.",
            suggestion: "Reroute via Agra-Lucknow Expressway to bypass congestion.",
            optimizedRoute: [
              { lat: 28.6139, lng: 77.2090, name: "Delhi Hub", type: "Origin" },
              { lat: 26.8467, lng: 80.9462, name: "Lucknow Transit (Bypass)", type: "Transit" },
              { lat: 25.5941, lng: 85.1376, name: "Patna Delivery", type: "Destination" }
            ]
          };
        } else if (shipment.id === "SHP104") {
          analysisResult = {
            risk: "High",
            reason: "Landslide near Siliguri completely blocking main route.",
            suggestion: "Divert shipment to alternate highway via Malda.",
            optimizedRoute: [
              { lat: 22.5726, lng: 88.3639, name: "Kolkata Hub", type: "Origin" },
              { lat: 25.0002, lng: 88.1433, name: "Malda Alternate", type: "Transit" },
              { lat: 26.1445, lng: 91.7362, name: "Guwahati Hub", type: "Destination" }
            ]
          };
        } else {
          analysisResult = {
            risk: "Low",
            reason: "Current route is optimal. Minor weather disruptions expected to clear.",
            suggestion: "Maintain current route.",
            optimizedRoute: shipment.route
          };
        }
      }

      setAiAnalysis(analysisResult);
    } catch (error: any) {
      console.error("AI Analysis Error", error);
      setAiAnalysis({
        risk: "Error",
        reason: error.message || "Failed to connect to AI service.",
        suggestion: "Please check your API key or try again later.",
        optimizedRoute: shipment.route
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestedRoute = () => {
    if (focusedShipment && aiAnalysis && aiAnalysis.optimizedRoute) {
      updateShipmentRoute(
        focusedShipment.id,
        aiAnalysis.optimizedRoute,
        "Low",
        null,
        "On Time (Adjusted)"
      );
      setFocusedShipment(null);
      setAiAnalysis(null);
      alert(`Route updated for ${focusedShipment.id} and synced to driver!`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header Banner */}
      <div className="bg-brand-navy pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
              <Activity className="w-8 h-8 text-brand-orange" /> Operations Control Tower
            </h1>
            <p className="text-brand-light/80 text-base font-medium">
              Resilient Logistics & Dynamic Supply Chain Optimization
            </p>
          </div>
          <button onClick={() => { sessionStorage.removeItem("ops_auth"); router.push("/ops-login"); }} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            Log out
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 max-w-7xl mx-auto w-full space-y-8 -mt-12 relative z-20 pb-20">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Total Shipments</p>
              <p className="text-3xl font-black text-slate-900">{totalShipments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"><Truck className="w-6 h-6" /></div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Active Trucks</p>
              <p className="text-3xl font-black text-slate-900">{active}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500"><Activity className="w-6 h-6" /></div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Delayed</p>
              <p className="text-3xl font-black text-amber-600">{delayed}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500"><Clock className="w-6 h-6" /></div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">High Risk</p>
              <p className="text-3xl font-black text-red-600">{highRisk}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500"><AlertTriangle className="w-6 h-6" /></div>
          </div>
        </div>

        {/* Dataset Insights Panel */}
        {insights && !dataLoading && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 mb-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Data-Driven Insights (Historical)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm font-bold text-slate-700">Weather Impact</p>
                <p className="text-xs text-slate-500 mt-1">
                  Deliveries in <span className="font-bold text-blue-600">Rainy</span> weather have a <span className="font-bold text-blue-600">{(insights.delayByWeather['rainy'] || 0).toFixed(0)}%</span> higher delay probability compared to Clear weather ({(insights.delayByWeather['clear'] || 0).toFixed(0)}%).
                </p>
              </div>
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm font-bold text-slate-700">Distance Risk</p>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="font-bold text-amber-600">Long distance</span> shipments ({'>'}200km) show a <span className="font-bold text-amber-600">{(insights.delayByDistance['Long (> 200km)'] || 0).toFixed(0)}%</span> delay probability, making them high risk.
                </p>
              </div>
              <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                <p className="text-sm font-bold text-slate-700">Vehicle Type</p>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="font-bold text-green-600">Truck</span> deliveries see delays {(insights.delayByVehicle['truck'] || 0).toFixed(0)}% of the time, compared to Bike at {(insights.delayByVehicle['bike'] || 0).toFixed(0)}%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Map & Alerts Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col p-2 h-full">
            <OpsMap shipments={enrichedShipments} focusedShipmentId={focusedShipment?.id || null} contexts={contexts} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 flex flex-col h-[500px] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900">
                <Bell className="w-5 h-5 text-brand-orange" /> Real-Time Alerts
              </h3>
              <div className="flex items-center gap-2">
                {alerts.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">{alerts.length}</span>
                )}
                <button onClick={refreshAlerts} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600" title="Refresh alerts">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {loadingPredictions && alerts.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-purple-700">Loading AI predictions...</span>
                </div>
              )}
              {alerts.map((alert) => {
                const isPrediction = alert.type === 'prediction';
                const bgClass = isPrediction ? 'bg-purple-50 border-purple-200' : alert.severity === 'High' ? 'bg-red-50 border-red-200' : alert.severity === 'Medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200';
                const iconBgClass = isPrediction ? 'bg-purple-100' : alert.severity === 'High' ? 'bg-red-100' : alert.severity === 'Medium' ? 'bg-amber-100' : 'bg-green-100';
                const AlertIcon = isPrediction ? BrainCircuit : alert.type === 'weather' ? CloudRain : alert.type === 'traffic' ? TrafficCone : Zap;
                const iconColorClass = isPrediction ? 'text-purple-600' : alert.type === 'weather' ? 'text-blue-500' : alert.type === 'traffic' ? 'text-orange-500' : 'text-red-500';
                const titleColorClass = isPrediction ? 'text-purple-700' : alert.severity === 'High' ? 'text-red-700' : alert.severity === 'Medium' ? 'text-amber-700' : 'text-green-700';
                const badgeClass = isPrediction ? 'bg-purple-200 text-purple-800' : alert.severity === 'High' ? 'bg-red-200 text-red-800' : alert.severity === 'Medium' ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800';
                const delayClass = isPrediction ? 'text-purple-600 bg-purple-100' : alert.severity === 'High' ? 'text-red-600 bg-red-100' : alert.severity === 'Medium' ? 'text-amber-600 bg-amber-100' : 'text-green-600 bg-green-100';

                return (
                  <button
                    key={alert.id}
                    onClick={() => {
                      const shipment = enrichedShipments.find(s => s.id === alert.shipmentId);
                      if (shipment) {
                        setFocusedShipment(shipment);
                        setAiAnalysis(null);
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border ${bgClass} hover:shadow-md transition-all duration-200 group cursor-pointer`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-xl ${iconBgClass} flex items-center justify-center shrink-0`}>
                        <AlertIcon className={`w-4 h-4 ${iconColorClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={`text-xs font-black uppercase tracking-wider ${titleColorClass} truncate`}>
                            {alert.title}
                          </p>
                          <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${badgeClass}`}>
                            {isPrediction ? 'AI' : alert.severity}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed mb-1.5">{alert.message}</p>
                        {isPrediction && alert.prediction && (
                          <p className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-lg mb-1.5">💡 {alert.prediction}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> {alert.shipmentId}
                          </span>
                          {alert.delay !== 'Monitoring' && alert.delay !== 'On Time' ? (
                            <span className={`text-[10px] font-black ${delayClass} px-1.5 py-0.5 rounded-md flex items-center gap-1`}>
                              <Clock className="w-3 h-3" /> {alert.delay}
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold ${alert.delay === 'On Time' ? 'text-green-500' : 'text-slate-400'} italic`}>{alert.delay}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {alerts.length === 0 && !loadingPredictions && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mb-2 text-green-200" />
                  <p className="font-bold text-sm">All Clear</p>
                  <p className="text-xs text-slate-300 mt-1">No active alerts detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-900">Active Shipments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold border-b border-slate-100">ID</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-100">Route</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-100">Environment</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-100">Risk Level</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-100">ETA</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrichedShipments.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900">{s.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {s.source} <span className="text-slate-300 mx-1">→</span> {s.destination}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{s.status}</td>
                    <td className="px-6 py-4">
                      {contexts[s.id] ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                            {contexts[s.id].weather?.condition === 'Rain' ? <CloudRain className="w-4 h-4 text-blue-500" /> : contexts[s.id].weather?.condition === 'Clear' ? <Sun className="w-4 h-4 text-amber-500" /> : contexts[s.id].weather?.condition === 'Thunderstorm' ? <CloudLightning className="w-4 h-4 text-purple-500" /> : <Wind className="w-4 h-4 text-slate-400" />}
                            {contexts[s.id].weather?.temp}°C - {contexts[s.id].weather?.condition}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Traffic: {contexts[s.id].traffic}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Loading...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.risk === 'High' ? 'bg-red-100 text-red-700' :
                        s.risk === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                        {s.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{s.eta}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setFocusedShipment(s); setAiAnalysis(null); }}
                        className="bg-brand-navy hover:bg-[#082a42] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail & AI Modal */}
      {focusedShipment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Shipment {focusedShipment.id}</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">{focusedShipment.source} → {focusedShipment.destination}</p>
              </div>
              <button onClick={() => setFocusedShipment(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Info */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Status</h3>
                  <div className="space-y-4">
                    {/* Environmental Conditions */}
                    {contexts[focusedShipment.id] && (
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Weather</p>
                          <div className="flex items-center gap-2">
                            {contexts[focusedShipment.id].weather?.condition === 'Rain' ? <CloudRain className="w-5 h-5 text-blue-500" /> : contexts[focusedShipment.id].weather?.condition === 'Clear' ? <Sun className="w-5 h-5 text-amber-500" /> : <Wind className="w-5 h-5 text-slate-400" />}
                            <span className="font-bold text-slate-700">{contexts[focusedShipment.id].weather?.temp}°C</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Traffic</p>
                          <p className={`font-bold ${contexts[focusedShipment.id].traffic === 'High' ? 'text-red-500' : contexts[focusedShipment.id].traffic === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>
                            {contexts[focusedShipment.id].traffic}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-slate-500 mb-1">Risk Level</p>
                      <p className={`font-black text-lg ${focusedShipment.risk === 'High' ? 'text-red-600' : focusedShipment.risk === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                        {focusedShipment.risk} RISK
                      </p>
                    </div>
                    {focusedShipment.delayReason && (
                      <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                        <p className="text-xs font-bold text-red-800 mb-1">Delay Reason</p>
                        <p className="text-sm text-red-600 font-medium">{focusedShipment.delayReason}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">ETA</p>
                      <p className="font-bold text-slate-900">{focusedShipment.eta}</p>
                    </div>

                    {/* Dataset Insight */}
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mt-2">
                      <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Dataset Insight
                      </p>
                      <p className="text-xs text-blue-700 font-medium">
                        {getInsightMessage(
                          contexts[focusedShipment.id]?.weather?.condition || "Clear",
                          calculateRouteDistance(focusedShipment.route),
                          "truck"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Box */}
                <div className="bg-gradient-to-br from-brand-navy to-[#1a4f76] p-6 rounded-2xl border border-[#082a42] text-white shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BrainCircuit className="w-24 h-24" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="font-black text-xl mb-2 flex items-center gap-2 text-brand-orange">
                      <BrainCircuit className="w-6 h-6" /> Groq AI Analyst
                    </h3>
                    <p className="text-brand-light/80 text-sm mb-6">
                      Analyze real-time traffic, weather, and network data to predict risks and generate optimized alternate routes.
                    </p>
                  </div>

                  {!aiAnalysis ? (
                    <button
                      onClick={() => analyzeWithAI(focusedShipment)}
                      disabled={isAnalyzing}
                      className="relative z-10 w-full bg-brand-orange hover:bg-[#e66000] disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing Conditions...</>
                      ) : (
                        "Analyze Risk & Optimize Route"
                      )}
                    </button>
                  ) : (
                    <div className="relative z-10 bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">Predicted Risk Level</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${aiAnalysis.risk === 'High' ? 'bg-red-500 text-white' : aiAnalysis.risk === 'Medium' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>{aiAnalysis.risk} RISK</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">AI Reasoning</p>
                        <p className="text-sm font-medium leading-relaxed">{aiAnalysis.reason}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">Suggested Action</p>
                        <p className="text-sm font-medium leading-relaxed mb-4">{aiAnalysis.suggestion}</p>
                        <button
                          onClick={applySuggestedRoute}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg"
                        >
                          Apply Suggested Route
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mini Map */}
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm h-[300px] relative z-0">
                <OpsMap shipments={[focusedShipment]} focusedShipmentId={focusedShipment.id} contexts={contexts} />
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
