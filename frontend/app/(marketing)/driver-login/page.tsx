"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DriverLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API delay
    setTimeout(() => {
      if (email === "driver@courier.com" && password === "123456") {
        // Dummy Auth Success
        sessionStorage.setItem("driver_auth", "true");
        router.push("/driver-dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 bg-brand-light">
      
      <Link href="/" className="flex items-center gap-2 text-brand-navy mb-8 hover:opacity-80 transition">
        <Truck className="h-10 w-10 text-brand-orange" />
        <div className="flex flex-col">
          <span className="font-black text-3xl tracking-tighter leading-none italic">SWIFTROUTE</span>
          <span className="text-[11px] font-medium tracking-widest text-slate-500 italic">DRIVER PORTAL</span>
        </div>
      </Link>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Welcome Back, Driver</h1>
        <p className="text-slate-500 text-sm text-center mb-8">Sign in to view your assigned routes and updates.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm font-medium mb-6 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">Driver Email</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., driver@courier.com"
              className="w-full bg-slate-50 text-slate-900 px-4 py-3.5 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange border border-slate-200 transition-all placeholder:text-slate-400 font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 text-slate-900 px-4 py-3.5 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange border border-slate-200 transition-all placeholder:text-slate-400 font-medium"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-navy hover:bg-[#082a42] text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? "Authenticating..." : "Login as Driver"} 
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

      </div>
      
      <div className="mt-8 text-sm text-slate-500 font-medium bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
        Dummy credentials: <span className="text-brand-orange font-bold">driver@courier.com</span> / <span className="text-brand-orange font-bold">123456</span>
      </div>
    </div>
  );
}
