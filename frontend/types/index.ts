export type ShipmentStatus = 'IN_TRANSIT' | 'DELAYED' | 'OUT_FOR_DELIVERY' | 'HELD_AT_HUB' | 'DELIVERED';
export type RiskScore = 'LOW' | 'MEDIUM' | 'HIGH';
export type AlertType = 'TRAFFIC' | 'WEATHER' | 'HUB_OVERLOAD' | 'DELAY' | 'VEHICLE_BREAKDOWN';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface Shipment {
  id: string;
  awb: string;
  source: string;
  destination: string;
  current_location: string;
  current_hub: string;
  status: ShipmentStatus;
  risk_score: RiskScore;
  delay_minutes: number;
  edd: string;
  last_scan_time: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  region: string;
  route: string;
  message: string;
  affected_shipments: string[];
  resolved: boolean;
  created_at: string;
}

export interface Recommendation {
  id: string;
  type: string;
  description: string;
  affected_shipments: string[];
  time_saved_minutes: number;
  confidence_percent: number;
  status: string;
  created_at: string;
}

export interface KpiMetric {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
}
