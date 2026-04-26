"use client";

import dynamic from 'next/dynamic';

// Next.js requires SSR disabled for Leaflet
const LiveMap = dynamic(
  () => import('@/components/map/LiveMap'),
  { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-card border rounded-xl animate-pulse">Loading map...</div> }
);

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Network Map</h1>
        <p className="text-muted-foreground">Real-time visualization of all active shipments</p>
      </div>
      <div className="flex-1 min-h-0">
        <LiveMap />
      </div>
    </div>
  );
}
