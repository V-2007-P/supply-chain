
import Link from "next/link";
import { Search, Box, MapPin, BrainCircuit, ShieldCheck, Activity } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-navy mb-6 leading-tight">
            Paaro Logistics. <br />
            <span className="text-brand-orange">Delivered Reliably.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
            Real-time tracking, AI-powered insights, and optimized operations for faster deliveries.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
            <Link 
              href="#track" 
              className="w-full sm:w-auto px-8 py-4 bg-brand-navy hover:bg-[#082a42] text-white rounded-md font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <Search className="w-5 h-5" />
              Track Shipment
            </Link>
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 bg-brand-orange hover:bg-[#e66000] text-white rounded-md font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <Box className="w-5 h-5" />
              Create Shipment
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              <Activity className="w-4 h-4 text-brand-navy" /> Real-Time Tracking
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              <BrainCircuit className="w-4 h-4 text-brand-navy" /> AI Delay Prediction
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              <MapPin className="w-4 h-4 text-brand-navy" /> Smart Route Optimization
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-brand-navy" /> Secure & Reliable
            </div>
          </div>
        </div>

        {/* Right Image area */}
        <div className="flex-1 relative w-full max-w-2xl mx-auto mt-10 lg:mt-0">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform lg:translate-x-4">
            {/* We use an img tag with the absolute path or just the public path */}
            <img 
              src="/kanpur_highway.png" 
              alt="Indian Highway near Kanpur" 
              className="w-full h-auto object-cover"
            />
            {/* Dotted curve overlay effect purely via CSS if needed, but a simple pin can suffice */}
            <div className="absolute top-1/4 left-1/4 bg-brand-orange w-4 h-4 rounded-full shadow-[0_0_0_4px_rgba(255,107,0,0.3)] animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 bg-brand-navy w-4 h-4 rounded-full shadow-[0_0_0_4px_rgba(11,60,93,0.3)] animate-pulse"></div>
          </div>
          {/* Decorative background dashed line */}
          <svg className="absolute -z-10 top-0 left-0 w-full h-full text-slate-300 opacity-50" viewBox="0 0 400 400" fill="none">
             <path d="M50 350 Q 150 50 350 150" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" fill="none"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
