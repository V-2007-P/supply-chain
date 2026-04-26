"use client";

import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { socket } from '@/lib/socket';
import { useAppStore } from '@/lib/store';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const { updateShipment, addAlert, setShipments, setAlerts } = useAppStore();

  useEffect(() => {
    socket.connect();

    socket.on('initial:state', (data) => {
      if (data.shipments) setShipments(data.shipments);
      if (data.alerts) setAlerts(data.alerts);
    });

    socket.on('shipment:update', (shipment) => {
      updateShipment(shipment);
    });

    socket.on('alert:new', (alert) => {
      addAlert(alert);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
