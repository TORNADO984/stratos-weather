"""
Weather API Route Endpoints
"""

from typing import List
from fastapi import APIRouter, Query, HTTPException
from app.schemas.common import ApiResponse
from app.schemas.weather import (
    FullWeatherResponse,
    CurrentWeather,
    HourlyItem,
    DailyItem,
    AirQualityData,
    CityComparisonItem,
)
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/forecast", response_model=ApiResponse[FullWeatherResponse])
async def get_forecast(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude coordinate (-90 to 90)"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude coordinate (-180 to 180)"),
):
    try:
        data = await weather_service.get_forecast(lat, lon)
        return ApiResponse(data=data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather upstream service error: {str(e)}")


@router.get("/current", response_model=ApiResponse[CurrentWeather])
async def get_current_weather(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
):
    try:
        data = await weather_service.get_forecast(lat, lon)
        return ApiResponse(data=data.current)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather upstream service error: {str(e)}")


@router.get("/hourly", response_model=ApiResponse[List[HourlyItem]])
async def get_hourly_forecast(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
):
    try:
        data = await weather_service.get_forecast(lat, lon)
        return ApiResponse(data=data.hourly)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather upstream service error: {str(e)}")


@router.get("/daily", response_model=ApiResponse[List[DailyItem]])
async def get_daily_forecast(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
):
    try:
        data = await weather_service.get_forecast(lat, lon)
        return ApiResponse(data=data.daily)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather upstream service error: {str(e)}")


@router.get("/air-quality", response_model=ApiResponse[AirQualityData])
async def get_air_quality(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
):
    try:
        aq = await weather_service._safe_fetch_air_quality(lat, lon)
        return ApiResponse(data=aq)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Air quality service error: {str(e)}")


@router.get("/compare", response_model=ApiResponse[List[CityComparisonItem]])
async def compare_stations():
    # Pre-set prominent global reference stations
    targets = [
        {"name": "Casablanca", "country": "Morocco", "lat": 33.5731, "lon": -7.5898},
        {"name": "Tokyo", "country": "Japan", "lat": 35.6762, "lon": 139.6503},
        {"name": "Paris", "country": "France", "lat": 48.8566, "lon": 2.3522},
        {"name": "New York", "country": "United States", "lat": 40.7128, "lon": -74.0060},
    ]
    try:
        data = await weather_service.compare_stations(targets)
        return ApiResponse(data=data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Comparison service error: {str(e)}")
