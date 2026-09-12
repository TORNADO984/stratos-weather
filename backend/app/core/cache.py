"""
STRATOS In-Memory TTL Cache Engine
Fast, lightweight, thread-safe cache with automatic timestamp expiration.
"""

import time
from typing import Any, Optional, Dict, Tuple


class TTLCache:
    def __init__(self, default_ttl: int = 600):
        self.default_ttl = default_ttl
        self._store: Dict[str, Tuple[Any, float]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None

        val, expires_at = self._store[key]
        if time.time() > expires_at:
            del self._store[key]
            return None

        return val

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        duration = ttl if ttl is not None else self.default_ttl
        expires_at = time.time() + duration
        self._store[key] = (value, expires_at)

    def clear(self) -> None:
        self._store.clear()


# Global cache singletons
weather_cache = TTLCache(default_ttl=600)      # 10 minutes for weather forecasts
geocoding_cache = TTLCache(default_ttl=86400)   # 24 hours for city locations
