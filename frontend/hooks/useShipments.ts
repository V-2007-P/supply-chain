import { useState, useEffect } from 'react';
import { decodePolyline } from '@/lib/polyline';

export interface Stop {
  lat: number;
  lng: number;
  name: string;
  type: string;
}

export interface Shipment {
  id: string;
  source: string;
  destination: string;
  status: string;
  risk: "Low" | "Medium" | "High";
  eta: string;
  delayReason: string | null;
  route: Stop[];
  suggestedRoute?: Stop[] | null;
  currentLocation?: { lat: number; lng: number };
  delaySegment?: { startIdx: number; endIdx: number; reason: string; type: string };
  detailedRoute?: { lat: number; lng: number }[];
  duration?: number;
  durationInTraffic?: number;
  trafficLevel?: "Low" | "Medium" | "High";
  trafficDelayText?: string;
}

const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: "SHP101",
    source: "Delhi",
    destination: "Patna",
    status: "In Transit",
    risk: "High",
    eta: "Delayed (+2h)",
    delayReason: "Heavy traffic on NH19",
    currentLocation: { lat: 26.5000, lng: 80.5000 },
    delaySegment: { startIdx: 0, endIdx: 1, reason: "Traffic Congestion", type: "traffic" },
    route: [
      { lat: 28.6139, lng: 77.2090, name: "Delhi Hub", type: "Origin" },
      { lat: 25.3176, lng: 82.9739, name: "Varanasi Transit", type: "Transit" },
      { lat: 25.5941, lng: 85.1376, name: "Patna Delivery", type: "Destination" }
    ]
  },
  {
    id: "SHP102",
    source: "Mumbai",
    destination: "Pune",
    status: "In Transit",
    risk: "Medium",
    eta: "Today, 6:00 PM",
    delayReason: "Light rain near Lonavala",
    currentLocation: { lat: 18.7500, lng: 73.4000 },
    route: [
      { lat: 19.0760, lng: 72.8777, name: "Mumbai Hub", type: "Origin" },
      { lat: 18.7500, lng: 73.4000, name: "Lonavala Checkpoint", type: "Transit" },
      { lat: 18.5204, lng: 73.8567, name: "Pune Delivery", type: "Destination" }
    ]
  },
  {
    id: "SHP103",
    source: "Bangalore",
    destination: "Chennai",
    status: "In Transit",
    risk: "Low",
    eta: "Tomorrow, 10:00 AM",
    delayReason: null,
    currentLocation: { lat: 12.9716, lng: 77.5946 },
    route: [
      { lat: 12.9716, lng: 77.5946, name: "Bangalore Hub", type: "Origin" },
      { lat: 13.0827, lng: 80.2707, name: "Chennai Hub", type: "Destination" }
    ]
  },
  {
    id: "SHP104",
    source: "Kolkata",
    destination: "Guwahati",
    status: "In Transit",
    risk: "High",
    eta: "Delayed (+1 Day)",
    delayReason: "Landslide near Siliguri",
    currentLocation: { lat: 26.7271, lng: 88.3953 },
    delaySegment: { startIdx: 0, endIdx: 1, reason: "Road Blocked", type: "weather" },
    route: [
      { lat: 22.5726, lng: 88.3639, name: "Kolkata Hub", type: "Origin" },
      { lat: 26.7271, lng: 88.3953, name: "Siliguri Transit", type: "Transit" },
      { lat: 26.1445, lng: 91.7362, name: "Guwahati Hub", type: "Destination" }
    ]
  },
  {
    id: "SHP105",
    source: "Hyderabad",
    destination: "Nagpur",
    status: "In Transit",
    risk: "Low",
    eta: "Today, 11:30 PM",
    delayReason: null,
    currentLocation: { lat: 19.5000, lng: 78.5000 },
    route: [
      { lat: 17.3850, lng: 78.4867, name: "Hyderabad Hub", type: "Origin" },
      { lat: 21.1458, lng: 79.0882, name: "Nagpur Hub", type: "Destination" }
    ]
  }
];

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let currentShipments = INITIAL_SHIPMENTS;
    const stored = localStorage.getItem('ops_shipments');
    if (stored) {
      currentShipments = JSON.parse(stored);
    } else {
      localStorage.setItem('ops_shipments', JSON.stringify(INITIAL_SHIPMENTS));
    }
    
    setShipments(currentShipments);
    setMounted(true);

    const enrichShipments = async () => {
      let updated = false;
      const enriched = await Promise.all(currentShipments.map(async (shipment) => {
        if (!shipment.detailedRoute && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
           try {
              const waypoints = shipment.route.slice(1, -1);
              const res = await fetch('/api/directions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      origin: shipment.route[0],
                      destination: shipment.route[shipment.route.length - 1],
                      waypoints: waypoints.length > 0 ? waypoints : undefined
                  })
              });
              
              if (res.ok) {
                  const data = await res.json();
                  const detailedRoute = decodePolyline(data.polyline);
                  
                  // Step 2: Traffic Detection Logic
                  let trafficLevel: "Low" | "Medium" | "High" = "Low";
                  let trafficDelayText = "";

                  if (data.durationInTraffic > data.duration * 1.3) trafficLevel = "High";
                  else if (data.durationInTraffic > data.duration * 1.1) trafficLevel = "Medium";

                  if (data.durationInTraffic > data.duration) {
                      const delayMins = Math.round((data.durationInTraffic - data.duration) / 60);
                      if (delayMins > 0) {
                          trafficDelayText = `+${delayMins} min`;
                      }
                  }

                  updated = true;
                  return { 
                      ...shipment, 
                      detailedRoute, 
                      duration: data.duration, 
                      durationInTraffic: data.durationInTraffic,
                      trafficLevel,
                      trafficDelayText
                  };
              }
           } catch (err) {
               console.error("Failed to enrich route for", shipment.id, err);
           }
        }
        return shipment;
      }));

      if (updated) {
          setShipments(enriched);
          localStorage.setItem('ops_shipments', JSON.stringify(enriched));
      }
    };

    enrichShipments();

    // Re-fetch traffic data from Directions API every 1 minute
    const trafficInterval = setInterval(() => {
      console.log('[SwiftRoute] Refreshing traffic data from Directions API...');
      enrichShipments();
    }, 60000);

    return () => clearInterval(trafficInterval);
  }, []);

  const updateShipmentRoute = async (id: string, newRoute: Stop[], newRisk: "Low" | "Medium" | "High", newDelayReason: string | null, newEta: string) => {
    // We should fetch new polyline for this updated route!
    let detailedRoute = undefined;
    let trafficLevel: "Low" | "Medium" | "High" = "Low";
    let trafficDelayText = "";

    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        try {
            const waypoints = newRoute.slice(1, -1);
            const res = await fetch('/api/directions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: newRoute[0],
                    destination: newRoute[newRoute.length - 1],
                    waypoints: waypoints.length > 0 ? waypoints : undefined
                })
            });
            if (res.ok) {
                const data = await res.json();
                detailedRoute = decodePolyline(data.polyline);
                if (data.durationInTraffic > data.duration * 1.3) trafficLevel = "High";
                else if (data.durationInTraffic > data.duration * 1.1) trafficLevel = "Medium";

                if (data.durationInTraffic > data.duration) {
                    const delayMins = Math.round((data.durationInTraffic - data.duration) / 60);
                    if (delayMins > 0) {
                        trafficDelayText = `+${delayMins} min`;
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch new route details", err);
        }
    }

    const updated = shipments.map(s => {
      if (s.id === id) {
        return {
          ...s,
          route: newRoute,
          detailedRoute: detailedRoute || s.detailedRoute,
          trafficLevel: trafficLevel || s.trafficLevel,
          trafficDelayText: trafficDelayText || s.trafficDelayText,
          suggestedRoute: null,
          risk: newRisk,
          delayReason: newDelayReason,
          eta: newEta,
          delaySegment: undefined
        };
      }
      return s;
    });
    
    setShipments(updated);
    localStorage.setItem('ops_shipments', JSON.stringify(updated));
    window.dispatchEvent(new Event('shipments_updated'));
  };

  return { shipments, updateShipmentRoute, mounted };
}
