"""
Location & Geocoding Schemas
"""

from typing import Optional
from pydantic import BaseModel, Field


class CitySearchResult(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., description="City name")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    country: str = Field(..., description="Country name")
    countryCode: Optional[str] = None
    admin1: Optional[str] = Field(None, description="State, province or region")
    timezone: Optional[str] = None
    elevation: Optional[float] = None
