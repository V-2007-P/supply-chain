"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ChevronDown } from "lucide-react";

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm text-slate-900">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-brand-navy hover:opacity-90 transition">
          <Package className="h-8 w-8 text-brand-orange" />
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter leading-none italic">PAARO LOGISTICS</span>
            <span className="text-[10px] font-medium tracking-widest text-slate-500 italic">DELIVERING EXCELLENCE</span>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link href="#" className="text-brand-orange border-b-2 border-brand-orange py-1">Home</Link>
          <Link href="#track" className="text-slate-600 hover:text-brand-navy transition">Track Shipment</Link>
          <Link href="#" className="text-slate-600 hover:text-brand-navy transition">Services</Link>
          <Link href="#" className="text-slate-600 hover:text-brand-navy transition">About</Link>
          <Link href="#" className="text-slate-600 hover:text-brand-navy transition">Careers</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button 
              className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-navy px-3 py-2"
            >
              Login <ChevronDown className="h-4 w-4" />
            </button>
            
            <div className="absolute top-full right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <Link href="/dashboard" className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange transition">
                <div className="font-semibold">User Dashboard</div>
                <div className="text-xs text-slate-500">Manage your personal shipments</div>
              </Link>
              <Link href="/ops-login" className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange transition">
                <div className="font-semibold">Operations Manager</div>
                <div className="text-xs text-slate-500">Access full operations suite</div>
              </Link>
              <Link href="/driver-login" className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange transition">
                <div className="font-semibold">Driver Dashboard</div>
                <div className="text-xs text-slate-500">View active routes and stops</div>
              </Link>
            </div>
          </div>
          <Link 
            href="#track" 
            className="hidden md:inline-flex bg-brand-orange hover:bg-[#e66000] text-white px-6 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm"
          >
            Track Order
          </Link>
        </div>
      </div>
    </header>
  );
}
