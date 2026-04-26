"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icons
const customMarker = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const truckMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [1, -40],
});

const delayMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapController({ bounds }: { bounds?: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export interface TrackingMapProps {
  route: { lat: number; lng: number; name: string; type: string }[];
  currentLocation: { lat: number; lng: number };
  delaySegment?: { startIdx: number; endIdx: number; reason: string; type: 'traffic' | 'weather' };
}

export default function CustomerTrackingMap({ route, currentLocation, delaySegment }: TrackingMapProps) {
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | undefined>(undefined);

  useEffect(() => {
    if (route.length > 0) {
      const coords = route.map(r => [r.lat, r.lng] as [number, number]);
      coords.push([currentLocation.lat, currentLocation.lng]);
      const bounds = L.latLngBounds(coords);
      setMapBounds(bounds);
    }
  }, [route, currentLocation]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={[currentLocation.lat, currentLocation.lng]} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        {mapBounds && <MapController bounds={mapBounds} />}

        {/* Base route */}
        <Polyline 
          positions={route.map(r => [r.lat, r.lng])} 
          color="#0B3C5D" 
          weight={4} 
          dashArray="5, 10" 
        />

        {/* Delayed segment */}
        {delaySegment && (
          <Polyline 
            positions={route.slice(delaySegment.startIdx, delaySegment.endIdx + 1).map(r => [r.lat, r.lng])} 
            color="#EF4444" 
            weight={6} 
            className="animate-pulse"
          />
        )}

        {/* Stops */}
        {route.map((stop, idx) => {
          const isDelayStop = delaySegment && idx >= delaySegment.startIdx && idx <= delaySegment.endIdx;
          return (
            <Marker key={idx} position={[stop.lat, stop.lng]} icon={isDelayStop ? delayMarker : customMarker}>
              <Popup>
                <div className="font-bold">{stop.name}</div>
                <div className="text-xs text-slate-500">{stop.type}</div>
                {isDelayStop && <div className="text-red-500 text-xs font-bold mt-1">⚠️ {delaySegment.reason}</div>}
              </Popup>
            </Marker>
          );
        })}

        {/* Current Location (Truck) */}
        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={truckMarker}>
          <Popup>
            <div className="font-bold text-brand-orange">Current Location</div>
            <div className="text-xs">Live Update</div>
          </Popup>
        </Marker>

      </MapContainer>
    </div>
  );
}
