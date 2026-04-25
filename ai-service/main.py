"""
SwiftRoute — FastAPI AI Microservice
Provides risk scoring and delay prediction for Indian courier logistics.
"""

import os
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from models.delay_predictor import predict_delay, recommend_alternate_route

load_dotenv()

# ──────────────────────────────────────────
# App setup
# ──────────────────────────────────────────
app = FastAPI(
    title="SwiftRoute AI Service",
    description="Risk scoring & delay prediction for Indian courier logistics",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────
# Request / Response schemas
# ──────────────────────────────────────────
class PredictRequest(BaseModel):
    shipment_id: str
    source: str
    destination: str
    nh_number: str = Field(default="NH19", description="National Highway number")
    weather: str = Field(default="clear", description="clear|fog|rain|heavy_rain|cyclone|heatwave")
    hub_load: str = Field(default="LOW", description="LOW|MEDIUM|HIGH|CRITICAL")
    distance_km: float = Field(default=500.0, gt=0)
    hour_of_day: int = Field(default=12, ge=0, le=23)
    existing_delay_minutes: int = Field(default=0, ge=0)


class PredictResponse(BaseModel):
    shipment_id: str
    risk_score: str
    predicted_delay_minutes: int
    confidence: float
    assessed_at: str


class OptimizeRequest(BaseModel):
    current_route: str
    blocked_nh: str
    source: str
    destination: str


class OptimizeResponse(BaseModel):
    current_route: str
    blocked_nh: str
    alternate_route: str
    alternate_nh: str
    extra_distance_km: int
    estimated_time_saved_minutes: int
    description: str
    confidence_percent: int


class BulkPredictRequest(BaseModel):
    shipments: list[PredictRequest]


# ──────────────────────────────────────────
# Routes
# ──────────────────────────────────────────
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "SwiftRoute AI Service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/predict", response_model=PredictResponse)
async def predict_shipment_risk(req: PredictRequest):
    """
    Predict delay and risk score for a single shipment.
    Returns LOW / MEDIUM / HIGH risk score with predicted delay minutes.
    """
    try:
        risk_score, delay_minutes, confidence = predict_delay(
            source=req.source,
            destination=req.destination,
            nh_number=req.nh_number,
            weather=req.weather,
            hub_load=req.hub_load,
            distance_km=req.distance_km,
            hour_of_day=req.hour_of_day,
            existing_delay_minutes=req.existing_delay_minutes,
        )
        return PredictResponse(
            shipment_id=req.shipment_id,
            risk_score=risk_score,
            predicted_delay_minutes=delay_minutes,
            confidence=confidence,
            assessed_at=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/bulk")
async def bulk_predict(req: BulkPredictRequest):
    """Batch predict risk scores for multiple shipments."""
    results = []
    for shipment in req.shipments:
        try:
            risk_score, delay_minutes, confidence = predict_delay(
                source=shipment.source,
                destination=shipment.destination,
                nh_number=shipment.nh_number,
                weather=shipment.weather,
                hub_load=shipment.hub_load,
                distance_km=shipment.distance_km,
                hour_of_day=shipment.hour_of_day,
                existing_delay_minutes=shipment.existing_delay_minutes,
            )
            results.append({
                "shipment_id": shipment.shipment_id,
                "risk_score": risk_score,
                "predicted_delay_minutes": delay_minutes,
                "confidence": confidence,
            })
        except Exception as e:
            results.append({"shipment_id": shipment.shipment_id, "error": str(e)})
    return {"results": results, "count": len(results)}


@app.post("/optimize-route", response_model=OptimizeResponse)
async def optimize_route(req: OptimizeRequest):
    """
    Recommend an alternate route when the primary NH is blocked.
    Returns alternate route details with time saved estimate.
    """
    try:
        result = recommend_alternate_route(
            current_route=req.current_route,
            blocked_nh=req.blocked_nh,
            source=req.source,
            destination=req.destination,
        )
        return OptimizeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/risk-factors")
async def get_risk_factors():
    """Return all risk factor tables (city delays, NH multipliers, weather)."""
    from models.delay_predictor import CITY_BASE_DELAY, NH_CONGESTION, WEATHER_SEVERITY, HUB_OVERLOAD
    return {
        "city_base_delays": CITY_BASE_DELAY,
        "nh_congestion_multipliers": NH_CONGESTION,
        "weather_severity_multipliers": WEATHER_SEVERITY,
        "hub_overload_multipliers": HUB_OVERLOAD,
    }
