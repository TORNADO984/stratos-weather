/**
 * STRATOS Multi-Station Atmospheric Comparison Modal
 * Compares prominent meteorological nodes side-by-side.
 */

import { storage } from '../services/storage.js';
import { getWeatherMeta } from '../utils/weather-icons.js';

export class CityCompareModal {
  constructor(modalId = 'comparison-modal') {
    this.modal = document.getElementById(modalId);
    this.openBtn = document.getElementById('compare-toggle-btn');
    this.container = document.getElementById('comparison-grid-container');
    this.isOpen = false;

    this.init();
  }

  init() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal || e.target.closest('[data-close-compare]')) {
          this.close();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }

  async open() {
    if (!this.modal) return;
    this.isOpen = true;
    this.modal.classList.remove('hidden');

    this.renderLoading();
    const data = await this.fetchComparisonData();
    this.renderData(data);
  }

  close() {
    if (!this.modal) return;
    this.isOpen = false;
    this.modal.classList.add('hidden');
  }

  async fetchComparisonData() {
    try {
      const res = await fetch('/api/v1/weather/compare');
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    } catch {
      // Fallback comparative data
      return [
        { name: 'Casablanca', country: 'Morocco', temperature: 26.6, weatherCode: 0, humidity: 62, windSpeed: 16.4, surfacePressure: 1016.0, uvIndex: 6.8 },
        { name: 'Tokyo', country: 'Japan', temperature: 18.2, weatherCode: 2, humidity: 74, windSpeed: 11.8, surfacePressure: 1012.4, uvIndex: 4.2 },
        { name: 'Paris', country: 'France', temperature: 15.0, weatherCode: 61, humidity: 82, windSpeed: 22.0, surfacePressure: 1008.2, uvIndex: 2.1 },
        { name: 'New York', country: 'United States', temperature: 21.4, weatherCode: 0, humidity: 55, windSpeed: 14.5, surfacePressure: 1018.5, uvIndex: 5.5 },
      ];
    }
  }

  renderLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="col-span-full p-12 text-center text-slate-400 flex items-center justify-center gap-3">
        <svg class="w-5 h-5 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        <span class="font-mono text-xs">Synchronizing atmospheric quadrants...</span>
      </div>
    `;
  }

  renderData(stations) {
    if (!this.container || !stations) return;
    const unit = storage.getUnit();

    this.container.innerHTML = stations.map(s => {
      const meta = getWeatherMeta(s.weatherCode, false);
      const temp = storage.convertTemp(s.temperature, unit);
      const wind = storage.formatWind(s.windSpeed, unit);

      return `
        <div class="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between hover:border-cyan-500/30 transition-all">
          <div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-display font-bold text-lg text-white">${s.name}</h3>
                <div class="text-xs text-slate-400 font-mono">${s.country}</div>
              </div>
              <div class="w-8 h-8 shrink-0">
                ${meta.icon}
              </div>
            </div>

            <div class="my-4">
              <div class="text-3xl font-display font-black text-white">${temp}°<span class="text-sm font-normal text-cyan-300"> ${unit}</span></div>
              <div class="text-xs text-slate-300 mt-0.5">${meta.label}</div>
            </div>
          </div>

          <div class="border-t border-white/5 pt-3 space-y-2 text-xs font-mono">
            <div class="flex justify-between text-slate-400">
              <span>Humidity:</span>
              <span class="text-white">${s.humidity}%</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Wind Speed:</span>
              <span class="text-cyan-300">${wind}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Pressure:</span>
              <span class="text-slate-200">${Math.round(s.surfacePressure)} hPa</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Solar UV:</span>
              <span class="text-amber-400">${s.uvIndex}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}
