"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Calendar, CheckCircle2, Truck, AlertTriangle, User, Navigation, ArrowRight, Search } from "lucide-react";
import Link from "next/link";

// Disable SSR for the map
const CustomerTrackingMap = dynamic(() => import('@/components/landing/CustomerTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 font-medium">
      Loading Live Map...
    </div>
  )
});

// Dummy database
const DUMMY_SHIPMENTS: Record<string, any> = {
  "123456": {
    id: "123456",
    customer: "Amit Sharma",
    agent: "Ramesh Singh",
    source: "Delhi",
    destination: "Patna",
    status: "In Transit",
    eta: "2 days (Oct 28, 2024)",
    lastUpdated: "10 mins ago",
    currentLocationText: "Near Varanasi",
    delay: { reason: "Traffic congestion on NH19", type: "traffic" },
    route: [
      { lat: 28.6139, lng: 77.2090, name: "Delhi Hub", type: "Origin" },
      { lat: 25.3176, lng: 82.9739, name: "Varanasi Transit", type: "Transit" },
      { lat: 25.5941, lng: 85.1376, name: "Patna Delivery", type: "Destination" }
    ],
    currentLocation: { lat: 25.3500, lng: 82.8000 },
    delaySegment: { startIdx: 0, endIdx: 1, reason: "Heavy Traffic", type: "traffic" },
    timeline: [
      { status: "Order Created", date: "Oct 24, 09:00 AM", completed: true },
      { status: "Picked Up", date: "Oct 24, 02:30 PM", completed: true },
      { status: "In Transit", date: "Oct 25, 11:15 AM", completed: true, current: true },
      { status: "Out for Delivery", date: "Pending", completed: false },
      { status: "Delivered", date: "Pending", completed: false }
    ]
  },
  "654321": {
    id: "654321",
    customer: "Priya Patel",
    agent: "Suresh Kumar",
    source: "Mumbai",
    destination: "Pune",
    status: "Out for Delivery",
    eta: "Today, by 6:00 PM",
    lastUpdated: "5 mins ago",
    currentLocationText: "Arriving at destination city",
    delay: null,
    route: [
      { lat: 19.0760, lng: 72.8777, name: "Mumbai Hub", type: "Origin" },
      { lat: 18.7500, lng: 73.4000, name: "Lonavala Checkpoint", type: "Transit" },
      { lat: 18.5204, lng: 73.8567, name: "Pune Delivery", type: "Destination" }
    ],
    currentLocation: { lat: 18.6000, lng: 73.7500 },
    delaySegment: undefined,
    timeline: [
      { status: "Order Created", date: "Oct 25, 10:00 AM", completed: true },
      { status: "Picked Up", date: "Oct 25, 01:00 PM", completed: true },
      { status: "In Transit", date: "Oct 25, 05:00 PM", completed: true },
      { status: "Out for Delivery", date: "Oct 26, 08:30 AM", completed: true, current: true },
      { status: "Delivered", date: "Pending", completed: false }
    ]
  },
  "987654": {
    id: "987654",
    customer: "Rahul Verma",
    agent: "Vikash",
    source: "Bangalore",
    destination: "Chennai",
    status: "Delivered",
    eta: "Delivered on Oct 25",
    lastUpdated: "1 day ago",
    currentLocationText: "Delivered",
    delay: null,
    route: [
      { lat: 12.9716, lng: 77.5946, name: "Bangalore Hub", type: "Origin" },
      { lat: 13.0827, lng: 80.2707, name: "Chennai Hub", type: "Destination" }
    ],
    currentLocation: { lat: 13.0827, lng: 80.2707 },
    delaySegment: undefined,
    timeline: [
      { status: "Order Created", date: "Oct 23, 11:00 AM", completed: true },
      { status: "Picked Up", date: "Oct 23, 04:00 PM", completed: true },
      { status: "In Transit", date: "Oct 24, 08:00 AM", completed: true },
      { status: "Out for Delivery", date: "Oct 25, 09:00 AM", completed: true },
      { status: "Delivered", date: "Oct 25, 02:15 PM", completed: true, current: true }
    ]
  }
};

export default function TrackPage({ params }: { params: { id: string } }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [searchId, setSearchId] = useState("");
  const [shipment, setShipment] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    const syncData = () => {
      let currentShipment = DUMMY_SHIPMENTS[params.id];
      const stored = localStorage.getItem('ops_shipments');
      if (stored && currentShipment) {
         const shipments = JSON.parse(stored);
         const opsData = shipments.find((s: any) => s.id === params.id);
         if (opsData) {
            currentShipment = {
              ...currentShipment,
              route: opsData.route,
              delaySegment: opsData.delaySegment,
              delay: opsData.delayReason ? { reason: opsData.delayReason, type: 'traffic' } : null,
              eta: opsData.eta,
              risk: opsData.risk
            };
         }
      }
      setShipment(currentShipment);
    };

    syncData();
    window.addEventListener('storage', syncData);
    window.addEventListener('shipments_updated', syncData);

    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('shipments_updated', syncData);
    };
  }, [params.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(searchId)) {
      router.push(`/track/${searchId}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-brand-navy pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Shipment Tracking</h1>
          <p className="text-brand-light/80 text-lg max-w-2xl mx-auto mb-8 font-medium">
            Real-time updates and live location for your package.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        {!shipment ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 md:p-16 text-center max-w-2xl mx-auto border border-slate-100">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Shipment Not Found</h2>
            <p className="text-slate-500 mb-10 text-lg">We couldn't find any active shipment with the tracking ID <strong className="text-slate-900">"{params.id}"</strong>. Please check the ID and try again.</p>
            
            <form onSubmit={handleSearch} className="max-w-md mx-auto flex flex-col gap-3">
              <input 
                type="text" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter 6-digit Tracking ID"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange text-lg placeholder:text-slate-400 font-medium transition-all"
              />
              <button 
                type="submit"
                className="w-full bg-brand-orange hover:bg-[#e66000] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                Track Again <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Details & Timeline */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              
              {/* Shipment Overview Card */}
              <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500 mb-1 font-semibold uppercase tracking-wider">Tracking ID</p>
                    <h2 className="text-3xl font-black text-brand-navy tracking-tight">{shipment.id}</h2>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm ${
                    shipment.status === 'Delivered' ? 'bg-green-100 text-green-700 border border-green-200' :
                    shipment.status === 'Out for Delivery' ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30' :
                    'bg-blue-50 text-brand-navy border border-blue-100'
                  }`}>
                    {shipment.status}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Customer</p>
                      <p className="font-bold text-slate-900 text-lg">{shipment.customer}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <MapPin className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Route</p>
                      <p className="font-bold text-slate-900 text-lg">{shipment.source} <span className="text-slate-400 mx-1 font-normal">→</span> {shipment.destination}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <Calendar className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Delivery</p>
                      <p className="font-bold text-brand-orange text-lg">{shipment.eta}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 md:p-8">
                <h3 className="font-black text-xl text-slate-900 mb-8 flex items-center gap-2 tracking-tight">
                  <Clock className="w-6 h-6 text-brand-orange" /> Tracking Timeline
                </h3>
                
                <div className="relative pl-2">
                  {/* Vertical Line */}
                  <div className="absolute top-2 bottom-2 left-[19px] w-[3px] bg-slate-100 rounded-full"></div>
                  
                  <div className="space-y-8 relative z-10">
                    {shipment.timeline.map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-6">
                        <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center shadow-sm border-[3px] z-10 transition-all ${
                          step.completed ? (step.current ? 'bg-brand-orange border-brand-orange text-white ring-4 ring-brand-orange/20 scale-110' : 'bg-green-500 border-green-500 text-white') : 'bg-slate-50 border-slate-200 text-transparent'
                        }`}>
                          {step.completed && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div className={`mt-0.5 ${!step.completed ? 'opacity-50' : ''}`}>
                          <p className={`font-black text-base tracking-tight ${step.current ? 'text-brand-orange' : 'text-slate-900'}`}>{step.status}</p>
                          <p className="text-sm text-slate-500 font-medium mt-0.5">{step.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Map & Live Info */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              
              {/* Delay Alert */}
              {shipment.delay && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0 border border-red-200 shadow-sm mt-0.5">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-red-900 text-lg">Shipment Delayed</h4>
                    <p className="text-red-700 font-medium mt-1">{shipment.delay.reason}</p>
                  </div>
                </div>
              )}

              {/* Map Container */}
              <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-2 h-[500px] lg:h-[750px] flex flex-col relative overflow-hidden">
                
                {/* Map Overlay Info */}
                <div className="absolute top-6 left-6 right-6 z-[1000] flex flex-col sm:flex-row justify-between items-start gap-4 pointer-events-none">
                  
                  {/* Current Location Badge */}
                  <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 pointer-events-auto transition-transform hover:scale-105">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                      <Navigation className="w-4 h-4 text-brand-orange" /> Current Location
                    </div>
                    <div className="font-black text-brand-navy text-lg leading-tight">{shipment.currentLocationText}</div>
                    <div className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Updated {shipment.lastUpdated}
                    </div>
                  </div>

                  {/* Delivery Agent Badge */}
                  <div className="bg-white/95 backdrop-blur-md pl-3 pr-5 py-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 pointer-events-auto transition-transform hover:scale-105">
                    <div className="w-10 h-10 bg-brand-navy rounded-full flex items-center justify-center shadow-inner">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Delivery Agent</div>
                      <div className="font-black text-slate-900 text-base">{shipment.agent}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 rounded-2xl overflow-hidden relative shadow-inner">
                  <CustomerTrackingMap 
                    route={shipment.route}
                    currentLocation={shipment.currentLocation}
                    delaySegment={shipment.delaySegment}
                  />
                </div>
              </div>
              
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
