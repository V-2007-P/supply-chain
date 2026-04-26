"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Truck } from "lucide-react";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for dummy auth token
    const auth = sessionStorage.getItem("driver_auth");
    if (!auth && pathname !== "/driver-login") {
      router.push("/driver-login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <Truck className="w-12 h-12 text-brand-orange animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-orange selection:text-white">
      {children}
    </div>
  );
}
