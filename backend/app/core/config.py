"""
STRATOS Configuration System
Loads environment variables safely using Pydantic Settings.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "STRATOS Weather Intelligence"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "2.4.0"
    ENVIRONMENT: str = "development"

    # Weather API Provider ("open-meteo", "openweathermap", etc.)
    WEATHER_API_PROVIDER: str = "open-meteo"
    WEATHER_API_KEY: str = ""

    # Cache Settings
    CACHE_TTL_WEATHER_SECONDS: int = 600  # 10 minutes
    CACHE_TTL_GEOCODING_SECONDS: int = 86400  # 24 hours

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
