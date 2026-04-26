import { useState, useEffect } from "react";
import Papa from "papaparse";

export type Insights = {
  delayByWeather: Record<string, number>;
  delayByVehicle: Record<string, number>;
  delayByDistance: Record<string, number>;
};

export function useLogisticsData() {
  const [data, setData] = useState<any[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse("/data/Delivery_Logistics.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        setData(rows);
        
        // Calculate Insights
        const weatherStats: Record<string, { total: number; delayed: number }> = {};
        const vehicleStats: Record<string, { total: number; delayed: number }> = {};
        const distanceStats: Record<string, { total: number; delayed: number }> = {
          "Short (< 50km)": { total: 0, delayed: 0 },
          "Medium (50-200km)": { total: 0, delayed: 0 },
          "Long (> 200km)": { total: 0, delayed: 0 },
        };

        rows.forEach(row => {
          const isDelayed = row.delayed === "yes" ? 1 : 0;
          
          // Weather
          const weather = (row.weather_condition || "unknown").toLowerCase();
          if (!weatherStats[weather]) weatherStats[weather] = { total: 0, delayed: 0 };
          weatherStats[weather].total += 1;
          weatherStats[weather].delayed += isDelayed;

          // Vehicle
          const vehicle = (row.vehicle_type || "unknown").toLowerCase();
          if (!vehicleStats[vehicle]) vehicleStats[vehicle] = { total: 0, delayed: 0 };
          vehicleStats[vehicle].total += 1;
          vehicleStats[vehicle].delayed += isDelayed;

          // Distance
          const dist = parseFloat(row.distance_km);
          if (!isNaN(dist)) {
            if (dist < 50) {
              distanceStats["Short (< 50km)"].total += 1;
              distanceStats["Short (< 50km)"].delayed += isDelayed;
            } else if (dist <= 200) {
              distanceStats["Medium (50-200km)"].total += 1;
              distanceStats["Medium (50-200km)"].delayed += isDelayed;
            } else {
              distanceStats["Long (> 200km)"].total += 1;
              distanceStats["Long (> 200km)"].delayed += isDelayed;
            }
          }
        });

        const toProb = (stats: Record<string, {total: number, delayed: number}>) => {
          const prob: Record<string, number> = {};
          for (const key in stats) {
            prob[key] = stats[key].total > 0 ? (stats[key].delayed / stats[key].total) * 100 : 0;
          }
          return prob;
        };

        setInsights({
          delayByWeather: toProb(weatherStats),
          delayByVehicle: toProb(vehicleStats),
          delayByDistance: toProb(distanceStats),
        });
        
        setLoading(false);
      }
    });
  }, []);

  const getRiskLevel = (weather: string, distance: number, vehicle: string): "Low" | "Medium" | "High" => {
    if (!insights) return "Medium"; // fallback
    
    const weatherProb = insights.delayByWeather[weather.toLowerCase()] || 0;
    const vehicleProb = insights.delayByVehicle[vehicle.toLowerCase()] || 0;
    
    let distCategory = "Long (> 200km)";
    if (distance < 50) distCategory = "Short (< 50km)";
    else if (distance <= 200) distCategory = "Medium (50-200km)";
    const distProb = insights.delayByDistance[distCategory] || 0;

    const avgRiskProb = (weatherProb + vehicleProb + distProb) / 3;

    if (weatherProb > 50 || avgRiskProb > 40) return "High";
    if (weatherProb > 30 || avgRiskProb > 25) return "Medium";
    return "Low";
  };

  const getInsightMessage = (weather: string, distance: number, vehicle: string) => {
    if (!insights) return "";
    const weatherProb = insights.delayByWeather[weather.toLowerCase()]?.toFixed(1) || "0";
    return `Based on historical data, deliveries in ${weather} conditions have a ${weatherProb}% delay probability.`;
  };

  return { data, insights, loading, getRiskLevel, getInsightMessage };
}
