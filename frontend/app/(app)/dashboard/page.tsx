"use client";

import { KpiCard } from '@/components/dashboard/KpiCard';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { RecommendationsPanel } from '@/components/dashboard/RecommendationsPanel';
import { ShipmentTable } from '@/components/dashboard/ShipmentTable';
import { Package, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function DashboardPage() {
  const shipments = useAppStore(state => state.shipments);
  const alerts = useAppStore(state => state.alerts);

  const activeShipments = shipments.filter(s => s.status !== 'DELIVERED').length;
  const delayedShipments = shipments.filter(s => s.status === 'DELAYED' || s.delay_minutes > 60).length;
  const criticalAlerts = alerts.filter(a => !a.resolved && a.severity === 'CRITICAL').length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Operations Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Active Shipments" 
          value={activeShipments} 
          trend="up" 
          trendValue="+12%" 
          icon={<Package className="w-4 h-4" />} 
        />
        <KpiCard 
          title="Delayed Shipments" 
          value={delayedShipments} 
          trend="up" 
          trendValue="+4%" 
          icon={<Truck className="w-4 h-4" />} 
        />
        <KpiCard 
          title="Critical Alerts" 
          value={criticalAlerts} 
          trend={criticalAlerts > 0 ? "up" : "neutral"} 
          trendValue={criticalAlerts > 0 ? "+2" : "0"} 
          icon={<AlertTriangle className="w-4 h-4" />} 
        />
        <KpiCard 
          title="Delivered Today" 
          value={delivered} 
          trend="up" 
          trendValue="+18%" 
          icon={<CheckCircle2 className="w-4 h-4" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel />
        <RecommendationsPanel />
      </div>

      <div className="grid grid-cols-1">
        <ShipmentTable />
      </div>
    </div>
  );
}
