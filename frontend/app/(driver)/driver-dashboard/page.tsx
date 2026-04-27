"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  LogOut, Package, MapPin, Navigation, Clock,
  CheckCircle2, AlertTriangle, Truck, Box, Phone, Timer, ArrowRight
} from "lucide-react";
import type { ShipmentData } from "@/components/driver/DriverMap";

// Disable SSR for leaflet
const DriverMap = dynamic(() => import('@/components/driver/DriverMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
      Loading Route Map...
    </div>
  )
});

// ── Dummy Single Active Shipment ───────────────────────────────────────────────
interface Stop {
  name: string;
  type: "hub" | "transit" | "delivery";
  eta: string;
  packages: number;
  completed: boolean;
}

interface ActiveShipment {
  id: string;
  mapData: ShipmentData;
  stops: Stop[];
}

const ACTIVE_SHIPMENT: ActiveShipment = {
  id: "SHP101",
  mapData: {
    id: "SHP101",
    route: [
      { lat: 28.6139, lng: 77.2090, type: "hub",      name: "Delhi Hub" },
      { lat: 25.3176, lng: 82.9739, type: "transit",  name: "Varanasi Transit" },
      { lat: 25.5941, lng: 85.1376, type: "delivery", name: "Patna Delivery" },
    ],
    delaySegment: { startIdx: 0, endIdx: 1, reason: "Heavy Traffic on NH19" },
  },
  stops: [
    { name: "Delhi Hub",         type: "hub",      eta: "08:00 AM", packages: 0,  completed: true },
    { name: "Varanasi Transit",  type: "transit",  eta: "01:15 PM", packages: 5,  completed: false },
    { name: "Patna Delivery",    type: "delivery", eta: "04:30 PM", packages: 12, completed: false },
  ],
};

// Tailwind badge helpers
const stopTypeBadge: Record<Stop["type"], string> = {
  hub:      "bg-blue-100 text-blue-700",
  transit:  "bg-amber-100 text-amber-700",
  delivery: "bg-green-100 text-green-700",
};
const stopTypeLabel: Record<Stop["type"], string> = {
  hub: "Hub", transit: "Transit", delivery: "Delivery",
};

// ── Main Dashboard Page ────────────────────────────────────────────────────────
export default function DriverDashboard() {
  const router  = useRouter();
  const [mounted,      setMounted]      = useState(false);
  const [isDelivered,  setIsDelivered]  = useState(false);
  const [showHelpline, setShowHelpline] = useState(false);
  const [activeShipment, setActiveShipment] = useState<ActiveShipment>(ACTIVE_SHIPMENT);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Auth check
    if (sessionStorage.getItem("driver_auth") !== "true") {
      setIsRedirecting(true);
      router.replace("/driver-login");
      return;
    }
    
    // Sync with Ops Dashboard data
    const syncData = () => {
      const stored = localStorage.getItem('ops_shipments');
      if (stored) {
        const shipments = JSON.parse(stored);
        const shp101 = shipments.find((s: any) => s.id === "SHP101");
        if (shp101 && shp101.route) {
           const newStops = shp101.route.map((r: any, idx: number) => ({
              name: r.name,
              type: r.type.toLowerCase() === 'origin' ? 'hub' : r.type.toLowerCase() === 'destination' ? 'delivery' : 'transit',
              eta: idx === 0 ? "08:00 AM" : idx === 1 ? "01:15 PM" : "04:30 PM",
              packages: idx === 0 ? 0 : idx === 1 ? 5 : 12,
              completed: idx === 0
           }));
           
           setActiveShipment({
              id: shp101.id,
              mapData: {
                id: shp101.id,
                route: shp101.route,
                delaySegment: shp101.delaySegment
              },
              stops: newStops
           });
        }
      }
    };

    syncData();
    window.addEventListener('storage', syncData);
    window.addEventListener('shipments_updated', syncData);

    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('shipments_updated', syncData);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("driver_auth");
    router.push("/driver-login");
  };

  if (!mounted || isRedirecting) return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center">
       <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold tracking-widest uppercase text-xs">Authenticating...</p>
       </div>
    </div>
  );

  const { id, mapData, stops } = activeShipment;
  const totalPackages  = stops.reduce((s, st) => s + st.packages, 0);
  const completedStops = stops.filter(s => s.completed).length;

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">

      {/* ── Header ── */}
      <header className="bg-brand-navy text-white px-6 py-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
            RK
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Rajesh Kumar</h1>
            <div className="flex items-center gap-2 text-brand-orange text-sm font-medium">
              <Navigation className="w-4 h-4" /> Vehicle: BR01AB1234
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-green-500/20 text-green-300 text-xs font-bold px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> GPS Active
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Map + Alerts ── */}
        <div className={`flex flex-col gap-6 ${isDelivered ? 'lg:col-span-3' : 'lg:col-span-2'}`}>

          {/* Map OR Delivered State */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-[430px] lg:h-[520px] flex flex-col">
            {isDelivered ? (
              /* ── Waiting for new shipment screen ── */
              <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Shipment Delivered!</h2>
                  <p className="text-slate-500 text-sm max-w-sm">Great work! Your shipment has been marked as delivered. Waiting for the Operations Manager to assign a new shipment.</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-6 py-3 rounded-full text-sm font-semibold mb-4">
                  <Timer className="w-4 h-4 animate-pulse" /> Waiting for new shipment...
                </div>
                <button 
                  onClick={() => setIsDelivered(false)}
                  className="text-brand-navy font-bold text-sm hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back to Dashboard View
                </button>
              </div>
            ) : (
              /* ── Normal Map ── */
              <>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-orange" /> Route: {id}
                  </h2>
                  {mapData.delaySegment && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Delay Alert
                    </span>
                  )}
                </div>
                <div className="flex-1 min-h-0 relative z-0">
                  <DriverMap selectedShipment={mapData} />
                </div>
              </>
            )}
          </div>

          {/* Alerts — only visible when not delivered */}
          {!isDelivered && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Route Alerts
              </h2>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-3 items-start">
                <div className="bg-red-200 p-2 rounded-full text-red-700 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Heavy Traffic on NH19</h4>
                  <p className="text-red-700 text-xs mt-1">
                    Congestion between Delhi and Varanasi. ETA adjusted by +35 mins.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isDelivered && (
          <div className="flex flex-col gap-6">

          {/* Shipment Summary Card */}
          <div className="bg-brand-navy text-white rounded-2xl shadow-sm border border-[#1a4f76] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-brand-light/60 text-xs font-semibold tracking-widest uppercase">Active Shipment</p>
                <h2 className="font-black text-2xl mt-1">{id}</h2>
              </div>
              <div className="bg-brand-orange/20 p-3 rounded-xl">
                <Truck className="w-7 h-7 text-brand-orange" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
              <div className="text-center">
                <p className="text-brand-light/60 text-xs mb-1">Stops</p>
                <p className="font-bold text-lg">{stops.length}</p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-brand-light/60 text-xs mb-1">Packages</p>
                <p className="font-bold text-lg">{totalPackages}</p>
              </div>
              <div className="text-center">
                <p className="text-brand-light/60 text-xs mb-1">Done</p>
                <p className="font-bold text-lg">{completedStops}/{stops.length}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-orange h-2 rounded-full transition-all"
                  style={{ width: `${(completedStops / stops.length) * 100}%` }}
                />
              </div>
              <p className="text-brand-light/60 text-xs mt-1.5 text-right">
                {Math.round((completedStops / stops.length) * 100)}% complete
              </p>
            </div>
          </div>

          {/* Stop-by-Stop Route */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-brand-navy" /> Stop Details
            </h2>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-transparent" />

              <div className="space-y-6">
                {stops.map((stop, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {/* Circle indicator */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white shadow ${
                      stop.completed
                        ? "bg-green-500 text-white"
                        : idx === completedStops
                        ? "bg-brand-orange text-white animate-pulse"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {stop.completed
                        ? <CheckCircle2 className="w-5 h-5" />
                        : idx === completedStops
                        ? <Truck className="w-5 h-5" />
                        : <span className="font-bold text-sm">{idx + 1}</span>
                      }
                    </div>

                    {/* Stop info */}
                    <div className={`flex-1 pb-2 rounded-xl p-4 border-2 transition-colors ${
                      idx === completedStops
                        ? "border-brand-orange bg-orange-50"
                        : stop.completed
                        ? "border-green-100 bg-green-50"
                        : "border-slate-100 bg-slate-50"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{stop.name}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${stopTypeBadge[stop.type]}`}>
                            {stopTypeLabel[stop.type]}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs text-slate-500 justify-end">
                            <Clock className="w-3 h-3" /> {stop.eta}
                          </div>
                        </div>
                      </div>

                      {stop.packages > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                          <Box className="w-4 h-4 text-brand-navy shrink-0" />
                          <span className="text-xs font-bold text-brand-navy">
                            {stop.packages} packages to drop
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsDelivered(true)}
              disabled={isDelivered}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-sm font-bold transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-6 h-6" /> Mark Delivered
            </button>
            <button
              onClick={() => setShowHelpline(v => !v)}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-sm font-bold transition-colors shadow-sm"
            >
              <AlertTriangle className="w-6 h-6" /> Report Issue
            </button>
          </div>

          {/* Helpline — shown only when Report Issue clicked */}
          {showHelpline && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-4 animate-in fade-in">
              <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Driver Helpline</p>
                <a href="tel:+911800COURIER" className="text-xl font-black text-red-700 hover:underline">1800-COURIER</a>
                <p className="text-xs text-red-500 mt-0.5">Available 24/7 · Toll Free</p>
              </div>
            </div>
          )}
          </div>
        )}
      </main>
    </div>
  );
}
