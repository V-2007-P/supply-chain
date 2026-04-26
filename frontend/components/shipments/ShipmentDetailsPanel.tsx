"use client";

import { Shipment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Truck, AlertTriangle, CloudRain, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShipmentDetailsPanelProps {
  shipment: Shipment;
}

export function ShipmentDetailsPanel({ shipment }: ShipmentDetailsPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-green-500/10 text-green-500 border-green-500";
      case "DELAYED": return "bg-destructive/10 text-destructive border-destructive";
      case "HELD_AT_HUB": return "bg-orange-500/10 text-orange-500 border-orange-500";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500";
    }
  };

  // Dummy stops for the timeline
  const stops = [
    { name: "Delhi Origin Hub", status: "completed", time: "Oct 24, 08:00 AM", delay: false },
    { name: "Agra Transit", status: "completed", time: "Oct 24, 02:30 PM", delay: false },
    { name: "Kanpur Sorting Center", status: "completed", time: "Oct 25, 01:15 AM", delay: false },
    { name: "Varanasi Hub", status: "current", time: "Oct 25, 11:45 AM", delay: true, delayReason: "Heavy Traffic on NH19" },
    { name: "Patna Destination", status: "pending", time: "ETA: Oct 26, 09:00 AM", delay: false }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-card border-l">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold tracking-tight mb-1">{shipment.awb}</h2>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-4 h-4"/> {shipment.source}</span>
          <Truck className="w-4 h-4 text-muted-foreground mx-2" />
          <span className="text-sm text-muted-foreground flex items-center gap-1">{shipment.destination} <MapPin className="w-4 h-4"/></span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Status Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Current Status</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`px-3 py-1 ${getStatusColor(shipment.status)}`}>
                  {shipment.status.replace(/_/g, " ")}
                </Badge>
                {shipment.delay_minutes > 0 && (
                  <span className="text-sm text-destructive font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" /> +{shipment.delay_minutes} min
                  </span>
                )}
              </div>
              <p className="text-sm mt-1">Location: <span className="font-medium">{shipment.current_location}</span></p>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Journey Timeline</h3>
            <div className="relative border-l-2 border-muted ml-3 space-y-6 mt-4">
              {stops.map((stop, index) => (
                <div key={index} className="relative pl-6">
                  {/* Timeline Node */}
                  <span className={`absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-background ${
                    stop.status === 'completed' ? 'border-primary bg-primary' : 
                    stop.status === 'current' ? 'border-blue-500 animate-pulse' : 'border-muted'
                  }`}>
                    {stop.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                  </span>
                  
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${stop.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {stop.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{stop.time}</span>
                    
                    {stop.delay && (
                      <div className="mt-2 flex items-start gap-2 bg-destructive/10 text-destructive text-xs p-2 rounded-md border border-destructive/20">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{stop.delayReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Risk Factors */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Risk Assessment</h3>
            <Card className="bg-secondary/30">
              <CardContent className="p-4 space-y-2">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">Overall Risk</span>
                   <span className={`font-bold ${shipment.risk_score === 'HIGH' ? 'text-destructive' : shipment.risk_score === 'MEDIUM' ? 'text-orange-500' : 'text-green-500'}`}>
                     {shipment.risk_score}
                   </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground flex items-center gap-1"><CloudRain className="w-3 h-3"/> Weather</span>
                   <span>Clear</span>
                 </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
