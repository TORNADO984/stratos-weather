"""
Weather Pydantic Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class CurrentWeather(BaseModel):
    temperature: float = Field(..., description="Current temperature in Celsius")
    apparentTemperature: float = Field(..., description="Feels-like temperature in Celsius")
    weatherCode: int = Field(..., description="WMO weather code")
    isNight: bool = Field(False, description="Whether it is night at location")
    relativeHumidity: int = Field(..., description="Relative humidity in percentage")
    windSpeed: float = Field(..., description="Wind speed in km/h")
    windDirection: int = Field(..., description="Wind direction degrees (0-360)")
    surfacePressure: float = Field(..., description="Barometric surface pressure in hPa")
    visibility: float = Field(..., description="Visibility in meters")
    uvIndex: float = Field(..., description="UV Radiation index (0-11+)")
    dewPoint: float = Field(..., description="Dew point temperature in Celsius")
    cloudCover: int = Field(..., description="Cloud coverage percentage")
    precipitation: float = Field(..., description="Liquid precipitation volume in mm")
    sunrise: str = Field(..., description="ISO sunrise time")
    sunset: str = Field(..., description="ISO sunset time")


class HourlyItem(BaseModel):
    time: str
    temperature: float
    weatherCode: int
    isNight: bool
    precipitationProb: int
    windSpeed: float


class DailyItem(BaseModel):
    day: str
    date: str
    weatherCode: int
    tempMax: float
    tempMin: float
    precipitationProb: int
    uvIndex: float


class LocationMeta(BaseModel):
    name: str
    country: str
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    timezone: Optional[str] = None


class FullWeatherResponse(BaseModel):
    current: CurrentWeather
    hourly: List[HourlyItem]
    daily: List[DailyItem]
    location: LocationMeta
