"use client";

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Polyline, Marker, InfoWindow } from '@react-google-maps/api';
import GoogleMapWrapper from '../GoogleMapWrapper';

export type ShipmentStop = { lat: number; lng: number; type: string; name: string };
export type ShipmentData = {
  id: string;
  route: ShipmentStop[];
  delaySegment?: { startIdx: number; endIdx: number; reason: string };
  detailedRoute?: { lat: number; lng: number }[];
};

interface DriverMapProps {
  selectedShipment: ShipmentData | null;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

export default function DriverMap({ selectedShipment }: DriverMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Geolocation Tracking
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverPos([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
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
    if (map && window.google) {
      if (selectedShipment && selectedShipment.route.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        if (selectedShipment.detailedRoute && selectedShipment.detailedRoute.length > 0) {
            selectedShipment.detailedRoute.forEach(r => bounds.extend(new window.google.maps.LatLng(r.lat, r.lng)));
        } else {
            selectedShipment.route.forEach(r => bounds.extend(new window.google.maps.LatLng(r.lat, r.lng)));
        }
        
        if (driverPos) bounds.extend(new window.google.maps.LatLng(driverPos[0], driverPos[1]));
        map.fitBounds(bounds, 50);
      } else if (driverPos) {
        map.panTo(new window.google.maps.LatLng(driverPos[0], driverPos[1]));
        map.setZoom(10);
      }
    }
  }, [selectedShipment, driverPos, map]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      
      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-[10] bg-white p-3 rounded-lg shadow-md border border-slate-200 text-xs font-semibold space-y-2">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#0B3C5D] rounded-full"></div> Planned Route</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Traffic/Delay</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#FF6B00] rounded-full"></div> Driver Location</div>
      </div>

      <GoogleMapWrapper>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={driverPos ? { lat: driverPos[0], lng: driverPos[1] } : { lat: 28.6139, lng: 77.2090 }}
          zoom={5}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: [
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] }
            ],
            mapTypeControl: false,
            streetViewControl: false,
          }}
        >
          {/* Driver Marker */}
          {driverPos && (
            <Marker 
              position={{ lat: driverPos[0], lng: driverPos[1] }}
              icon={{
                url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
                scaledSize: window.google ? new window.google.maps.Size(35, 55) : undefined,
              }}
              onClick={() => setActiveMarker("driver")}
            >
              {activeMarker === "driver" && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="text-black p-1">
                    <div className="font-bold text-brand-navy">You (Driver)</div>
                    <div>Live Location</div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )}

          {/* Shipment Route */}
          {selectedShipment && (
            <>
              {/* Draw base polyline */}
              <Polyline 
                path={selectedShipment.detailedRoute ? selectedShipment.detailedRoute : selectedShipment.route.map(r => ({ lat: r.lat, lng: r.lng }))}
                options={{
                  strokeColor: "#0B3C5D",
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                }}
              />

              {/* Draw red polyline over delayed segment if exists */}
              {selectedShipment.delaySegment && !selectedShipment.detailedRoute && (
                <Polyline 
                  path={selectedShipment.route.slice(selectedShipment.delaySegment.startIdx, selectedShipment.delaySegment.endIdx + 1).map(r => ({ lat: r.lat, lng: r.lng }))}
                  options={{
                    strokeColor: "#EF4444",
                    strokeOpacity: 1.0,
                    strokeWeight: 6,
                  }}
                />
              )}

              {/* Draw Stop Markers */}
              {selectedShipment.route.map((stop, idx) => {
                const isDelayStop = selectedShipment.delaySegment && idx >= selectedShipment.delaySegment.startIdx && idx <= selectedShipment.delaySegment.endIdx;
                
                return (
                  <Marker 
                    key={idx} 
                    position={{ lat: stop.lat, lng: stop.lng }}
                    icon={{
                      url: isDelayStop 
                        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                        : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                      scaledSize: window.google ? new window.google.maps.Size(25, 41) : undefined,
                    }}
                    onClick={() => setActiveMarker(`stop-${idx}`)}
                  >
                    {activeMarker === `stop-${idx}` && (
                      <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                        <div className="text-black p-1">
                          <div className="font-bold">{stop.name}</div>
                          <div className="text-xs text-slate-500">{stop.type.toUpperCase()}</div>
                          {isDelayStop && <div className="text-red-500 text-xs font-bold mt-1">⚠️ {selectedShipment.delaySegment?.reason}</div>}
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                );
              })}
            </>
          )}
        </GoogleMap>
      </GoogleMapWrapper>
    </div>
  );
}
