/**
 * STRATOS 7-Day Synoptic Forecast Component
 * Renders weekly forecasts with min/max comparative range bars and rain badges.
 */

import { getWeatherMeta } from '../utils/weather-icons.js';
import { storage } from '../services/storage.js';

export function renderDailyForecast(containerId, dailyData) {
  const container = document.getElementById(containerId);
  if (!container || !dailyData || dailyData.length === 0) return;

  const unit = storage.getUnit();

  // Find overall min and max across all 7 days to calculate proportional range bars
  const allMins = dailyData.map(d => d.tempMin);
  const allMaxs = dailyData.map(d => d.tempMax);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const totalRange = Math.max(globalMax - globalMin, 1);

  container.innerHTML = `
    <div class="flex flex-col divide-y divide-white/5">
      ${dailyData.slice(0, 7).map((day, idx) => {
        const meta = getWeatherMeta(day.weatherCode, false);
        const minTemp = storage.convertTemp(day.tempMin, unit);
        const maxTemp = storage.convertTemp(day.tempMax, unit);

        // Proportions for range bar
        const leftPercent = Math.max(0, ((day.tempMin - globalMin) / totalRange) * 100);
        const widthPercent = Math.max(15, ((day.tempMax - day.tempMin) / totalRange) * 100);

        return `
          <div class="py-3 px-3 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors rounded-lg">
            <!-- Day & Date -->
            <div class="w-24 shrink-0">
              <div class="text-sm font-semibold text-white">${day.day}</div>
              <div class="text-[11px] text-slate-400 font-mono">${day.date}</div>
            </div>

            <!-- Weather Icon & Condition -->
            <div class="flex items-center gap-2.5 w-36 shrink-0">
              <div class="w-6 h-6 shrink-0">
                ${meta.icon}
              </div>
              <span class="text-xs text-slate-300 truncate font-medium">
                ${meta.label}
              </span>
            </div>

            <!-- Precipitation Probability -->
            <div class="w-14 text-center shrink-0 font-mono text-xs">
              ${day.precipitationProb > 20 ? `
                <span class="text-cyan-400 flex items-center justify-center gap-0.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                  ${day.precipitationProb}%
                </span>
              ` : `
                <span class="text-slate-600">--</span>
              `}
            </div>

            <!-- Temperature Range Bar -->
            <div class="flex items-center gap-2.5 flex-1 max-w-xs">
              <span class="text-xs font-mono text-slate-400 w-7 text-right shrink-0">
                ${minTemp}°
              </span>

              <div class="flex-1 temp-range-track relative">
                <div class="temp-range-fill absolute top-0 bottom-0" 
                     style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
              </div>

              <span class="text-xs font-mono font-semibold text-white w-7 shrink-0">
                ${maxTemp}°
              </span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
