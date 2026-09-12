# STRATOS — Atmospheric Intelligence & Weather Platform

An exceptional, production-grade, futuristic weather intelligence platform. Designed with real-time dynamic atmospheric canvas visualization, interactive bento telemetry grid, 24-hour horizon timeline, 7-day synoptic forecast, live satellite radar, air quality telemetry, lunar ephemeris, generative audio soundscapes, and Python FastAPI backend with intelligent multi-tier TTL caching.

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
  - **Air Quality Matrix (AQI)**: Real-time US AQI, European AQI, PM2.5, PM10, Ozone, NO₂, and CO with health recommendations.
  - **Lunar Cycle & Moon Phase**: Astronomical Julian calculation of moon age, phase (e.g. Waxing Gibbous), illumination percentage, and SVG moon sphere.
- **Generative Atmospheric Audio Synthesizer**:
  - Uses the HTML5 Web Audio API to procedurally generate environmental soundscapes (filtered rain white-noise, deep cosmic interstellar drones, solar harmonics) with zero external media files.
- **Global Multi-Station Comparative Matrix**:
  - Side-by-side synchronized telemetry comparing Casablanca, Tokyo, Paris, and New York.
- **Geospatial Doppler Radar**:
  - CartoDB Dark Matter tile layer with active station crosshair and layer switchers (Surface Temp, Precipitation, Wind Stream, Cloud Deck).
- **Instant Search & Geolocation**:
  - Debounced auto-complete city search with keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`), recent searches history, and GPS one-click lock.
  - Quick keyboard shortcut: Press `/` to immediately focus search.
  - Unit switcher: Seamlessly toggle between Celsius (°C) and Fahrenheit (°F).
  - Saved Stations Drawer: Slide-over drawer to manage and jump to bookmarked cities.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, Tailwind CSS, Vanilla Modern JS (ES Modules), HTML5 Canvas Engine, Web Audio API, Leaflet.js |
| **Backend** | Python 3.12+, FastAPI, Pydantic v2, HTTPX Async Client, Uvicorn |
| **Weather & AQ Engine** | Open-Meteo High-Resolution Meteorological & Air Quality Grid (100% Free, zero keys required) |
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
│   │   │   ├── sun-ephemeris.js     # Sinusoidal celestial arc generator
│   │   │   └── moon-phase.js        # Astronomical lunar cycle visualizer
│   │   ├── components/
│   │   │   ├── search.js            # Instant city search with autocomplete
│   │   │   ├── hourly-chart.js      # 24-hour horizontal forecast ribbon
│   │   │   ├── daily-forecast.js    # 7-day synoptic forecast with range bars
│   │   │   ├── metrics-bento.js     # Meteorological sensor grid
│   │   │   ├── air-quality.js       # US/EU AQI and particulate breakdown
│   │   │   ├── ambient-audio.js     # Web Audio API soundscape synthesizer
│   │   │   ├── city-compare.js      # Multi-station comparison modal
│   │   │   ├── favorites-drawer.js  # Slide-over saved stations drawer
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
│   │   │   ├── weather.py           # /forecast, /current, /hourly, /daily, /air-quality, /compare
│   │   │   └── locations.py         # /locations/search, /locations/reverse
│   │   ├── clients/
│   │   │   └── weather_api.py       # Async Open-Meteo & Air Quality client
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic Settings
│   │   │   └── cache.py             # High-speed TTL cache
│   │   ├── middleware/
│   │   │   ├── rate_limiter.py      # Request rate limiter
│   │   │   └── security_headers.py  # Security headers injector
│   │   ├── schemas/
│   │   │   ├── common.py            # Standard ApiResponse envelope
│   │   │   ├── weather.py           # Meteorological & AQ models
│   │   │   └── location.py          # Geocoding models
│   │   └── services/
│   │       └── weather_service.py   # Business logic, transformations, caching
│   ├── tests/                       # Unit & integration tests (9 tests passing)
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
| `GET` | `/api/v1/weather/forecast?lat={lat}&lon={lon}` | Full meteorological telemetry (Current, 24h Hourly, 7d Daily, Air Quality) |
| `GET` | `/api/v1/weather/current?lat={lat}&lon={lon}` | Real-time current sensor values |
| `GET` | `/api/v1/weather/hourly?lat={lat}&lon={lon}` | 24-hour hourly trajectory |
| `GET` | `/api/v1/weather/daily?lat={lat}&lon={lon}` | 7-day extended synoptic outlook |
| `GET` | `/api/v1/weather/air-quality?lat={lat}&lon={lon}` | US/EU AQI and particulate pollutants breakdown |
| `GET` | `/api/v1/weather/compare` | Synchronized telemetry comparison of major stations |
| `GET` | `/api/v1/locations/search?q={query}` | Global city geocoding with autocomplete |
| `GET` | `/healthz` | Platform health status |

---

## License & Credits
Built with precision. Meteorological data delivered via the Open-Meteo High-Resolution Global Atmospheric Model.
