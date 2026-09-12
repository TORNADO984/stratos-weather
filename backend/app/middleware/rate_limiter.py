"""
Sliding Window Rate Limiter Middleware
Guards API endpoints from brute-force or scrapers.
"""

import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.core.config import settings


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.clients = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Only rate limit /api/ endpoints
        if not request.url.path.startswith("/api/"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        # Clean old timestamps
        timestamps = [t for t in self.clients[client_ip] if now - t < self.window_seconds]
        if len(timestamps) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "data": None,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Too many requests. Limit is {self.max_requests} requests per minute.",
                    },
                },
            )

        timestamps.append(now)
        self.clients[client_ip] = timestamps

        return await call_next(request)
