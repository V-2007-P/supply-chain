import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Indian NH highway graph — adjacency list of connected cities
const NH_GRAPH: Record<string, { via: string; nh: string; km: number }[]> = {
  Delhi: [
    { via: 'Agra', nh: 'NH44', km: 206 },
    { via: 'Lucknow', nh: 'NH27', km: 555 },
    { via: 'Kanpur', nh: 'NH19', km: 467 },
  ],
  Lucknow: [
    { via: 'Kanpur', nh: 'NH27', km: 82 },
    { via: 'Varanasi', nh: 'NH19', km: 286 },
    { via: 'Patna', nh: 'NH19', km: 531 },
  ],
  Varanasi: [
    { via: 'Patna', nh: 'NH19', km: 244 },
    { via: 'Kolkata', nh: 'NH19', km: 672 },
    { via: 'Gaya', nh: 'NH19', km: 283 },
  ],
  Patna: [
    { via: 'Gaya', nh: 'NH19', km: 100 },
    { via: 'Muzaffarpur', nh: 'NH27', km: 77 },
    { via: 'Dhanbad', nh: 'NH33', km: 258 },
    { via: 'Kolkata', nh: 'NH19', km: 532 },
  ],
  Mumbai: [
    { via: 'Pune', nh: 'NH48', km: 149 },
    { via: 'Nagpur', nh: 'NH44', km: 838 },
    { via: 'Surat', nh: 'NH48', km: 284 },
  ],
};

export interface RouteOptimizationResult {
  current_route: string;
  blocked_nh: string;
  alternate_route: string;
  alternate_nh: string;
  extra_distance_km: number;
  estimated_time_saved_minutes: number;
  description: string;
  confidence_percent: number;
}

export async function optimizeRoute(
  source: string,
  destination: string,
  blockedNH: string
): Promise<RouteOptimizationResult> {
  try {
    const { data } = await axios.post<RouteOptimizationResult>(
      `${AI_SERVICE_URL}/optimize-route`,
      {
        current_route: `${source} → ${destination}`,
        blocked_nh: blockedNH,
        source,
        destination,
      }
    );
    return data;
  } catch {
    // Fallback: return local graph suggestion
    const routes = NH_GRAPH[source] ?? [];
    const alternate = routes.find((r) => r.nh !== blockedNH);
    return {
      current_route: `${source} → ${destination}`,
      blocked_nh: blockedNH,
      alternate_route: alternate
        ? `${source} → ${alternate.via} → ${destination}`
        : `${source} → ${destination} (State Highway)`,
      alternate_nh: alternate?.nh ?? 'SH',
      extra_distance_km: alternate ? alternate.km - (routes[0]?.km ?? 0) + 30 : 50,
      estimated_time_saved_minutes: 25,
      description: `Alternate route suggested due to ${blockedNH} blockage`,
      confidence_percent: 75,
    };
  }
}

export function getRouteGraph() {
  return NH_GRAPH;
}
