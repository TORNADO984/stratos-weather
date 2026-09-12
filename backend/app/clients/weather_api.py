"""
STRATOS Weather & Geocoding Upstream API Client
Connects asynchronously to Open-Meteo's high-precision meteorological servers.
"""

from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings


class WeatherApiClient:
    def __init__(self):
        self.weather_base = "https://api.open-meteo.com/v1/forecast"
        self.geocoding_base = "https://geocoding-api.open-meteo.com/v1/search"
        self.timeout = httpx.Timeout(8.0, connect=5.0)

    async def fetch_weather_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "precipitation",
                "weather_code",
                "cloud_cover",
                "surface_pressure",
                "wind_speed_10m",
                "wind_direction_10m",
                "dew_point_2m",
                "uv_index",
            ],
            "hourly": [
                "temperature_2m",
                "precipitation_probability",
                "weather_code",
                "is_day",
                "wind_speed_10m",
            ],
            "daily": [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "sunrise",
                "sunset",
                "uv_index_max",
                "precipitation_probability_max",
            ],
            "timezone": "auto",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(self.weather_base, params=params)
            resp.raise_for_status()
            return resp.json()

    async def search_geocoding(self, query: str, count: int = 8) -> List[Dict[str, Any]]:
        params = {
            "name": query,
            "count": count,
            "language": "en",
            "format": "json",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(self.geocoding_base, params=params)
            resp.raise_for_status()
            data = resp.json()
            return data.get("results", [])


weather_client = WeatherApiClient()
