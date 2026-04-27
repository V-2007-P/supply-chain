import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { origin, destination, waypoints } = await req.json();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Google Maps API Key" }, { status: 500 });
    }

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}&departure_time=now`;

    if (waypoints && waypoints.length > 0) {
      const waypointsStr = waypoints.map((w: any) => `${w.lat},${w.lng}`).join('|');
      url += `&waypoints=${waypointsStr}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Maps API error: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.status !== "OK") {
       throw new Error(`Directions error: ${data.status} - ${data.error_message || ''}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0]; // Simplification: summing up legs if waypoints exist

    let duration = 0;
    let durationInTraffic = 0;
    let distance = 0;

    route.legs.forEach((l: any) => {
      duration += l.duration?.value || 0;
      durationInTraffic += l.duration_in_traffic?.value || l.duration?.value || 0;
      distance += l.distance?.value || 0;
    });

    // Decode polyline
    const polylineStr = route.overview_polyline.points;

    return NextResponse.json({
      duration,
      durationInTraffic,
      distance,
      polyline: polylineStr,
      legs: route.legs
    });

  } catch (error: any) {
    console.error("Directions API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
