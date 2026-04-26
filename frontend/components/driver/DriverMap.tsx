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

// Map Controller for smooth animations
function MapController({ center, bounds }: { center?: [number, number], bounds?: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    } else if (center) {
      map.flyTo(center, 10, { duration: 1.5 });
    }
  }, [center, bounds, map]);
  return null;
}

export type ShipmentStop = { lat: number; lng: number; type: string; name: string };
export type ShipmentData = {
  id: string;
  route: ShipmentStop[];
  delaySegment?: { startIdx: number; endIdx: number; reason: string };
};

interface DriverMapProps {
  selectedShipment: ShipmentData | null;
}

export default function DriverMap({ selectedShipment }: DriverMapProps) {
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | undefined>(undefined);

  // Geolocation Tracking
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverPos([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback location if permission denied
          setDriverPos([28.6139, 77.2090]); 
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setDriverPos([28.6139, 77.2090]); // Fallback
    }
  }, []);

  // Update bounds when shipment changes
  useEffect(() => {
    if (selectedShipment && selectedShipment.route.length > 0) {
      const coords = selectedShipment.route.map(r => [r.lat, r.lng] as [number, number]);
      if (driverPos) coords.push(driverPos);
      
      const bounds = L.latLngBounds(coords);
      setMapBounds(bounds);
    } else if (driverPos) {
      setMapBounds(undefined);
    }
  }, [selectedShipment, driverPos]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      
      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white p-3 rounded-lg shadow-md border border-slate-200 text-xs font-semibold space-y-2">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#0B3C5D] rounded-full"></div> Planned Route</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Traffic/Delay</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#FF6B00] rounded-full"></div> Driver Location</div>
      </div>

      <MapContainer 
        center={driverPos || [28.6139, 77.2090]} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapController center={!selectedShipment && driverPos ? driverPos : undefined} bounds={mapBounds} />

        {/* Driver Marker */}
        {driverPos && (
          <Marker position={driverPos} icon={truckMarker}>
            <Popup><div className="font-bold text-brand-navy">You (Driver)</div>Live Location</Popup>
          </Marker>
        )}

        {/* Shipment Route */}
        {selectedShipment && (
          <>
            {/* Draw base blue polyline for entire route */}
            <Polyline 
              positions={selectedShipment.route.map(r => [r.lat, r.lng])} 
              color="#0B3C5D" 
              weight={4} 
              dashArray="5, 10" 
            />

            {/* Draw red polyline over delayed segment if exists */}
            {selectedShipment.delaySegment && (
              <Polyline 
                positions={selectedShipment.route.slice(selectedShipment.delaySegment.startIdx, selectedShipment.delaySegment.endIdx + 1).map(r => [r.lat, r.lng])} 
                color="#EF4444" 
                weight={6} 
                className="animate-pulse"
              />
            )}

            {/* Draw Stop Markers */}
            {selectedShipment.route.map((stop, idx) => {
              const isDelayStop = selectedShipment.delaySegment && idx >= selectedShipment.delaySegment.startIdx && idx <= selectedShipment.delaySegment.endIdx;
              
              return (
                <Marker key={idx} position={[stop.lat, stop.lng]} icon={isDelayStop ? delayMarker : customMarker}>
                  <Popup>
                    <div className="font-bold">{stop.name}</div>
                    <div className="text-xs text-slate-500">{stop.type.toUpperCase()}</div>
                    {isDelayStop && <div className="text-red-500 text-xs font-bold mt-1">⚠️ {selectedShipment.delaySegment?.reason}</div>}
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  );
}
