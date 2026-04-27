"use client";

import { useLoadScript } from "@react-google-maps/api";
import { ReactNode } from "react";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry"];

export default function GoogleMapWrapper({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  if (loadError) {
    return <div className="h-full w-full flex items-center justify-center text-red-500 bg-red-50 rounded-2xl p-4 text-center font-bold">Error loading maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-100 rounded-2xl animate-pulse font-bold">Loading Google Maps...</div>;
  }

  return <>{children}</>;
}
