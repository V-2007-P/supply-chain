import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
          
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Business Shipping Made Easy
            </h2>
            <p className="text-slate-600 text-lg max-w-xl">
              End-to-end logistics solutions for your business. Fast, reliable, and trackable.
            </p>
          </div>

          <div className="flex-shrink-0 z-10">
            <Link 
              href="#services" 
              className="bg-brand-orange hover:bg-[#e66000] text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-md"
            >
              Explore Our Services <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Decorative Plane/Truck Background placeholder */}
          <div className="absolute right-1/4 bottom-0 w-64 h-full opacity-10 pointer-events-none hidden lg:block">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-brand-navy">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
