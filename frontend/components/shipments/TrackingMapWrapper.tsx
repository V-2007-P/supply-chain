"use client";

import dynamic from 'next/dynamic';
import { Shipment } from '@/types';

const TrackingMap = dynamic(
  () => import('@/components/shipments/TrackingMap'),
  { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-muted/20 animate-pulse">Initializing tracking feed...</div> }
);

interface TrackingMapWrapperProps {
  shipment: Shipment;
}

export default function TrackingMapWrapper({ shipment }: TrackingMapWrapperProps) {
  return <TrackingMap shipment={shipment} />;
}
