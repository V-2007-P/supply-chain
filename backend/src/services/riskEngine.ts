import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export interface RiskPrediction {
  shipment_id: string;
  risk_score: 'LOW' | 'MEDIUM' | 'HIGH';
  predicted_delay_minutes: number;
  confidence: number;
  assessed_at: string;
}

export interface RiskInput {
  shipment_id: string;
  source: string;
  destination: string;
  nh_number?: string;
  weather?: string;
  hub_load?: string;
  distance_km?: number;
  hour_of_day?: number;
  existing_delay_minutes?: number;
}

export async function scoreRisk(input: RiskInput): Promise<RiskPrediction> {
  try {
    const { data } = await axios.post<RiskPrediction>(`${AI_SERVICE_URL}/predict`, {
      shipment_id: input.shipment_id,
      source: input.source,
      destination: input.destination,
      nh_number: input.nh_number ?? 'NH19',
      weather: input.weather ?? 'clear',
      hub_load: input.hub_load ?? 'LOW',
      distance_km: input.distance_km ?? 500,
      hour_of_day: input.hour_of_day ?? new Date().getHours(),
      existing_delay_minutes: input.existing_delay_minutes ?? 0,
    });
    return data;
  } catch (error) {
    // Fallback if AI service is down
    console.warn('[RiskEngine] AI service unreachable — using fallback scoring');
    return {
      shipment_id: input.shipment_id,
      risk_score: (input.existing_delay_minutes ?? 0) > 60 ? 'HIGH' : 'LOW',
      predicted_delay_minutes: input.existing_delay_minutes ?? 0,
      confidence: 0.5,
      assessed_at: new Date().toISOString(),
    };
  }
}

export async function scoreRiskBulk(inputs: RiskInput[]): Promise<RiskPrediction[]> {
  try {
    const { data } = await axios.post<{ results: RiskPrediction[] }>(
      `${AI_SERVICE_URL}/predict/bulk`,
      { shipments: inputs }
    );
    return data.results;
  } catch {
    return inputs.map((i) => ({
      shipment_id: i.shipment_id,
      risk_score: 'LOW' as const,
      predicted_delay_minutes: i.existing_delay_minutes ?? 0,
      confidence: 0.5,
      assessed_at: new Date().toISOString(),
    }));
  }
}
