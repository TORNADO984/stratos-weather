"""
Location and Geocoding API Routes
"""

from typing import List
from fastapi import APIRouter, Query, HTTPException
from app.schemas.common import ApiResponse
from app.schemas.location import CitySearchResult
from app.services.weather_service import weather_service

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/search", response_model=ApiResponse[List[CitySearchResult]])
async def search_cities(
    q: str = Query(..., min_length=2, max_length=100, description="City query string")
):
    try:
        results = await weather_service.search_locations(q)
        return ApiResponse(data=results)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Location geocoding error: {str(e)}")


@router.get("/reverse", response_model=ApiResponse[CitySearchResult])
async def reverse_geocode(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
):
    # Reverse geocode fallback
    result = CitySearchResult(
        name="Local Station",
        country="Coordinates Fix",
        latitude=lat,
        longitude=lon,
    )
    return ApiResponse(data=result)
