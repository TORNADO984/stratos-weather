/**
 * STRATOS Weather Icon & Condition Mapping System
 * Converts WMO meteorological codes into animated SVG vectors and descriptions.
 */

export function getWeatherMeta(wmoCode, isNight = false) {
  const code = Number(wmoCode);

  switch (code) {
    case 0:
      return {
        label: isNight ? 'Clear Skies' : 'Sunny & Clear',
        category: isNight ? 'clear-night' : 'clear-day',
        icon: isNight ? getMoonSvg() : getSunSvg(),
      };
    case 1:
      return {
        label: isNight ? 'Mainly Clear' : 'Mostly Sunny',
        category: isNight ? 'clear-night' : 'clear-day',
        icon: isNight ? getMoonCloudSvg() : getSunCloudSvg(),
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        category: 'clouds',
        icon: getSunCloudSvg(),
      };
    case 3:
      return {
        label: 'Overcast Sky',
        category: 'clouds',
        icon: getOvercastSvg(),
      };
    case 45:
    case 48:
      return {
        label: 'Atmospheric Fog',
        category: 'clouds',
        icon: getFogSvg(),
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Light Drizzle',
        category: 'rain',
        icon: getDrizzleSvg(),
      };
    case 61:
    case 63:
    case 65:
      return {
        label: code === 65 ? 'Heavy Rain' : 'Moderate Rain',
        category: 'rain',
        icon: getRainSvg(),
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        category: 'rain',
        icon: getRainSvg(),
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        label: 'Snowfall',
        category: 'snow',
        icon: getSnowSvg(),
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Thunderstorm',
        category: 'storm',
        icon: getStormSvg(),
      };
    default:
      return {
        label: 'Fair',
        category: isNight ? 'clear-night' : 'clear-day',
        icon: isNight ? getMoonSvg() : getSunSvg(),
      };
  }
}

function getSunSvg() {
  return `<svg class="w-full h-full text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4" fill="currentColor" fill-opacity="0.25"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>`;
}

function getMoonSvg() {
  return `<svg class="w-full h-full text-indigo-300" viewBox="0 0 24 24" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>`;
}

function getSunCloudSvg() {
  return `<svg class="w-full h-full text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41" class="text-amber-400"/>
    <circle cx="12" cy="10" r="3" class="text-amber-400" fill="currentColor" fill-opacity="0.2"/>
    <path d="M17.5 19H9a5 5 0 0 1-1-9.9 6.5 6.5 0 0 1 12 3 4 4 0 0 1-2.5 6.9z" class="text-slate-200" fill="currentColor" fill-opacity="0.15"/>
  </svg>`;
}

function getMoonCloudSvg() {
  return `<svg class="w-full h-full text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3a6 6 0 0 0 7 7" class="text-indigo-400"/>
    <path d="M17.5 19H9a5 5 0 0 1-1-9.9 6.5 6.5 0 0 1 12 3 4 4 0 0 1-2.5 6.9z" class="text-slate-200" fill="currentColor" fill-opacity="0.2"/>
  </svg>`;
}

function getOvercastSvg() {
  return `<svg class="w-full h-full text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.5 19H9a5 5 0 0 1-1-9.9 6.5 6.5 0 0 1 12 3 4 4 0 0 1-2.5 6.9z" fill="currentColor" fill-opacity="0.2"/>
    <path d="M7.5 14H6a4 4 0 0 1 0-8 5.5 5.5 0 0 1 9.5 2" stroke-opacity="0.5"/>
  </svg>`;
}

function getRainSvg() {
  return `<svg class="w-full h-full text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.5 15H9a5 5 0 0 1-1-9.9 6.5 6.5 0 0 1 12 3 4 4 0 0 1-2.5 6.9z" class="text-slate-300" fill="currentColor" fill-opacity="0.15"/>
    <path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" stroke-width="2"/>
  </svg>`;
}

function getDrizzleSvg() {
  return `<svg class="w-full h-full text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.5 15H9a5 5 0 0 1-1-9.9 6.5 6.5 0 0 1 12 3 4 4 0 0 1-2.5 6.9z" class="text-slate-300" fill="currentColor" fill-opacity="0.15"/>
    <path d="M9 19v1M13 19v1M17 19v1" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
}

function getSnowSvg() {
  return `<svg class="w-full h-full text-sky-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.5 15H9a5 5 0 0 1-1-9.9 6.5 6.5 0 0 1 12 3 4 4 0 0 1-2.5 6.9z" class="text-slate-300" fill="currentColor" fill-opacity="0.15"/>
    <path d="M8 18h.01M12 18h.01M16 18h.01M10 21h.01M14 21h.01" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

function getStormSvg() {
  return `<svg class="w-full h-full text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.5 15H9a5 5 0 0 1-1-9.9 6.5 6.5 0 0 1 12 3 4 4 0 0 1-2.5 6.9z" class="text-slate-300" fill="currentColor" fill-opacity="0.2"/>
    <path d="M13 15l-3 5h4l-1 4" class="text-amber-400" stroke-width="2" fill="currentColor" fill-opacity="0.3"/>
  </svg>`;
}

function getFogSvg() {
  return `<svg class="w-full h-full text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 14h16M6 18h12M8 10h8M5 6h14" stroke-linecap="round"/>
  </svg>`;
}
