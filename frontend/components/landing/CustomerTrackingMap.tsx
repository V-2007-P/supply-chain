"use client";

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Polyline, Marker, InfoWindow } from '@react-google-maps/api';
import GoogleMapWrapper from '../GoogleMapWrapper';

export interface TrackingMapProps {
  route: { lat: number; lng: number; name: string; type: string }[];
  currentLocation: { lat: number; lng: number };
  delaySegment?: { startIdx: number; endIdx: number; reason: string; type: 'traffic' | 'weather' };
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

export default function CustomerTrackingMap({ route, currentLocation, delaySegment }: TrackingMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && window.google) {
      if (route.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        route.forEach(r => bounds.extend(new window.google.maps.LatLng(r.lat, r.lng)));
        bounds.extend(new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng));
        map.fitBounds(bounds, 50);
      }
    }
  }, [route, currentLocation, map]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <GoogleMapWrapper>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentLocation}
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
          {/* Base route */}
          <Polyline 
            path={route.map(r => ({ lat: r.lat, lng: r.lng }))}
            options={{
              strokeColor: "#0B3C5D",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />

          {/* Delayed segment */}
          {delaySegment && (
            <Polyline 
              path={route.slice(delaySegment.startIdx, delaySegment.endIdx + 1).map(r => ({ lat: r.lat, lng: r.lng }))}
              options={{
                strokeColor: "#EF4444",
                strokeOpacity: 1.0,
                strokeWeight: 6,
              }}
            />
          )}

          {/* Stops */}
          {route.map((stop, idx) => {
            const isDelayStop = delaySegment && idx >= delaySegment.startIdx && idx <= delaySegment.endIdx;
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
                      <div className="text-xs text-slate-500">{stop.type}</div>
                      {isDelayStop && <div className="text-red-500 text-xs font-bold mt-1">⚠️ {delaySegment.reason}</div>}
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            );
          })}

          {/* Current Location (Truck) */}
          <Marker 
            position={currentLocation}
            icon={{
              url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
              scaledSize: window.google ? new window.google.maps.Size(35, 55) : undefined,
            }}
            onClick={() => setActiveMarker("truck")}
            zIndex={100}
          >
            {activeMarker === "truck" && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="text-black p-1">
                  <div className="font-bold text-brand-orange">Current Location</div>
                  <div className="text-xs">Live Update</div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        </GoogleMap>
      </GoogleMapWrapper>
    </div>
  );
}
