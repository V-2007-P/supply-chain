"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrackingMapWrapper from "@/components/shipments/TrackingMapWrapper";
import { ShipmentDetailsPanel } from "@/components/shipments/ShipmentDetailsPanel";

export default function ShipmentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const shipments = useAppStore(state => state.shipments);
  
  // Find the shipment or use a fallback mock if store is empty (e.g. direct navigation)
  const shipment = shipments.find(s => s.id === params.id) || shipments[0] || {
    id: params.id,
    awb: "FXND" + Math.floor(Math.random() * 100000) + "IN",
    source: "Delhi",
    destination: "Patna",
    current_location: "Varanasi",
    current_hub: "Varanasi Hub",
    status: "DELAYED",
    risk_score: "HIGH",
    delay_minutes: 120,
    edd: new Date().toISOString(),
    last_scan_time: new Date().toISOString(),
    lat: 25.3176,
    lng: 82.9739,
    created_at: new Date().toISOString()
  };

  return (
    <div className="h-[calc(100vh-4rem)] -m-6 flex flex-col bg-background">
      {/* Top Header Bar */}
      <div className="h-14 border-b bg-card flex items-center px-4 gap-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push('/shipments')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Tracking: {shipment.awb}</h1>
        </div>
      </div>

      {/* Main Content (Map + Side Panel) */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Map Area */}
        <div className="flex-1 h-full z-0 relative">
          <TrackingMapWrapper shipment={shipment} />
        </div>

        {/* Side Panel */}
        <div className="w-[380px] shrink-0 h-full shadow-2xl z-10 relative">
          <ShipmentDetailsPanel shipment={shipment} />
        </div>
      </div>
    </div>
  );
}
