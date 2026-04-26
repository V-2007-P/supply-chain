"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Shipment } from '@/hooks/useShipments';
import type { ShipmentContext } from '@/hooks/useWeather';

// Icons
const stopMarker = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -26],
});

const truckMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -35],
});

const delayStopMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -26],
});

function GlobalBounds({ shipments }: { shipments: Shipment[] }) {
  const map = useMap();
  useEffect(() => {
    if (shipments.length > 0) {
      const allCoords: [number, number][] = [];
      shipments.forEach(s => {
        s.route.forEach(r => allCoords.push([r.lat, r.lng]));
        if (s.currentLocation) allCoords.push([s.currentLocation.lat, s.currentLocation.lng]);
        if (s.suggestedRoute) {
            s.suggestedRoute.forEach(r => allCoords.push([r.lat, r.lng]));
        }
      });
      if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [30, 30] });
      }
    }
  }, [shipments, map]);
  return null;
}

export default function OpsMap({ shipments, focusedShipmentId, contexts }: { shipments: Shipment[], focusedShipmentId: string | null, contexts?: Record<string, ShipmentContext> }) {
  
  const displayShipments = focusedShipmentId 
    ? shipments.filter(s => s.id === focusedShipmentId)
    : shipments;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative z-0">
      <MapContainer 
        center={[22.5, 78.5]} // roughly center of India
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        <GlobalBounds shipments={displayShipments} />

        {displayShipments.map(shipment => {
          const color = shipment.risk === 'High' ? '#EF4444' : shipment.risk === 'Medium' ? '#F97316' : '#0ea5e9';
          
          return (
            <div key={shipment.id}>
              {/* Base Route */}
              <Polyline 
                positions={shipment.route.map(r => [r.lat, r.lng])} 
                color={color} 
                weight={4} 
                opacity={0.8}
                dashArray={shipment.risk !== 'Low' ? "5, 10" : undefined}
              />

              {/* Delay Segment Highlight */}
              {shipment.delaySegment && (
                <Polyline 
                  positions={shipment.route.slice(shipment.delaySegment.startIdx, shipment.delaySegment.endIdx + 1).map(r => [r.lat, r.lng])} 
                  color="#DC2626" 
                  weight={6} 
                  className="animate-pulse"
                />
              )}

              {/* Suggested Route Highlight */}
              {shipment.suggestedRoute && (
                <Polyline 
                  positions={shipment.suggestedRoute.map(r => [r.lat, r.lng])} 
                  color="#10B981" 
                  weight={4} 
                  dashArray="10, 10"
                  className="animate-pulse"
                />
              )}

              {/* Stops */}
              {shipment.route.map((stop, idx) => {
                const isDelayStop = shipment.delaySegment && idx >= shipment.delaySegment.startIdx && idx <= shipment.delaySegment.endIdx;
                return (
                  <Marker key={`stop-${idx}`} position={[stop.lat, stop.lng]} icon={isDelayStop ? delayStopMarker : stopMarker}>
                    <Popup>
                      <div className="font-bold">{stop.name}</div>
                      <div className="text-xs text-slate-500">{stop.type} - {shipment.id}</div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Suggested Route Stops */}
              {shipment.suggestedRoute?.map((stop, idx) => (
                  <Marker key={`sug-stop-${idx}`} position={[stop.lat, stop.lng]} icon={stopMarker}>
                    <Popup>
                      <div className="font-bold text-green-600">Suggested: {stop.name}</div>
                    </Popup>
                  </Marker>
              ))}

              {/* Current Truck Location */}
              {shipment.currentLocation && (
                <Marker position={[shipment.currentLocation.lat, shipment.currentLocation.lng]} icon={truckMarker}>
                  <Popup>
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
                  </Popup>
                </Marker>
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
