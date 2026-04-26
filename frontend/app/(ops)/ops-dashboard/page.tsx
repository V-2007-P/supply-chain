"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Bell, Activity, Truck, AlertTriangle, CheckCircle2, Clock, BrainCircuit, X, MapPin, CloudRain, Sun, Wind, CloudLightning } from "lucide-react";
import { useShipments, Shipment, Stop } from "@/hooks/useShipments";
import { useShipmentContext } from "@/hooks/useWeather";

// Dynamically load Map to prevent SSR issues
const OpsMap = dynamic(() => import('@/components/ops/OpsMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading Global Map...</div>
});

export default function OpsDashboard() {
  const router = useRouter();
  const { shipments, updateShipmentRoute, mounted } = useShipments();
  const { contexts } = useShipmentContext(shipments);
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

  const totalShipments = shipments.length;
  const highRisk = shipments.filter(s => s.risk === "High").length;
  const delayed = shipments.filter(s => s.eta.includes("Delayed")).length;
  const active = shipments.filter(s => s.status === "In Transit").length;

  const analyzeWithAI = async (shipment: Shipment) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const context = contexts[shipment.id];
      const prompt = `
        Analyze this logistics route using weather and traffic conditions.
        Route: ${shipment.route.map(r => r.name).join(" -> ")}
        Weather: ${context?.weather?.condition || 'Unknown'} (${context?.weather?.temp || 0}°C)
        Traffic: ${context?.traffic || 'Unknown'}
        Delay Reason: ${shipment.delayReason || 'None'}
        
        Predict risk level (Low/Medium/High), explain the reason, and suggest an optimized alternate route.
        Return ONLY valid JSON in this exact format:
        {
          "risk": "High",
          "reason": "Detailed explanation...",
          "suggestion": "Detailed suggestion...",
          "optimizedRoute": [
            { "lat": number, "lng": number, "name": "string", "type": "string" }
          ]
        }
      `;

      let analysisResult = null;
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY || true) { // ALWAYS TRY API ROUTE
        const res = await fetch('/api/gemini', {
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

        {/* Map & Alerts Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col p-2 h-full">
            <OpsMap shipments={shipments} focusedShipmentId={focusedShipment?.id || null} contexts={contexts} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 flex flex-col h-[500px] overflow-hidden">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-slate-900">
              <Bell className="w-5 h-5 text-brand-orange" /> Real-Time Alerts
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {shipments.filter(s => s.delayReason).map((s, i) => (
                <div key={i} className={`p-4 rounded-xl border ${s.risk === 'High' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'} animate-in fade-in slide-in-from-right-4`}>
                  <div className="flex gap-3">
                    <AlertTriangle className={`w-5 h-5 shrink-0 ${s.risk === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.risk === 'High' ? 'text-red-800' : 'text-amber-800'}`}>{s.id} - {s.risk} RISK</p>
                      <p className="text-sm font-semibold text-slate-800">{s.delayReason}</p>
                    </div>
                  </div>
                </div>
              ))}
              {highRisk === 0 && delayed === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mb-2 text-slate-200" />
                  <p>All clear. No active alerts.</p>
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
                {shipments.map(s => (
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
                  </div>
                </div>

                {/* AI Assistant Box */}
                <div className="bg-gradient-to-br from-brand-navy to-[#1a4f76] p-6 rounded-2xl border border-[#082a42] text-white shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BrainCircuit className="w-24 h-24" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="font-black text-xl mb-2 flex items-center gap-2 text-brand-orange">
                      <BrainCircuit className="w-6 h-6" /> Gemini AI Analyst
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
