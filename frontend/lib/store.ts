import { create } from 'zustand';
import { Shipment, Alert, Recommendation } from '../types';

interface AppState {
  shipments: Shipment[];
  alerts: Alert[];
  recommendations: Recommendation[];
  setShipments: (shipments: Shipment[]) => void;
  updateShipment: (shipment: Shipment) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (id: string) => void;
  setRecommendations: (recs: Recommendation[]) => void;
  addRecommendation: (rec: Recommendation) => void;
}

export const useAppStore = create<AppState>((set) => ({
  shipments: [],
  alerts: [],
  recommendations: [],
  
  setShipments: (shipments) => set({ shipments }),
  
  updateShipment: (shipment) => set((state) => ({
    shipments: state.shipments.some(s => s.id === shipment.id)
      ? state.shipments.map((s) => (s.id === shipment.id ? shipment : s))
      : [shipment, ...state.shipments]
  })),
  
  setAlerts: (alerts) => set({ alerts }),
  
  addAlert: (alert) => set((state) => {
    const isDuplicate = state.alerts.some(a => !a.resolved && a.message === alert.message);
    if (isDuplicate) return state;
    return { alerts: [alert, ...state.alerts] };
  }),
  
  resolveAlert: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, resolved: true } : a)
  })),

  setRecommendations: (recs) => set({ recommendations: recs }),
  
  addRecommendation: (rec) => set((state) => ({
    recommendations: [rec, ...state.recommendations]
  })),
}));
