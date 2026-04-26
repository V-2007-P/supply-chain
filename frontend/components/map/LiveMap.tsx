"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppStore } from '@/lib/store';

// Fix leafet icon paths
const customMarker = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redMarker = new L.Icon({
  ...customMarker.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
});

export default function LiveMap() {
  const shipments = useAppStore(state => state.shipments);
  const activeShipments = shipments.filter(s => s.status !== 'DELIVERED');

  const defaultCenter: [number, number] = [23.0, 80.0]; // Central India

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {activeShipments.map((shipment) => (
          <Marker 
            key={shipment.id} 
            position={[shipment.lat, shipment.lng]}
            icon={shipment.risk_score === 'HIGH' ? redMarker : customMarker}
          >
            <Popup>
              <div className="text-sm font-sans min-w-[200px]">
                <strong className="block mb-1">{shipment.awb}</strong>
                <p>Status: <span className="font-semibold">{shipment.status.replace(/_/g, ' ')}</span></p>
                <p>Location: {shipment.current_location}</p>
                <p>Risk: <span className={shipment.risk_score === 'HIGH' ? 'text-red-500 font-bold' : ''}>{shipment.risk_score}</span></p>
                {shipment.delay_minutes > 0 && (
                  <p className="text-red-500">Delay: {shipment.delay_minutes} min</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
