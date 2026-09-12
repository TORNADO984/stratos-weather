/**
 * STRATOS Air Quality & Atmospheric Composition Component
 * Displays US AQI, PM2.5, PM10, Ozone, NO2, CO and health recommendations.
 */

export function renderAirQuality(containerId, aqData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!aqData) {
    // Default standard nominal reading
    aqData = {
      usAqi: 35,
      europeanAqi: 18,
      pm25: 8.4,
      pm10: 14.2,
      ozone: 48.0,
      nitrogenDioxide: 12.5,
      carbonMonoxide: 210.0,
      statusLabel: 'Good (Optimum)',
      healthAdvisory: 'Tropospheric aerosol density within nominal safety guidelines.',
    };
  }

  // Color mapping based on US AQI
  let aqiColor = 'text-emerald-400';
  let aqiBorder = 'border-emerald-500/30';
  let aqiBg = 'bg-emerald-500/10';
  let gaugePercent = Math.min(100, (aqData.usAqi / 200) * 100);

  if (aqData.usAqi > 50 && aqData.usAqi <= 100) {
    aqiColor = 'text-yellow-400';
    aqiBorder = 'border-yellow-500/30';
    aqiBg = 'bg-yellow-500/10';
  } else if (aqData.usAqi > 100 && aqData.usAqi <= 150) {
    aqiColor = 'text-amber-400';
    aqiBorder = 'border-amber-500/30';
    aqiBg = 'bg-amber-500/10';
  } else if (aqData.usAqi > 150) {
    aqiColor = 'text-rose-400';
    aqiBorder = 'border-rose-500/30';
    aqiBg = 'bg-rose-500/10';
  }

  container.innerHTML = `
    <div class="bento-card p-5 flex flex-col justify-between">
      
      <!-- Card Header -->
      <div class="flex items-center justify-between text-xs font-mono text-slate-400">
        <span class="flex items-center gap-1.5 uppercase tracking-wider">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Atmospheric Quality Index
        </span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${aqiBorder} ${aqiBg} ${aqiColor}">
          ${aqData.statusLabel}
        </span>
      </div>

      <!-- Main Gauge Readout -->
      <div class="my-4 flex items-center justify-between">
        <div>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-display font-black text-white tracking-tight">${aqData.usAqi}</span>
            <span class="text-xs font-mono text-slate-400">US AQI</span>
          </div>
          <div class="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
            ${aqData.healthAdvisory}
          </div>
        </div>

        <!-- Mini Circular Level Gauge -->
        <div class="relative w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-black/40">
          <svg class="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
            <path class="text-white/10" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="${aqiColor}" stroke-dasharray="${gaugePercent}, 100" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <span class="absolute text-xs font-mono font-bold text-white">${aqData.usAqi}</span>
        </div>
      </div>

      <!-- Pollutant Breakdown Matrix -->
      <div class="border-t border-white/5 pt-3 grid grid-cols-4 gap-2 text-center font-mono">
        <div class="p-2 rounded-lg bg-white/5">
          <div class="text-[10px] text-slate-400">PM2.5</div>
          <div class="text-xs font-bold text-cyan-300 mt-0.5">${aqData.pm25}</div>
          <div class="text-[9px] text-slate-500">µg/m³</div>
        </div>
        <div class="p-2 rounded-lg bg-white/5">
          <div class="text-[10px] text-slate-400">PM10</div>
          <div class="text-xs font-bold text-slate-200 mt-0.5">${aqData.pm10}</div>
          <div class="text-[9px] text-slate-500">µg/m³</div>
        </div>
        <div class="p-2 rounded-lg bg-white/5">
          <div class="text-[10px] text-slate-400">O₃ (Ozone)</div>
          <div class="text-xs font-bold text-indigo-300 mt-0.5">${aqData.ozone}</div>
          <div class="text-[9px] text-slate-500">µg/m³</div>
        </div>
        <div class="p-2 rounded-lg bg-white/5">
          <div class="text-[10px] text-slate-400">NO₂</div>
          <div class="text-xs font-bold text-amber-300 mt-0.5">${aqData.nitrogenDioxide}</div>
          <div class="text-[9px] text-slate-500">µg/m³</div>
        </div>
      </div>

    </div>
  `;
}
