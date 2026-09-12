# STRATOS — Atmospheric Intelligence & Weather Platform

An exceptional, production-grade, futuristic weather intelligence platform. Designed with real-time dynamic atmospheric canvas visualization, interactive bento telemetry grid, 24-hour horizon timeline, 7-day synoptic forecast, live satellite radar, and Python FastAPI backend with intelligent multi-tier TTL caching.

---

## Visual & Atmospheric Architecture

- **Dynamic Weather Atmosphere (GPU Canvas)**:
  - **Sunny / Clear**: Solar flare illumination and floating light motes.
  - **Clear Night**: Starlight vault with twinkling stars and moon elevation.
  - **Rain & Showers**: Slanted high-velocity raindrops with surface splash rings.
  - **Thunderstorm**: Dark navy electric atmosphere with sheet lightning flashes.
  - **Snowfall**: 3D floating crystals with sinusoidal wind turbulence.
  - **Clouds / Overcast**: Volumetric atmospheric cloud layers drifting across depth planes.
- **Meteorological Bento Grid**:
  - **Wind Dynamics**: Real-time speed, gusts, and animated 360° compass needle.
  - **UV Solar Exposure**: Radial risk meter (Low / Moderate / High / Extreme) with exposure guidelines.
  - **Humidity & Saturation**: Liquid fill level and dew point condensation threshold.
  - **Barometric Pressure**: Surface hPa with altimeter trend.
  - **Visibility**: Horizon optical distance in km / miles.
  - **Solar Ephemeris Arc**: Sinusoidal daylight curve displaying Dawn, Sunrise, Solar Noon, Sunset, and Dusk.
- **Geospatial Doppler Radar**:
  - CartoDB Dark Matter tile layer with active station crosshair and layer switchers (Surface Temp, Precipitation, Wind Stream, Cloud Deck).
- **Instant Search & Geolocation**:
  - Debounced auto-complete city search with keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`), recent searches history, and GPS one-click lock.
  - Quick keyboard shortcut: Press `/` to immediately focus search.
  - Unit switcher: Seamlessly toggle between Celsius (°C) and Fahrenheit (°F).

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, Tailwind CSS, Vanilla Modern JS (ES Modules), HTML5 Canvas Engine, Leaflet.js |
| **Backend** | Python 3.12+, FastAPI, Pydantic v2, HTTPX Async Client, Uvicorn |
| **Weather Engine** | Open-Meteo High-Resolution Meteorological & Geocoding Grid (100% Free, zero keys required) |
| **Caching** | Multi-tier in-memory TTL cache (10-minute weather cache, 24-hour geocoding cache) |
| **Infrastructure** | Docker, Docker Compose, Nginx Reverse Proxy with Gzip & Security Headers |
| **Security** | Sliding window rate limiting, CSP, HSTS, X-Frame-Options, input validation |

---

## Project Structure

```
├── frontend/
│   ├── index.html                   # Master Weather Intelligence Application
│   ├── css/
│   │   └── design-system.css        # Atmospheric themes, glass bento, animations
│   ├── js/
│   │   ├── engine/
│   │   │   ├── weather-canvas.js    # Real-time atmospheric canvas renderer
│   │   │   └── sun-ephemeris.js     # Sinusoidal celestial arc generator
│   │   ├── components/
│   │   │   ├── search.js            # Instant city search with autocomplete
│   │   │   ├── hourly-chart.js      # 24-hour horizontal forecast ribbon
│   │   │   ├── daily-forecast.js    # 7-day synoptic forecast with range bars
│   │   │   ├── metrics-bento.js     # Meteorological sensor grid
│   │   │   └── weather-map.js       # Geospatial satellite radar map
│   │   ├── services/
│   │   │   ├── api.js               # Resilient backend API client with offline fallback
│   │   │   └── storage.js           # LocalStorage favorites, units, history
│   │   └── app.js                   # Main application coordinator
│   └── assets/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI factory, CORS, exception handlers
│   │   ├── api/routes/
│   │   │   ├── weather.py           # /weather/forecast, /weather/current, /hourly, /daily
│   │   │   └── locations.py         # /locations/search, /locations/reverse
│   │   ├── clients/
│   │   │   └── weather_api.py       # Async Open-Meteo client
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic Settings
│   │   │   └── cache.py             # High-speed TTL cache
│   │   ├── middleware/
│   │   │   ├── rate_limiter.py      # Request rate limiter
│   │   │   └── security_headers.py  # Security headers injector
│   │   ├── schemas/
│   │   │   ├── common.py            # Standard ApiResponse envelope
│   │   │   ├── weather.py           # Meteorological models
│   │   │   └── location.py          # Geocoding models
│   │   └── services/
│   │       └── weather_service.py   # Business logic, transformations, caching
│   ├── tests/                       # Unit & integration tests
│   ├── Dockerfile
│   └── requirements.txt
├── nginx/
│   └── nginx.conf                   # Nginx reverse proxy configuration
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start Guide

### Option 1: Direct Local Execution (No Docker required)

1. **Frontend**:
   Open `frontend/index.html` in any modern web browser. It comes pre-equipped with an offline atmospheric telemetry simulator that works instantly!

2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
   Interactive OpenAPI documentation available at: `http://localhost:8000/docs`

### Option 2: Docker Compose (Production Setup)

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost`
- **FastAPI Backend**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost/healthz`

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/weather/forecast?lat={lat}&lon={lon}` | Full meteorological telemetry (Current, 24h Hourly, 7d Daily) |
| `GET` | `/api/v1/weather/current?lat={lat}&lon={lon}` | Real-time current sensor values |
| `GET` | `/api/v1/weather/hourly?lat={lat}&lon={lon}` | 24-hour hourly trajectory |
| `GET` | `/api/v1/weather/daily?lat={lat}&lon={lon}` | 7-day extended synoptic outlook |
| `GET` | `/api/v1/locations/search?q={query}` | Global city geocoding with autocomplete |
| `GET` | `/healthz` | Platform health status |

---

## License & Credits
Built with precision. Meteorological data delivered via the Open-Meteo High-Resolution Global Atmospheric Model.
