"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export default function OpsLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("ops@courier.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "ops@courier.com" && password === "123456") {
      sessionStorage.setItem("ops_auth", "true");
      router.push("/ops-dashboard");
    } else {
      setError("Invalid credentials. Try ops@courier.com / 123456");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-4 py-20">
        <div className="max-w-md w-full">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-navy hover:opacity-90 transition">
            <Activity className="h-10 w-10 text-brand-orange" />
            <div className="flex flex-col text-left">
              <span className="font-black text-3xl tracking-tighter leading-none italic">PAARO</span>
              <span className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">Control Tower</span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-brand-navy p-8 text-center text-white">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-brand-orange" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Operations Login</h2>
            <p className="text-brand-light/70 text-sm mt-2">Secure access to the global control tower</p>
          </div>

          <form onSubmit={handleLogin} className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-xl mb-6 text-center border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-brand-orange hover:bg-[#e66000] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              Access Control Tower <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-400 text-sm mt-8 font-medium">
          Authorized personnel only. All access is logged.
        </p>
        </div>
      </div>
    </div>
  );
}
