/**
 * STRATOS Solar & Lunar Ephemeris Curve
 * Renders an interactive celestial arc showing sunrise, current sun elevation, and sunset.
 */

export function renderSunEphemeris(containerId, { sunrise, sunset, currentTime = new Date() }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Parse sunrise / sunset strings (ISO or HH:MM)
  let sunriseDate = new Date(sunrise);
  let sunsetDate = new Date(sunset);

  if (isNaN(sunriseDate.getTime())) {
    // Fallback: 06:30 and 19:45 today
    const now = new Date();
    sunriseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 30);
    sunsetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 45);
  }

  const nowMs = currentTime.getTime ? currentTime.getTime() : new Date().getTime();
  const riseMs = sunriseDate.getTime();
  const setMs = sunsetDate.getTime();

  // Calculate day progress between 0 and 1
  let progress = 0;
  let isDaytime = false;

  if (nowMs >= riseMs && nowMs <= setMs) {
    progress = (nowMs - riseMs) / (setMs - riseMs);
    isDaytime = true;
  } else if (nowMs > setMs) {
    progress = 1;
    isDaytime = false;
  } else {
    progress = 0;
    isDaytime = false;
  }

  // Curve coordinates on a 300x100 viewBox
  // Arc starts at (20, 80), peaks at (150, 20), ends at (280, 80)
  const startX = 20, endX = 280, baseY = 78, peakY = 22;
  const currentX = startX + progress * (endX - startX);
  // Quadratic curve interpolation
  const t = progress;
  const currentY = (1 - t) * (1 - t) * baseY + 2 * (1 - t) * t * peakY + t * t * baseY;

  const sunriseStr = sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunsetStr = sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  container.innerHTML = `
    <div class="relative w-full h-24 flex items-center justify-center">
      <svg class="w-full h-full overflow-visible" viewBox="0 0 300 95" fill="none">
        <!-- Horizon Reference Line -->
        <line x1="10" y1="80" x2="290" y2="80" stroke="rgba(255,255,255,0.12)" stroke-dasharray="4 4" stroke-width="1.5" />
        
        <!-- Celestial Arc Background -->
        <path d="M 20 80 Q 150 10 280 80" stroke="rgba(255,255,255,0.15)" stroke-width="2" stroke-dasharray="6 4" fill="none" />
        
        <!-- Elapsed Sun Path -->
        <path d="M 20 80 Q 150 10 280 80" stroke="url(#sun-gradient)" stroke-width="2.5" fill="none" stroke-dasharray="350" stroke-dashoffset="${350 * (1 - progress)}" />
        
        <!-- Glow Gradient Definition -->
        <defs>
          <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#FDE047" stop-opacity="1" />
            <stop offset="100%" stop-color="#F97316" stop-opacity="0.8" />
          </linearGradient>
          <filter id="sun-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Current Sun / Moon Position Marker -->
        ${isDaytime ? `
          <circle cx="${currentX}" cy="${currentY}" r="7" fill="#FDE047" filter="url(#sun-glow)" />
          <circle cx="${currentX}" cy="${currentY}" r="3" fill="#FFFFFF" />
        ` : `
          <circle cx="${currentX}" cy="${currentY}" r="6" fill="#818CF8" opacity="0.8" />
          <circle cx="${currentX}" cy="${currentY}" r="2.5" fill="#FFFFFF" />
        `}
      </svg>
    </div>
    <div class="flex justify-between items-center text-xs text-slate-400 font-mono mt-1">
      <div class="flex items-center gap-1">
        <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M16.95 16.95l1.414 1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
        <span>Dawn ${sunriseStr}</span>
      </div>
      <div class="text-slate-300 font-semibold text-[11px]">
        ${isDaytime ? 'Daylight Cycle' : 'Night Ephemeris'}
      </div>
      <div class="flex items-center gap-1">
        <span>Dusk ${sunsetStr}</span>
        <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
      </div>
    </div>
  `;
}
