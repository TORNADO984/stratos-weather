"""
STRATOS Weather Service
Encapsulates business logic, data transformation, and multi-tier TTL caching.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional

from app.clients.weather_api import weather_client
from app.core.cache import weather_cache, geocoding_cache
from app.schemas.weather import (
    FullWeatherResponse,
    CurrentWeather,
    HourlyItem,
    DailyItem,
    LocationMeta,
)
from app.schemas.location import CitySearchResult


class WeatherService:
    @staticmethod
    def _make_cache_key(lat: float, lon: float) -> str:
        # Round coordinates to ~1km precision to maximize cache hit rates
        return f"forecast_{round(lat, 2)}_{round(lon, 2)}"

    async def get_forecast(self, lat: float, lon: float) -> FullWeatherResponse:
        cache_key = self._make_cache_key(lat, lon)
        cached = weather_cache.get(cache_key)
        if cached:
            return cached

        # Query upstream
        raw = await weather_client.fetch_weather_forecast(lat, lon)
        transformed = self._transform_weather_data(raw, lat, lon)

        # Store in cache (10 min TTL)
        weather_cache.set(cache_key, transformed)
        return transformed

    async def search_locations(self, query: str) -> List[CitySearchResult]:
        q = query.strip().lower()
        cached = geocoding_cache.get(f"geo_{q}")
        if cached:
            return cached

        raw_results = await weather_client.search_geocoding(query)
        results = [
            CitySearchResult(
                id=r.get("id"),
                name=r.get("name", "Unknown"),
                latitude=r.get("latitude", 0.0),
                longitude=r.get("longitude", 0.0),
                country=r.get("country", ""),
                countryCode=r.get("country_code", ""),
                admin1=r.get("admin1"),
                timezone=r.get("timezone"),
                elevation=r.get("elevation"),
            )
            for r in raw_results
        ]

        geocoding_cache.set(f"geo_{q}", results)
        return results

    def _transform_weather_data(self, raw: Dict[str, Any], lat: float, lon: float) -> FullWeatherResponse:
        current_raw = raw.get("current", {})
        hourly_raw = raw.get("hourly", {})
        daily_raw = raw.get("daily", {})

        is_day = current_raw.get("is_day", 1) == 1

        # Current sunrise / sunset from daily array
        sunrise_list = daily_raw.get("sunrise", [])
        sunset_list = daily_raw.get("sunset", [])
        today_sunrise = sunrise_list[0] if sunrise_list else datetime.now().isoformat()
        today_sunset = sunset_list[0] if sunset_list else datetime.now().isoformat()

        current = CurrentWeather(
            temperature=current_raw.get("temperature_2m", 20.0),
            apparentTemperature=current_raw.get("apparent_temperature", 20.0),
            weatherCode=current_raw.get("weather_code", 0),
            isNight=not is_day,
            relativeHumidity=int(current_raw.get("relative_humidity_2m", 50)),
            windSpeed=float(current_raw.get("wind_speed_10m", 10.0)),
            windDirection=int(current_raw.get("wind_direction_10m", 0)),
            surfacePressure=float(current_raw.get("surface_pressure", 1013.2)),
            visibility=10000.0,
            uvIndex=float(current_raw.get("uv_index", 0.0)),
            dewPoint=float(current_raw.get("dew_point_2m", 12.0)),
            cloudCover=int(current_raw.get("cloud_cover", 0)),
            precipitation=float(current_raw.get("precipitation", 0.0)),
            sunrise=today_sunrise,
            sunset=today_sunset,
        )

        # 24-hour forecast
        hourly_items: List[HourlyItem] = []
        times = hourly_raw.get("time", [])
        temps = hourly_raw.get("temperature_2m", [])
        codes = hourly_raw.get("weather_code", [])
        days = hourly_raw.get("is_day", [])
        probs = hourly_raw.get("precipitation_probability", [])
        winds = hourly_raw.get("wind_speed_10m", [])

        now_hour_str = datetime.now().strftime("%Y-%m-%dT%H:00")
        start_idx = 0
        for i, t in enumerate(times):
            if t >= now_hour_str:
                start_idx = i
                break

        for i in range(start_idx, min(start_idx + 24, len(times))):
            t_iso = times[i]
            # Extract HH:00
            hour_display = t_iso.split("T")[1][:5] if "T" in t_iso else t_iso
            hourly_items.append(
                HourlyItem(
                    time=hour_display,
                    temperature=temps[i] if i < len(temps) else current.temperature,
                    weatherCode=codes[i] if i < len(codes) else current.weatherCode,
                    isNight=(days[i] == 0) if i < len(days) else current.isNight,
                    precipitationProb=int(probs[i]) if i < len(probs) else 0,
                    windSpeed=float(winds[i]) if i < len(winds) else current.windSpeed,
                )
            )

        # 7-day forecast
        daily_items: List[DailyItem] = []
        d_times = daily_raw.get("time", [])
        d_codes = daily_raw.get("weather_code", [])
        d_maxs = daily_raw.get("temperature_2m_max", [])
        d_mins = daily_raw.get("temperature_2m_min", [])
        d_probs = daily_raw.get("precipitation_probability_max", [])
        d_uvs = daily_raw.get("uv_index_max", [])

        day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

        for d in range(min(7, len(d_times))):
            d_str = d_times[d]
            try:
                dt_obj = datetime.strptime(d_str, "%Y-%m-%d")
                day_name = "Today" if d == 0 else day_names[int(dt_obj.strftime("%w"))]
                formatted_date = dt_obj.strftime("%b %d")
            except Exception:
                day_name = "Today" if d == 0 else f"+{d}d"
                formatted_date = d_str

            daily_items.append(
                DailyItem(
                    day=day_name,
                    date=formatted_date,
                    weatherCode=d_codes[d] if d < len(d_codes) else 0,
                    tempMax=d_maxs[d] if d < len(d_maxs) else current.temperature + 3,
                    tempMin=d_mins[d] if d < len(d_mins) else current.temperature - 4,
                    precipitationProb=int(d_probs[d]) if d < len(d_probs) else 0,
                    uvIndex=float(d_uvs[d]) if d < len(d_uvs) else current.uvIndex,
                )
            )

        location = LocationMeta(
            name="Atmospheric Station",
            country="Global Sensor",
            latitude=lat,
            longitude=lon,
            elevation=raw.get("elevation", 0),
            timezone=raw.get("timezone", "UTC"),
        )

        return FullWeatherResponse(
            current=current,
            hourly=hourly_items,
            daily=daily_items,
            location=location,
        )


weather_service = WeatherService()
