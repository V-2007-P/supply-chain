import { useState, useEffect } from 'react';
import type { Shipment } from './useShipments';

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  forecast: string;
}

export interface ShipmentContext {
  weather: WeatherData | null;
  traffic: 'Low' | 'Medium' | 'High';
}

export function useShipmentContext(shipments: Shipment[]) {
  const [contexts, setContexts] = useState<Record<string, ShipmentContext>>({});

  useEffect(() => {
    const fetchWeatherAndTraffic = async () => {
      const newContexts: Record<string, ShipmentContext> = {};

      for (const shipment of shipments) {
        let weather: WeatherData | null = null;
        
        // Use the current location or the next transit stop for weather
        const location = shipment.currentLocation || shipment.route[0];

        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current_weather=true`);
          if (res.ok) {
            const data = await res.json();
            const current = data.current_weather;
            const code = current.weathercode;
            
            let condition = 'Clear';
            let forecastText = 'Clear skies expected.';
            
            if (code >= 1 && code <= 3) { condition = 'Clouds'; forecastText = 'Partly cloudy conditions expected.'; }
            else if (code >= 45 && code <= 48) { condition = 'Fog'; forecastText = 'Reduced visibility due to fog.'; }
            else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) { condition = 'Rain'; forecastText = 'Rain expected along the route.'; }
            else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) { condition = 'Snow'; forecastText = 'Snowfall expected.'; }
            else if (code >= 95) { condition = 'Thunderstorm'; forecastText = 'Thunderstorms in the area.'; }

            weather = {
              temp: Math.round(current.temperature),
              condition,
              icon: '',
              forecast: forecastText
            };
          }
        } catch (error) {
          console.error("Failed to fetch weather from Open-Meteo", error);
          // Fallback just in case network fails
          weather = { temp: 25, condition: 'Clear', icon: '', forecast: 'Unable to fetch real-time weather.' };
        }

        // Simulate traffic
        const trafficOptions: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
        const traffic = trafficOptions[Math.floor(Math.random() * trafficOptions.length)];

        newContexts[shipment.id] = { weather, traffic };
      }

      setContexts(newContexts);
    };

    if (shipments.length > 0) {
      fetchWeatherAndTraffic();
    }
  }, [shipments]);

  return { contexts };
}
