"""
API Route Integration Tests
"""

import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["docs"] == "/docs"


def test_validation_error_on_invalid_coordinates():
    # Lat must be between -90 and 90
    response = client.get("/api/v1/weather/forecast?lat=999&lon=0")
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_security_headers_present():
    response = client.get("/healthz")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"


def test_air_quality_endpoint():
    response = client.get("/api/v1/weather/air-quality?lat=33.57&lon=-7.59")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "usAqi" in data["data"]
    assert "pm25" in data["data"]
    assert "statusLabel" in data["data"]


def test_city_compare_endpoint():
    response = client.get("/api/v1/weather/compare")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1
    station = data["data"][0]
    assert "name" in station
    assert "temperature" in station
