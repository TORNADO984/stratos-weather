/**
 * STRATOS Lunar Ephemeris & Moon Phase Visualizer
 * Calculates the exact lunar phase angle, illumination percentage, and renders an SVG moon disk.
 */

export class MoonPhaseEngine {
  static getMoonData(date = new Date()) {
    // Julian Date calculation
    const time = date.getTime();
    const tzOffset = date.getTimezoneOffset() * 60000;
    const utc = time + tzOffset;
    const julianDate = (utc / 86400000) + 2440587.5;

    // Known new moon reference: Jan 6, 2000, 18:14 UTC (JD 2451549.76)
    const knownNewMoon = 2451549.76;
    const synodicMonth = 29.53058867;

    const daysSince = julianDate - knownNewMoon;
    const cycles = daysSince / synodicMonth;
    const phaseFraction = cycles - Math.floor(cycles); // 0.0 -> 1.0

    const ageDays = phaseFraction * synodicMonth;
    // Illumination: 0 at new moon, 1 at full moon (around 0.5 fraction)
    const illumination = Math.round((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2 * 100);

    let phaseName = 'New Moon';
    if (ageDays < 1.84) {
      phaseName = 'New Moon';
    } else if (ageDays < 7.38) {
      phaseName = 'Waxing Crescent';
    } else if (ageDays < 9.22) {
      phaseName = 'First Quarter';
    } else if (ageDays < 14.76) {
      phaseName = 'Waxing Gibbous';
    } else if (ageDays < 16.61) {
      phaseName = 'Full Moon';
    } else if (ageDays < 22.15) {
      phaseName = 'Waning Gibbous';
    } else if (ageDays < 23.99) {
      phaseName = 'Third Quarter';
    } else {
      phaseName = 'Waning Crescent';
    }

    const daysToFull = (14.76 - ageDays + synodicMonth) % synodicMonth;

    return {
      phaseName,
      ageDays: ageDays.toFixed(1),
      illumination,
      phaseFraction,
      daysToFull: Math.round(daysToFull),
    };
  }

  static renderMoonWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = this.getMoonData();

    container.innerHTML = `
      <div class="bento-card p-5 flex flex-col justify-between">
        
        <!-- Header -->
        <div class="flex items-center justify-between text-xs font-mono text-slate-400">
          <span class="flex items-center gap-1.5 uppercase tracking-wider">
            <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            Lunar Cycle & Phase
          </span>
          <span class="text-indigo-300 font-semibold font-mono">${data.illumination}% Illumination</span>
        </div>

        <!-- Moon Visualization -->
        <div class="my-4 flex items-center justify-between">
          <div>
            <div class="text-2xl font-display font-bold text-white tracking-tight">${data.phaseName}</div>
            <div class="text-xs text-slate-400 mt-1 font-mono">Lunar age: <span class="text-white">${data.ageDays} days</span> (${data.daysToFull}d to Full Moon)</div>
          </div>

          <!-- Realistic Moon Sphere SVG -->
          <div class="relative w-16 h-16 rounded-full bg-slate-950 p-0.5 border border-white/20 shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center overflow-hidden">
            <svg class="w-full h-full" viewBox="0 0 64 64">
              <!-- Dark Moon Base -->
              <circle cx="32" cy="32" r="28" fill="#1E293B"/>
              
              <!-- Subtle Crater details -->
              <circle cx="26" cy="24" r="4" fill="#0F172A" opacity="0.6"/>
              <circle cx="38" cy="36" r="6" fill="#0F172A" opacity="0.6"/>
              <circle cx="28" cy="42" r="3" fill="#0F172A" opacity="0.5"/>
              <circle cx="40" cy="20" r="3.5" fill="#0F172A" opacity="0.5"/>

              <!-- Illuminated Layer -->
              <circle cx="32" cy="32" r="28" fill="#E2E8F0" opacity="${data.illumination / 100}"/>
            </svg>
          </div>
        </div>

        <!-- Lunar Ephemeris Subtext -->
        <div class="border-t border-white/5 pt-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Synodic Period</span>
          <span class="text-slate-200">29.53 Days Cycle</span>
        </div>

      </div>
    `;
  }
}
