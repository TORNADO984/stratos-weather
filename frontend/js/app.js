/**
 * STRATOS Application Coordinator & State Engine
 */

import { WeatherAtmosphereEngine } from './engine/weather-canvas.js';
import { renderSunEphemeris } from './engine/sun-ephemeris.js';
import { CitySearch } from './components/search.js';
import { renderHourlyForecast } from './components/hourly-chart.js';
import { renderDailyForecast } from './components/daily-forecast.js';
import { renderMetricsBento } from './components/metrics-bento.js';
import { WeatherMap } from './components/weather-map.js';
import { getWeatherMeta } from './utils/weather-icons.js';
import { weatherApi } from './services/api.js';
import { storage } from './services/storage.js';

class StratosApp {
  constructor() {
    this.currentData = null;
    this.currentCity = {
      name: 'Casablanca',
      country: 'Morocco',
      latitude: 33.5731,
      longitude: -7.5898,
    };

    this.engine = null;
    this.radarMap = null;
    this.search = null;

    this.init();
  }

  init() {
    // 1. Initialize Atmospheric Canvas
    this.engine = new WeatherAtmosphereEngine('weather-canvas');

    // 2. Initialize Radar Map
    this.radarMap = new WeatherMap('radar-map-container');

    // 3. Initialize Search
    this.search = new CitySearch({
      inputId: 'city-search-input',
      resultsId: 'search-results-dropdown',
      onSelectCity: (city) => this.loadCity(city),
    });

    // 4. Unit Switcher Listener (°C / °F)
    const unitToggleBtn = document.getElementById('unit-toggle-btn');
    if (unitToggleBtn) {
      unitToggleBtn.addEventListener('click', () => {
        const nextUnit = storage.toggleUnit();
        unitToggleBtn.textContent = `°${nextUnit}`;
        this.renderAll();
      });
      unitToggleBtn.textContent = `°${storage.getUnit()}`;
    }

    // 5. "Use My Location" GPS Button
    const locationBtn = document.getElementById('geolocation-btn');
    if (locationBtn) {
      locationBtn.addEventListener('click', () => this.requestGeolocation());
    }

    // 6. Favorite City Action
    const favoriteBtn = document.getElementById('favorite-toggle-btn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        if (storage.isFavorite(this.currentCity.name)) {
          storage.removeFavorite(this.currentCity.name);
        } else {
          storage.saveFavorite(this.currentCity);
        }
        this.updateFavoriteButton();
      });
    }

    // 7. Load Default City (Casablanca, Morocco)
    this.loadCity(this.currentCity);

    // 8. Auto-refresh every 5 minutes
    setInterval(() => {
      if (this.currentCity) {
        this.loadCity(this.currentCity, true);
      }
    }, 300000);
  }

  async requestGeolocation() {
    const locationBtn = document.getElementById('geolocation-btn');
    if (locationBtn) {
      locationBtn.classList.add('animate-spin');
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      locationBtn?.classList.remove('animate-spin');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const loc = await weatherApi.reverseGeocode(lat, lon);
          this.loadCity({
            name: loc.name || 'Local Station',
            country: loc.country || 'Current Fix',
            latitude: lat,
            longitude: lon,
          });
        } catch {
          this.loadCity({
            name: 'Local Station',
            country: 'GPS Location',
            latitude: lat,
            longitude: lon,
          });
        } finally {
          locationBtn?.classList.remove('animate-spin');
        }
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        locationBtn?.classList.remove('animate-spin');
        // Show subtle non-blocking notification
        const banner = document.getElementById('alert-banner');
        if (banner) {
          banner.classList.remove('hidden');
          banner.innerHTML = `
            <div class="p-3 bg-amber-950/80 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-200">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span>Location access was declined. You can still search for any global city above.</span>
              </div>
              <button onclick="this.parentElement.parentElement.classList.add('hidden')" class="text-amber-400 hover:text-white">&times;</button>
            </div>
          `;
        }
      },
      { timeout: 8000 }
    );
  }

  async loadCity(city, silent = false) {
    this.currentCity = city;

    if (!silent) {
      this.showSkeletons();
    }

    try {
      const data = await weatherApi.fetchForecast(city.latitude, city.longitude);
      this.currentData = data;

      // Update atmospheric canvas condition
      if (this.engine && data.current) {
        this.engine.setWeatherCondition(data.current.weatherCode, data.current.isNight);
      }

      // Update radar map position
      if (this.radarMap) {
        this.radarMap.updateLocation(city.latitude, city.longitude, city.name);
      }

      this.renderAll();
    } catch (err) {
      console.error('Failed to load forecast:', err);
    } finally {
      this.hideSkeletons();
    }
  }

  renderAll() {
    if (!this.currentData) return;

    this.renderHero();
    renderHourlyForecast('hourly-forecast-container', this.currentData.hourly);
    renderDailyForecast('daily-forecast-container', this.currentData.daily);
    renderMetricsBento('metrics-bento-container', this.currentData.current);
    
    if (this.currentData.current) {
      renderSunEphemeris('sun-ephemeris-container', {
        sunrise: this.currentData.current.sunrise,
        sunset: this.currentData.current.sunset,
      });
    }

    this.updateFavoriteButton();
    this.updateLocalClock();
  }

  renderHero() {
    const cur = this.currentData.current;
    if (!cur) return;

    const unit = storage.getUnit();
    const meta = getWeatherMeta(cur.weatherCode, cur.isNight);

    const temp = storage.convertTemp(cur.temperature, unit);
    const feelsLike = storage.convertTemp(cur.apparentTemperature, unit);

    // Get today's High and Low from daily data
    let high = '--', low = '--';
    if (this.currentData.daily && this.currentData.daily[0]) {
      high = storage.convertTemp(this.currentData.daily[0].tempMax, unit);
      low = storage.convertTemp(this.currentData.daily[0].tempMin, unit);
    }

    // City & Country
    document.getElementById('hero-city-name').textContent = this.currentCity.name;
    document.getElementById('hero-country-name').textContent = this.currentCity.country;

    // Coordinates pill
    const coordsEl = document.getElementById('hero-coords');
    if (coordsEl) {
      coordsEl.textContent = `${this.currentCity.latitude.toFixed(2)}°N, ${Math.abs(this.currentCity.longitude).toFixed(2)}°${this.currentCity.longitude < 0 ? 'W' : 'E'}`;
    }

    // Temperature & Conditions
    document.getElementById('hero-temp-num').textContent = temp;
    document.getElementById('hero-unit-label').textContent = `°${unit}`;
    document.getElementById('hero-condition-text').textContent = meta.label;
    document.getElementById('hero-feels-like').textContent = `Feels like ${feelsLike}°`;
    document.getElementById('hero-high-low').textContent = `H: ${high}°  L: ${low}°`;

    // Weather Icon
    const iconContainer = document.getElementById('hero-weather-icon');
    if (iconContainer) {
      iconContainer.innerHTML = meta.icon;
    }

    // Severe Weather Alert Banner (Simulated intelligence advisory)
    const alertContainer = document.getElementById('alert-banner');
    if (alertContainer) {
      if (cur.weatherCode >= 95 || cur.windSpeed > 60) {
        alertContainer.classList.remove('hidden');
        alertContainer.innerHTML = `
          <div class="p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl flex items-start gap-3 backdrop-blur-md shadow-2xl text-xs text-rose-100 mb-6">
            <svg class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <div class="flex-1">
              <div class="font-bold text-white text-sm">METEOROLOGICAL ADVISORY: ${meta.label.toUpperCase()}</div>
              <div class="text-rose-200/90 mt-0.5">High convective atmospheric activity detected across the quadrant. Wind gusts reaching ${storage.formatWind(cur.windSpeed * 1.4, unit)}. Exercise caution on marine and exposed roadways.</div>
            </div>
            <button onclick="this.parentElement.parentElement.classList.add('hidden')" class="text-rose-300 hover:text-white p-1">&times;</button>
          </div>
        `;
      } else {
        alertContainer.classList.add('hidden');
      }
    }
  }

  updateLocalClock() {
    const clockEl = document.getElementById('hero-local-time');
    if (!clockEl) return;

    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  updateFavoriteButton() {
    const favBtn = document.getElementById('favorite-toggle-btn');
    if (!favBtn) return;

    const isFav = storage.isFavorite(this.currentCity.name);
    if (isFav) {
      favBtn.innerHTML = `
        <svg class="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      `;
      favBtn.setAttribute('title', 'Remove from Favorites');
    } else {
      favBtn.innerHTML = `
        <svg class="w-5 h-5 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
      `;
      favBtn.setAttribute('title', 'Save to Favorites');
    }
  }

  showSkeletons() {
    document.querySelectorAll('.data-skeleton-target').forEach(el => el.classList.add('opacity-50'));
  }

  hideSkeletons() {
    document.querySelectorAll('.data-skeleton-target').forEach(el => el.classList.remove('opacity-50'));
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.stratos = new StratosApp();
});
