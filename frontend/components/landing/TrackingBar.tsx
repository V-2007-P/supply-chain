"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ArrowRight } from "lucide-react";

export function TrackingBar() {
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleTrack = () => {
    if (!/^\d{6}$/.test(trackingId)) {
      setError("Enter a valid 6-digit Tracking ID");
      return;
    }
    setError("");
    router.push(`/track/${trackingId}`);
  };

  return (
    <div id="track" className="container mx-auto px-4 -mt-8 relative z-20">
      <div className="bg-brand-navy rounded-xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border border-[#1a4f76]">
        
        <div className="flex items-center gap-4 text-white min-w-[280px]">
          <div className="bg-white/10 p-4 rounded-lg">
            <Box className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-xl">Track Your Shipment</h3>
            <p className="text-sm text-brand-light/80">Enter your tracking ID to get real-time updates</p>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Enter Tracking ID (e.g. 123456)" 
              value={trackingId}
              onChange={(e) => {
                setTrackingId(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              className={`flex-1 bg-white text-slate-900 px-6 py-4 rounded-lg outline-none focus:ring-2 ${error ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-brand-orange'} text-lg placeholder:text-slate-400 font-medium`}
            />
            <button 
              onClick={handleTrack}
              className="bg-brand-orange hover:bg-[#e66000] text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              Track Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          {error && <span className="text-red-400 text-sm font-semibold">{error}</span>}
        </div>

      </div>
    </div>
  );
}
