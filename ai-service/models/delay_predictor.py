"""
SwiftRoute — Delay Predictor & Risk Scoring Engine
Rule-based heuristic model for risk scoring Indian courier shipments.
"""

import numpy as np
from typing import Tuple


# ──────────────────────────────────────────
# City-level baseline delay risk (minutes)
# ──────────────────────────────────────────
CITY_BASE_DELAY: dict[str, int] = {
    "delhi": 15,
    "mumbai": 20,
    "kolkata": 25,
    "lucknow": 30,
    "varanasi": 40,
    "patna": 45,
    "kanpur": 35,
    "gaya": 50,
    "muzaffarpur": 55,
    "jhansi": 38,
    "dhanbad": 42,
    "allahabad": 38,
    "prayagraj": 38,
    "agra": 30,
    "noida": 18,
    "gurugram": 18,
    "default": 30,
}

# NH highway congestion multipliers
NH_CONGESTION: dict[str, float] = {
    "NH19": 1.4,   # Delhi-Kolkata (heavy freight)
    "NH27": 1.3,   # East-West corridor
    "NH44": 1.2,   # North-South
    "NH48": 1.35,  # Delhi-Mumbai
    "NH30": 1.25,  # Patna-Raipur
    "default": 1.0,
}

# Weather severity multipliers
WEATHER_SEVERITY: dict[str, float] = {
    "clear": 1.0,
    "fog": 1.8,       # Dense fog on NH plains in winter
    "rain": 1.5,
    "heavy_rain": 2.2,
    "cyclone": 3.0,
    "heatwave": 1.15,
}

# Hub overload multipliers
HUB_OVERLOAD: dict[str, float] = {
    "LOW": 1.0,
    "MEDIUM": 1.3,
    "HIGH": 1.7,
    "CRITICAL": 2.5,
}


def get_city_delay(city: str) -> int:
    """Return base delay minutes for a given city."""
    return CITY_BASE_DELAY.get(city.lower(), CITY_BASE_DELAY["default"])


def get_nh_multiplier(nh_number: str) -> float:
    """Return congestion multiplier for an NH highway."""
    return NH_CONGESTION.get(nh_number.upper(), NH_CONGESTION["default"])


def predict_delay(
    source: str,
    destination: str,
    nh_number: str = "NH19",
    weather: str = "clear",
    hub_load: str = "LOW",
    distance_km: float = 500.0,
    hour_of_day: int = 12,
    existing_delay_minutes: int = 0,
) -> Tuple[str, int, float]:
    """
    Predict shipment delay and risk score.

    Returns:
        risk_score: 'LOW' | 'MEDIUM' | 'HIGH'
        predicted_delay_minutes: int
        confidence: float (0.0 – 1.0)
    """
    # Base delay from city pair
    base = (get_city_delay(source) + get_city_delay(destination)) / 2

    # Apply multipliers
    nh_mult = get_nh_multiplier(nh_number)
    weather_mult = WEATHER_SEVERITY.get(weather.lower(), 1.0)
    hub_mult = HUB_OVERLOAD.get(hub_load.upper(), 1.0)

    # Distance factor (longer = more uncertainty)
    dist_factor = 1.0 + (distance_km / 2000.0)

    # Peak hour penalty (6-9am, 5-8pm)
    peak_penalty = 1.25 if (6 <= hour_of_day <= 9 or 17 <= hour_of_day <= 20) else 1.0

    # Composite score
    predicted = (
        base * nh_mult * weather_mult * hub_mult * dist_factor * peak_penalty
    ) + existing_delay_minutes

    predicted = int(round(predicted))

    # Add small gaussian noise for realism
    noise = int(np.random.normal(0, predicted * 0.08))
    predicted = max(0, predicted + noise)

    # Classify risk
    if predicted < 30:
        risk_score = "LOW"
        confidence = round(np.random.uniform(0.80, 0.95), 2)
    elif predicted < 90:
        risk_score = "MEDIUM"
        confidence = round(np.random.uniform(0.70, 0.88), 2)
    else:
        risk_score = "HIGH"
        confidence = round(np.random.uniform(0.65, 0.85), 2)

    return risk_score, predicted, confidence


def recommend_alternate_route(
    current_route: str,
    blocked_nh: str,
    source: str,
    destination: str,
) -> dict:
    """
    Suggest an alternate route when the primary NH is blocked.
    Returns a dict with alternate route details and estimated savings.
    """
    ALTERNATES: dict[str, dict] = {
        "NH19": {
            "alternate": "NH30 via Allahabad",
            "nh_number": "NH30",
            "extra_km": 45,
            "time_saved_min": -20,  # slight detour
            "description": "Reroute via NH30 (Allahabad bypass) to avoid NH19 congestion near Kanpur",
        },
        "NH27": {
            "alternate": "NH931 via Gorakhpur",
            "nh_number": "NH931",
            "extra_km": 30,
            "time_saved_min": 35,
            "description": "Use NH931 through Gorakhpur to bypass NH27 flooding near Varanasi",
        },
        "NH44": {
            "alternate": "NH48 via Agra",
            "nh_number": "NH48",
            "extra_km": 60,
            "time_saved_min": 25,
            "description": "Divert to NH48 (Agra-Gwalior corridor) to bypass NH44 traffic",
        },
        "NH48": {
            "alternate": "NH58 via Meerut",
            "nh_number": "NH58",
            "extra_km": 40,
            "time_saved_min": 30,
            "description": "Reroute via NH58 (Meerut expressway) to bypass NH48 accident zone",
        },
    }

    alt = ALTERNATES.get(blocked_nh.upper(), {
        "alternate": f"State Highway via {destination}",
        "nh_number": "SH",
        "extra_km": 50,
        "time_saved_min": 15,
        "description": f"Use state highway network to bypass {blocked_nh}",
    })

    return {
        "current_route": current_route,
        "blocked_nh": blocked_nh,
        "alternate_route": alt["alternate"],
        "alternate_nh": alt["nh_number"],
        "extra_distance_km": alt["extra_km"],
        "estimated_time_saved_minutes": alt["time_saved_min"],
        "description": alt["description"],
        "confidence_percent": int(np.random.uniform(72, 94)),
    }
