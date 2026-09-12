/**
 * STRATOS Meteorological Satellite & Radar Map
 * Seamlessly integrates a futuristic dark-matter map with radar sweep layers.
 */

export class WeatherMap {
  constructor(containerId = 'radar-map-container') {
    this.container = document.getElementById(containerId);
    this.map = null;
    this.marker = null;
    this.radarOverlay = null;
    this.activeLayer = 'temp';
    this.currentLat = 33.5731;
    this.currentLon = -7.5898;

    this.init();
  }

  init() {
    if (!this.container) return;
    // Delay slightly to ensure Leaflet CDN is loaded if injected
    this.ensureLeafletLoaded().then(() => {
      this.renderMap();
      this.attachControls();
    });
  }

  async ensureLeafletLoaded() {
    if (window.L) return;

    // Load leaflet css
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load leaflet js
    return new Promise((resolve) => {
      if (window.L) return resolve();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  renderMap() {
    if (!window.L || !this.container) return;

    if (this.map) {
      this.map.remove();
    }

    // Initialize Leaflet map with CartoDB Dark Matter tiles
    this.map = window.L.map(this.container, {
      center: [this.currentLat, this.currentLon],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(this.map);

    // Custom Glowing Crosshair Marker
    const radarIcon = window.L.divIcon({
      className: 'radar-marker',
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full border border-cyan-400/40 radar-ring"></div>
          <div class="absolute w-4 h-4 rounded-full bg-cyan-400/20 border border-cyan-300"></div>
          <div class="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#06B6D4]"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    this.marker = window.L.marker([this.currentLat, this.currentLon], { icon: radarIcon }).addTo(this.map);
  }

  updateLocation(lat, lon, cityName = 'Target Area') {
    this.currentLat = lat;
    this.currentLon = lon;

    if (this.map) {
      this.map.setView([lat, lon], 8, { animate: true, duration: 1.2 });
      if (this.marker) {
        this.marker.setLatLng([lat, lon]);
      }
    }
  }

  attachControls() {
    const buttons = document.querySelectorAll('[data-radar-layer]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/40'));
        btn.classList.add('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/40');
        this.activeLayer = btn.getAttribute('data-radar-layer');
      });
    });
  }
}
