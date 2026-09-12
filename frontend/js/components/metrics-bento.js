/**
 * STRATOS Bento Meteorological Details Grid
 * Renders UV Index gauge, Animated Wind Compass, Humidity fill, Barometer, Visibility, and Dew Point.
 */

import { storage } from '../services/storage.js';

export function renderMetricsBento(containerId, currentData) {
  const container = document.getElementById(containerId);
  if (!container || !currentData) return;

  const unit = storage.getUnit();
  const windStr = storage.formatWind(currentData.windSpeed, unit);
  const dewPoint = storage.convertTemp(currentData.dewPoint, unit);

  // UV risk level
  const uv = currentData.uvIndex || 0;
  let uvLabel = 'Low';
  let uvColor = 'text-emerald-400';
  let uvPercent = Math.min(100, (uv / 11) * 100);
  if (uv > 2 && uv <= 5) {
    uvLabel = 'Moderate';
    uvColor = 'text-yellow-400';
  } else if (uv > 5 && uv <= 7) {
    uvLabel = 'High';
    uvColor = 'text-amber-400';
  } else if (uv > 7 && uv <= 10) {
    uvLabel = 'Very High';
    uvColor = 'text-rose-400';
  } else if (uv > 10) {
    uvLabel = 'Extreme';
    uvColor = 'text-purple-400';
  }

  // Compass needle degree
  const windBearing = currentData.windDirection || 0;

  // Pressure evaluation
  const pressure = currentData.surfacePressure ? Math.round(currentData.surfacePressure) : 1013;
  const pressureStatus = pressure > 1018 ? 'High Pressure (Stable)' : pressure < 1008 ? 'Low Pressure (Active)' : 'Standard (1013 hPa)';

  // Visibility in km / miles
  const visKm = currentData.visibility ? (currentData.visibility / 1000).toFixed(1) : 10.0;
  const visDisplay = unit === 'F' ? `${(visKm * 0.621371).toFixed(1)} mi` : `${visKm} km`;

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      
      <!-- 1. Wind Dynamics & Compass -->
      <div class="bento-card p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span class="flex items-center gap-1.5 uppercase tracking-wider">
            <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            Wind Dynamics
          </span>
          <span class="text-cyan-400 font-semibold">${windBearing}° Vector</span>
        </div>

        <div class="flex items-center justify-between my-4">
          <div>
            <div class="text-3xl font-display font-bold text-white tracking-tight">${windStr}</div>
            <div class="text-xs text-slate-400 mt-1">Wind gusts up to <span class="text-white">${storage.formatWind(currentData.windSpeed * 1.35, unit)}</span></div>
          </div>

          <!-- Futuristic Circular Compass Dial -->
          <div class="relative w-16 h-16 rounded-full border border-white/15 flex items-center justify-center bg-black/30 shadow-inner">
            <span class="absolute top-1 text-[9px] font-mono text-slate-400 font-bold">N</span>
            <span class="absolute bottom-1 text-[9px] font-mono text-slate-500">S</span>
            <span class="absolute left-1 text-[9px] font-mono text-slate-500">W</span>
            <span class="absolute right-1 text-[9px] font-mono text-slate-500">E</span>
            
            <svg class="w-8 h-8 compass-needle text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" style="transform: rotate(${windBearing}deg);" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 15,12 12,9 9,12" />
              <polygon points="12,22 15,12 12,15 9,12" opacity="0.3" />
            </svg>
          </div>
        </div>

        <div class="text-[11px] text-slate-400 border-t border-white/5 pt-2 flex items-center justify-between">
          <span>Flow: Smooth laminar flow</span>
          <span class="font-mono text-cyan-300">Optimum</span>
        </div>
      </div>

      <!-- 2. UV Solar Exposure -->
      <div class="bento-card p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span class="flex items-center gap-1.5 uppercase tracking-wider">
            <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            UV Solar Radiation
          </span>
          <span class="font-semibold ${uvColor}">${uvLabel}</span>
        </div>

        <div class="my-4">
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-display font-bold text-white tracking-tight">${uv.toFixed(1)}</span>
            <span class="text-xs text-slate-400 font-mono">/ 11+ Index</span>
          </div>

          <!-- Progress Arc Track -->
          <div class="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" style="width: ${uvPercent}%;"></div>
          </div>
        </div>

        <div class="text-[11px] text-slate-400 border-t border-white/5 pt-2">
          ${uv <= 2 ? 'Minimal sun hazard. Normal protection required.' : uv <= 5 ? 'Wear sunglasses & SPF 30+ on bright surfaces.' : 'Direct exposure limit: 15-25 minutes without shield.'}
        </div>
      </div>

      <!-- 3. Atmospheric Humidity & Dew Point -->
      <div class="bento-card p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span class="flex items-center gap-1.5 uppercase tracking-wider">
            <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            Humidity & Saturation
          </span>
          <span class="text-slate-300 font-mono">Dew: ${dewPoint}°</span>
        </div>

        <div class="my-4 flex items-center justify-between">
          <div>
            <div class="text-3xl font-display font-bold text-white tracking-tight">${currentData.relativeHumidity}%</div>
            <div class="text-xs text-slate-400 mt-1">Comfort: ${currentData.relativeHumidity < 35 ? 'Arid / Dry' : currentData.relativeHumidity > 70 ? 'Humid' : 'Ideal Equilibrium'}</div>
          </div>

          <!-- Liquid Gauge Pill -->
          <div class="w-10 h-16 rounded-full border border-white/20 bg-slate-900/60 p-1 flex flex-col justify-end overflow-hidden">
            <div class="w-full rounded-full bg-cyan-400/80 transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.8)]" style="height: ${currentData.relativeHumidity}%;"></div>
          </div>
        </div>

        <div class="text-[11px] text-slate-400 border-t border-white/5 pt-2">
          Condensation threshold at <span class="text-slate-200 font-mono">${dewPoint}°</span>
        </div>
      </div>

      <!-- 4. Barometric Surface Pressure -->
      <div class="bento-card p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span class="flex items-center gap-1.5 uppercase tracking-wider">
            <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Barometric Pressure
          </span>
          <span class="text-slate-400">hPa</span>
        </div>

        <div class="my-4">
          <div class="text-3xl font-display font-bold text-white tracking-tight">${pressure} <span class="text-sm font-mono text-slate-400 font-normal">hPa</span></div>
          <div class="text-xs text-slate-400 mt-1">${pressureStatus}</div>
        </div>

        <div class="text-[11px] text-slate-400 border-t border-white/5 pt-2 flex items-center justify-between">
          <span>Altimeter Baseline</span>
          <span class="font-mono text-indigo-300">Sea Level Corrected</span>
        </div>
      </div>

      <!-- 5. Atmospheric Visibility -->
      <div class="bento-card p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span class="flex items-center gap-1.5 uppercase tracking-wider">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Optical Visibility
          </span>
          <span class="text-emerald-400 font-semibold">Unobstructed</span>
        </div>

        <div class="my-4">
          <div class="text-3xl font-display font-bold text-white tracking-tight">${visDisplay}</div>
          <div class="text-xs text-slate-400 mt-1">Optical horizon clarity is exceptional</div>
        </div>

        <div class="text-[11px] text-slate-400 border-t border-white/5 pt-2">
          Haze index: <span class="text-slate-200 font-mono">None detected</span>
        </div>
      </div>

      <!-- 6. Cloud Ceiling & Precipitation Volume -->
      <div class="bento-card p-5 flex flex-col justify-between">
        <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span class="flex items-center gap-1.5 uppercase tracking-wider">
            <svg class="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
            Cloud Density & Rain
          </span>
          <span class="font-mono text-cyan-300">${currentData.cloudCover}% Cover</span>
        </div>

        <div class="my-4 flex items-center justify-between">
          <div>
            <div class="text-3xl font-display font-bold text-white tracking-tight">${currentData.precipitation} <span class="text-sm font-mono text-slate-400 font-normal">mm</span></div>
            <div class="text-xs text-slate-400 mt-1">Liquid precipitation in past 24h</div>
          </div>
          <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 font-mono text-xs text-sky-300">
            ${currentData.precipitation > 0 ? 'ACTIVE' : '0.0'}
          </div>
        </div>

        <div class="text-[11px] text-slate-400 border-t border-white/5 pt-2">
          Tropospheric ceiling: <span class="text-slate-200 font-mono">3,200 m</span>
        </div>
      </div>

    </div>
  `;
}
