"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, Polyline, Marker, InfoWindow, TrafficLayer } from "@react-google-maps/api";
import { Shipment } from "@/types";
import GoogleMapWrapper from "../GoogleMapWrapper";

interface TrackingMapProps {
  shipment: Shipment;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

export default function TrackingMap({ shipment }: TrackingMapProps) {
  const routePoints = [
    { lat: 28.7041, lng: 77.1025 }, // Delhi
    { lat: 27.1767, lng: 78.0081 }, // Agra
    { lat: 26.4499, lng: 80.3319 }, // Kanpur
    { lat: 25.3176, lng: 82.9739 }, // Varanasi
    { lat: 25.5941, lng: 85.1376 }, // Patna
  ];

  const stops = [
    { name: "Delhi Origin Hub", pos: routePoints[0] },
    { name: "Agra Transit", pos: routePoints[1] },
    { name: "Kanpur Sorting Center", pos: routePoints[2] },
    { name: "Varanasi Hub", pos: routePoints[3] },
    { name: "Patna Destination", pos: routePoints[4] },
  ];

  const [detailedRoute, setDetailedRoute] = useState<{lat: number, lng: number}[]>([]);
  const [truckPos, setTruckPos] = useState(routePoints[0]);
  const animationRef = useRef<number>();
  const progressRef = useRef(0);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  useEffect(() => {
    const generatePath = () => {
      const path: {lat: number, lng: number}[] = [];
      const steps = 100;
      for (let i = 0; i < routePoints.length - 1; i++) {
        const p1 = routePoints[i];
        const p2 = routePoints[i + 1];
        for (let j = 0; j < steps; j++) {
          const t = j / steps;
          const lat = p1.lat + (p2.lat - p1.lat) * t;
          const lng = p1.lng + (p2.lng - p1.lng) * t;
          path.push({lat, lng});
        }
      }
      path.push(routePoints[routePoints.length - 1]);
      return path;
    };

    const path = generatePath();
    setDetailedRoute(path);

    const animateTruck = () => {
      progressRef.current += 0.3;
      if (progressRef.current >= path.length) {
        progressRef.current = 0;
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

  const center = { lat: 26.5, lng: 81.0 }; // Centered between Delhi and Patna

  return (
    <div className="h-full w-full relative z-0">
      <GoogleMapWrapper>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={6}
          options={{
            styles: [
              { featureType: "all", stylers: [{ saturation: -80 }] }, // Grayscale-like
            ],
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: false,
          }}
        >
          {/* Regular Route Line */}
          <Polyline 
            path={routePoints} 
            options={{ strokeColor: "#3b82f6", strokeWeight: 4, strokeOpacity: 0.6 }} 
          />
          
          {/* Disrupted Segment (Kanpur to Varanasi) */}
          <Polyline 
            path={[routePoints[2], routePoints[3]]} 
            options={{ strokeColor: "#ef4444", strokeWeight: 5, strokeOpacity: 0.8 }} 
          />

          {/* Stops */}
          {stops.map((stop, i) => (
            <Marker 
              key={i} 
              position={stop.pos} 
              icon={{
                url: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                scaledSize: window.google ? new window.google.maps.Size(20, 32) : undefined,
              }}
              onClick={() => setActiveMarker(`stop-${i}`)}
            >
              {activeMarker === `stop-${i}` && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <span className="font-semibold text-black p-1">{stop.name}</span>
                </InfoWindow>
              )}
            </Marker>
          ))}

          {/* Delay Marker */}
          <Marker 
            position={{
              lat: (routePoints[2].lat + routePoints[3].lat) / 2, 
              lng: (routePoints[2].lng + routePoints[3].lng) / 2
            }}
            icon={{
              url: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              scaledSize: window.google ? new window.google.maps.Size(20, 32) : undefined,
            }}
            onClick={() => setActiveMarker("delay")}
          >
            {activeMarker === "delay" && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="text-red-600 font-bold flex items-center gap-1 p-1">
                  ⚠️ Heavy Traffic Delay
                </div>
              </InfoWindow>
            )}
          </Marker>

          {/* Moving Truck */}
          {detailedRoute.length > 0 && (
            <Marker 
              position={truckPos} 
              icon={{
                url: "https://cdn-icons-png.flaticon.com/512/2766/2766068.png",
                scaledSize: window.google ? new window.google.maps.Size(32, 32) : undefined,
                anchor: window.google ? new window.google.maps.Point(16, 16) : undefined,
              }}
              onClick={() => setActiveMarker("truck")}
              zIndex={1000}
            >
              {activeMarker === "truck" && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <span className="font-bold text-black p-1">{shipment.awb}</span>
                </InfoWindow>
              )}
            </Marker>
          )}

          <TrafficLayer />
        </GoogleMap>
      </GoogleMapWrapper>
    </div>
  );
}
