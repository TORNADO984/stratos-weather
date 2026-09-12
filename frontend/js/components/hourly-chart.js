/**
 * STRATOS 24-Hour Horizon Forecast Component
 * Renders an ultra-smooth, responsive horizontal timeline with precipitation bars.
 */

import { getWeatherMeta } from '../utils/weather-icons.js';
import { storage } from '../services/storage.js';

export function renderHourlyForecast(containerId, hourlyData) {
  const container = document.getElementById(containerId);
  if (!container || !hourlyData || hourlyData.length === 0) return;

  const unit = storage.getUnit();

  container.innerHTML = `
    <div class="hourly-strip scrollbar-hidden">
      ${hourlyData.slice(0, 24).map((item, idx) => {
        const meta = getWeatherMeta(item.weatherCode, item.isNight);
        const temp = storage.convertTemp(item.temperature, unit);
        const isCurrent = idx === 0;

        return `
          <div class="hourly-card ${isCurrent ? 'active-hour' : ''}">
            <span class="text-xs font-mono ${isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-400'}">
              ${isCurrent ? 'Now' : item.time}
            </span>

            <div class="w-7 h-7 my-2 shrink-0 ${isCurrent ? 'weather-icon-animated' : ''}">
              ${meta.icon}
            </div>

            <span class="text-base font-display font-semibold text-white">
              ${temp}°
            </span>

            <div class="flex items-center gap-1 mt-2 text-[11px] font-mono ${item.precipitationProb > 25 ? 'text-cyan-400 font-semibold' : 'text-slate-500'}">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
              <span>${item.precipitationProb}%</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
