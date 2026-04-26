"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Shipment } from "@/types";

// Custom icons
const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2766/2766068.png", // Truck icon
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const stopIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowSize: [32, 32],
});

const delayIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowSize: [32, 32],
});

interface TrackingMapProps {
  shipment: Shipment;
}

export default function TrackingMap({ shipment }: TrackingMapProps) {
  // Hardcoded route: Delhi -> Agra -> Kanpur -> Varanasi -> Patna
  const routePoints: [number, number][] = [
    [28.7041, 77.1025], // Delhi
    [27.1767, 78.0081], // Agra
    [26.4499, 80.3319], // Kanpur
    [25.3176, 82.9739], // Varanasi
    [25.5941, 85.1376], // Patna
  ];

  const stops = [
    { name: "Delhi Origin Hub", pos: routePoints[0] },
    { name: "Agra Transit", pos: routePoints[1] },
    { name: "Kanpur Sorting Center", pos: routePoints[2] },
    { name: "Varanasi Hub", pos: routePoints[3] },
    { name: "Patna Destination", pos: routePoints[4] },
  ];

  // Interpolated detailed route for smooth animation
  const [detailedRoute, setDetailedRoute] = useState<[number, number][]>([]);
  const [truckPos, setTruckPos] = useState<[number, number]>(routePoints[0]);
  const animationRef = useRef<number>();
  const progressRef = useRef(0);

  useEffect(() => {
    // Generate interpolated points between major stops
    const generatePath = () => {
      const path: [number, number][] = [];
      const steps = 100; // frames per segment
      for (let i = 0; i < routePoints.length - 1; i++) {
        const p1 = routePoints[i];
        const p2 = routePoints[i + 1];
        for (let j = 0; j < steps; j++) {
          const t = j / steps;
          const lat = p1[0] + (p2[0] - p1[0]) * t;
          const lng = p1[1] + (p2[1] - p1[1]) * t;
          path.push([lat, lng]);
        }
      }
      path.push(routePoints[routePoints.length - 1]);
      return path;
    };

    const path = generatePath();
    setDetailedRoute(path);

    // Animation Loop
    const animateTruck = () => {
      progressRef.current += 0.3; // speed
      if (progressRef.current >= path.length) {
        progressRef.current = 0; // loop
      }
      
      const index = Math.floor(progressRef.current);
      if (path[index]) {
        setTruckPos(path[index]);
      }
      
      animationRef.current = requestAnimationFrame(animateTruck);
    };

    animationRef.current = requestAnimationFrame(animateTruck);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const center: [number, number] = [26.5, 81.0]; // Centered between Delhi and Patna

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles grayscale opacity-80" // Muted map style
        />

        {/* Regular Route Line */}
        <Polyline positions={routePoints} color="#3b82f6" weight={4} opacity={0.6} dashArray="8, 8" />
        
        {/* Disrupted Segment (Kanpur to Varanasi) */}
        <Polyline positions={[routePoints[2], routePoints[3]]} color="#ef4444" weight={5} opacity={0.8} />

        {/* Stops */}
        {stops.map((stop, i) => (
          <Marker key={i} position={stop.pos as [number, number]} icon={stopIcon}>
            <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
              <span className="font-semibold">{stop.name}</span>
            </Tooltip>
          </Marker>
        ))}

        {/* Delay Marker */}
        <Marker position={[(routePoints[2][0] + routePoints[3][0])/2, (routePoints[2][1] + routePoints[3][1])/2]} icon={delayIcon}>
          <Tooltip direction="right" offset={[10, -10]} opacity={1} permanent>
            <div className="text-destructive font-bold flex items-center gap-1">
              ⚠️ Heavy Traffic Delay
            </div>
          </Tooltip>
        </Marker>

        {/* Moving Truck */}
        {detailedRoute.length > 0 && (
          <Marker position={truckPos} icon={truckIcon} zIndexOffset={1000}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <span className="font-bold">{shipment.awb}</span>
            </Tooltip>
          </Marker>
        )}

      </MapContainer>
    </div>
  );
}
