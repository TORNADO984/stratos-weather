"""
Unit tests for WeatherService and TTLCache
"""

import pytest
import time
from app.core.cache import TTLCache
from app.services.weather_service import WeatherService


def test_ttl_cache_basic():
    cache = TTLCache(default_ttl=1)
    cache.set("foo", "bar")
    assert cache.get("foo") == "bar"
    assert cache.get("non_existent") is None

    # Wait for expiry
    time.sleep(1.1)
    assert cache.get("foo") is None


def test_make_cache_key():
    key1 = WeatherService._make_cache_key(33.5731, -7.5898)
    key2 = WeatherService._make_cache_key(33.5711, -7.5912)
    # Since we round to 2 decimals: 33.57 and -7.59
    assert key1 == key2
    assert key1 == "forecast_33.57_-7.59"


def test_transform_weather_data():
    service = WeatherService()
    mock_raw = {
        "elevation": 25,
        "timezone": "Africa/Casablanca",
        "current": {
            "temperature_2m": 24.5,
            "apparent_temperature": 25.0,
            "weather_code": 0,
            "is_day": 1,
            "relative_humidity_2m": 60,
            "wind_speed_10m": 15.2,
            "wind_direction_10m": 220,
            "surface_pressure": 1015.0,
            "dew_point_2m": 14.0,
            "cloud_cover": 10,
            "precipitation": 0.0,
            "uv_index": 5.5,
        },
        "hourly": {
            "time": [f"2026-09-12T{h:02d}:00" for h in range(24)],
            "temperature_2m": [20 + h * 0.2 for h in range(24)],
            "weather_code": [0] * 24,
            "is_day": [1 if 6 <= h <= 19 else 0 for h in range(24)],
            "precipitation_probability": [5] * 24,
            "wind_speed_10m": [12.0] * 24,
        },
        "daily": {
            "time": [f"2026-09-{12+d:02d}" for d in range(7)],
            "weather_code": [0] * 7,
            "temperature_2m_max": [27.0] * 7,
            "temperature_2m_min": [18.0] * 7,
            "precipitation_probability_max": [10] * 7,
            "uv_index_max": [6.0] * 7,
            "sunrise": ["2026-09-12T06:30"],
            "sunset": ["2026-09-12T19:45"],
        },
    }

    result = service._transform_weather_data(mock_raw, 33.57, -7.59)
    assert result.current.temperature == 24.5
    assert result.current.isNight is False
    assert len(result.daily) == 7
    assert len(result.hourly) <= 24
    assert result.location.timezone == "Africa/Casablanca"
