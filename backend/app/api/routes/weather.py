"""
Weather API Route Endpoints
"""

from fastapi import APIRouter, Query, HTTPException
from app.schemas.common import ApiResponse
from app.schemas.weather import FullWeatherResponse, CurrentWeather, HourlyItem, DailyItem
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


@router.get("/hourly", response_model=ApiResponse[list[HourlyItem]])
async def get_hourly_forecast(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
):
    try:
        data = await weather_service.get_forecast(lat, lon)
        return ApiResponse(data=data.hourly)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather upstream service error: {str(e)}")


@router.get("/daily", response_model=ApiResponse[list[DailyItem]])
async def get_daily_forecast(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
):
    try:
        data = await weather_service.get_forecast(lat, lon)
        return ApiResponse(data=data.daily)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather upstream service error: {str(e)}")
