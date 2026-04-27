"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, Polyline, Marker, InfoWindow, TrafficLayer } from '@react-google-maps/api';
import type { Shipment } from '@/hooks/useShipments';
import type { ShipmentContext } from '@/hooks/useWeather';
import GoogleMapWrapper from '../GoogleMapWrapper';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

const center = { lat: 22.5, lng: 78.5 }; // Center of India

// Calculate accurate heading between two LatLng points
function getHeading(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

export default function OpsMap({ 
  shipments, 
  focusedShipmentId, 
  contexts 
}: { 
  shipments: Shipment[], 
  focusedShipmentId: string | null, 
  contexts?: Record<string, ShipmentContext> 
}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const displayShipments = focusedShipmentId 
    ? shipments.filter(s => s.id === focusedShipmentId)
    : shipments;

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Animation Refs
  const truckMarkersRef = useRef<Record<string, google.maps.Marker>>({});
  const animationProgressRef = useRef<Record<string, number>>({});
  const animationFrameRef = useRef<number>();

  // Fit bounds when shipments change
  useEffect(() => {
    if (map && displayShipments.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasPoints = false;
      
      displayShipments.forEach(s => {
        if (s.detailedRoute && s.detailedRoute.length > 0) {
          s.detailedRoute.forEach(r => bounds.extend(new window.google.maps.LatLng(r.lat, r.lng)));
          hasPoints = true;
        } else {
          s.route.forEach(r => bounds.extend(new window.google.maps.LatLng(r.lat, r.lng)));
          hasPoints = true;
        }
      });
      
      if (hasPoints) {
        map.fitBounds(bounds, 50); // 50px padding
      }
    }
  }, [map, displayShipments]);

  // High-Performance Truck Animation Loop
  useEffect(() => {
    if (!window.google) return;
    
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      
      displayShipments.forEach(shipment => {
         const marker = truckMarkersRef.current[shipment.id];
         if (!marker) return;
         
         const path = shipment.detailedRoute || shipment.route;
         if (path.length < 2) return;
         
         if (animationProgressRef.current[shipment.id] === undefined) {
            animationProgressRef.current[shipment.id] = 0;
         }
         
         // Dynamically adjust speed: if it's a detailed polyline, it has way more points.
         // If it's a straight line, it has fewer points.
         // Kept slow for realistic truck movement feel.
         const pointsScale = shipment.detailedRoute ? 0.0004 : 0.00004;
         const speed = pointsScale * dt; 
         
         let prog = animationProgressRef.current[shipment.id];
         prog += speed;
         
         if (prog >= path.length - 1) {
             prog = 0; // loop back to origin
         }
         
         animationProgressRef.current[shipment.id] = prog;
         
         const index = Math.floor(prog);
         const nextIndex = Math.min(index + 1, path.length - 1);
         const t = prog - index;
         
         const p1 = path[index];
         const p2 = path[nextIndex];
         
         // Guard against undefined points during state transitions
         if (!p1 || !p2) return;
         
         const lat = p1.lat + (p2.lat - p1.lat) * t;
         const lng = p1.lng + (p2.lng - p1.lng) * t;
         
         let heading = 0;
         if (p1.lat !== p2.lat || p1.lng !== p2.lng) {
             heading = getHeading(p1.lat, p1.lng, p2.lat, p2.lng);
         }

         // Directly manipulate the Google Maps instance for 60fps performance
         marker.setPosition({ lat, lng });
         marker.setIcon({
            path: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
            fillColor: "#0B3C5D", // Brand Navy
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#ffffff",
            scale: 1.2,
            rotation: heading - 90, // The SVG path faces right natively (90 degrees). Subtract 90 to align with North.
            anchor: new window.google.maps.Point(12, 12),
         });
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [displayShipments]);

  return (
    <div className="h-full w-full relative z-0">
      <GoogleMapWrapper>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={5}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: [
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }, { lightness: 17 }] },
              { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }, { lightness: 20 }] },
            ],
            mapTypeControl: false,
            streetViewControl: false,
          }}
        >
          {displayShipments.map(shipment => {
            // Visualize traffic cleanly
            const color = shipment.trafficLevel === 'High' ? '#EF4444' : shipment.trafficLevel === 'Medium' ? '#F97316' : '#10B981';
            
            // The path to draw
            const path = shipment.detailedRoute 
                ? shipment.detailedRoute 
                : shipment.route.map(r => ({ lat: r.lat, lng: r.lng }));

            // Delay segment logic (if detailedRoute exists, this would need to map to the polyline, but for now we apply it to the whole line or ignore)
            const delayPath = shipment.delaySegment && !shipment.detailedRoute
              ? shipment.route.slice(shipment.delaySegment.startIdx, shipment.delaySegment.endIdx + 1).map(r => ({ lat: r.lat, lng: r.lng }))
              : null;

            return (
              <React.Fragment key={shipment.id}>
                {/* Base Route */}
                <Polyline 
                  path={path}
                  options={{
                    strokeColor: color,
                    strokeOpacity: 0.9,
                    strokeWeight: 5,
                  }}
                />

                {/* Delay Segment Highlight */}
                {delayPath && (
                  <Polyline 
                    path={delayPath}
                    options={{
                      strokeColor: "#DC2626",
                      strokeOpacity: 1.0,
                      strokeWeight: 7,
                    }}
                  />
                )}

                {/* Suggested Route Highlight */}
                {shipment.suggestedRoute && (
                  <Polyline 
                    path={shipment.suggestedRoute.map(r => ({ lat: r.lat, lng: r.lng }))}
                    options={{
                      strokeColor: "#10B981",
                      strokeOpacity: 1.0,
                      strokeWeight: 4,
                      zIndex: 10,
                      geodesic: true
                    }}
                  />
                )}

                {/* Stops */}
                {shipment.route.map((stop, idx) => {
                  const isDelayStop = shipment.delaySegment && idx >= shipment.delaySegment.startIdx && idx <= shipment.delaySegment.endIdx;
                  return (
                    <Marker 
                      key={`stop-${idx}`} 
                      position={{ lat: stop.lat, lng: stop.lng }}
                      icon={{
                        url: isDelayStop 
                          ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                          : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        scaledSize: window.google ? new window.google.maps.Size(20, 32) : undefined,
                      }}
                      onClick={() => setActiveMarker(`${shipment.id}-stop-${idx}`)}
                    >
                      {activeMarker === `${shipment.id}-stop-${idx}` && (
                        <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                          <div className="text-black p-1">
                            <div className="font-bold">{stop.name}</div>
                            <div className="text-xs text-slate-500">{stop.type} - {shipment.id}</div>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  );
                })}

                {/* Animated Truck Component */}
                <Marker 
                  onLoad={(marker) => { truckMarkersRef.current[shipment.id] = marker; }}
                  onUnmount={() => { delete truckMarkersRef.current[shipment.id]; }}
                  position={{ lat: path[0].lat, lng: path[0].lng }}
                  onClick={() => setActiveMarker(`${shipment.id}-truck`)}
                  zIndex={100}
                >
                  {activeMarker === `${shipment.id}-truck` && (
                    <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                      <div className="text-black p-1 min-w-[120px]">
                        <div className="font-bold text-brand-navy">{shipment.id}</div>
                        <div className="text-xs font-semibold" style={{color}}>Risk: {shipment.risk}</div>
                        {shipment.delayReason && <div className="text-xs text-red-500 mt-1">{shipment.delayReason}</div>}
                        {contexts && contexts[shipment.id] && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                {contexts[shipment.id].weather?.icon && <img src={contexts[shipment.id].weather?.icon} className="w-5 h-5 bg-slate-100 rounded-full" />}
                                {contexts[shipment.id].weather?.temp}°C
                              </div>
                              <div className="text-[10px] text-slate-500 uppercase mt-1">Traffic: {contexts[shipment.id].traffic}</div>
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              </React.Fragment>
            );
          })}
          
          <TrafficLayer />
        </GoogleMap>
      </GoogleMapWrapper>

      {/* Legend UI */}
      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 z-[1000] text-sm hidden md:block">
        <h4 className="font-black text-slate-800 mb-2 uppercase tracking-wide text-xs">Live Traffic Legend</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1.5 rounded-full bg-[#10B981]"></div>
            <span className="text-slate-600 font-bold text-xs">Low Traffic (Smooth)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1.5 rounded-full bg-[#F97316]"></div>
            <span className="text-slate-600 font-bold text-xs">Medium Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1.5 rounded-full bg-[#EF4444]"></div>
            <span className="text-slate-600 font-bold text-xs">High Traffic (Delayed)</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
            <div className="w-6 flex justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-brand-navy">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <span className="text-slate-600 font-bold text-xs">Active Shipment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
