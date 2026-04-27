"use client";

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useAppStore } from '@/lib/store';
import GoogleMapWrapper from '../GoogleMapWrapper';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

export default function LiveMap() {
  const shipments = useAppStore(state => state.shipments);
  const activeShipments = shipments.filter(s => s.status !== 'DELIVERED');
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const defaultCenter = { lat: 23.0, lng: 80.0 }; // Central India

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border">
      <GoogleMapWrapper>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={5}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: [
              { featureType: "poi", stylers: [{ visibility: "off" }] },
            ],
            mapTypeControl: false,
            streetViewControl: false,
          }}
        >
          {activeShipments.map((shipment) => (
            <Marker 
              key={shipment.id} 
              position={{ lat: shipment.lat, lng: shipment.lng }}
              icon={{
                url: shipment.risk_score === 'HIGH' 
                  ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                  : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                scaledSize: window.google ? new window.google.maps.Size(25, 41) : undefined,
              }}
              onClick={() => setActiveMarker(shipment.id)}
            >
              {activeMarker === shipment.id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="text-black text-sm font-sans min-w-[200px] p-1">
                    <strong className="block mb-1">{shipment.awb}</strong>
                    <p>Status: <span className="font-semibold">{shipment.status.replace(/_/g, ' ')}</span></p>
                    <p>Location: {shipment.current_location}</p>
                    <p>Risk: <span className={shipment.risk_score === 'HIGH' ? 'text-red-500 font-bold' : ''}>{shipment.risk_score}</span></p>
                    {shipment.delay_minutes > 0 && (
                      <p className="text-red-500">Delay: {shipment.delay_minutes} min</p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </GoogleMapWrapper>
    </div>
  );
}
