/**
 * STRATOS Storage & Unit Preferences
 * Handles unit toggles (°C/°F, km/h/mph), favorite cities, and search history.
 */

class StorageManager {
  constructor() {
    this.UNIT_KEY = 'stratos_temp_unit'; // 'C' or 'F'
    this.FAVORITES_KEY = 'stratos_favorites';
    this.RECENTS_KEY = 'stratos_recent_searches';
  }

  getUnit() {
    return localStorage.getItem(this.UNIT_KEY) || 'C';
  }

  setUnit(unit) {
    localStorage.setItem(this.UNIT_KEY, unit === 'F' ? 'F' : 'C');
  }

  toggleUnit() {
    const next = this.getUnit() === 'C' ? 'F' : 'C';
    this.setUnit(next);
    return next;
  }

  convertTemp(celsius, targetUnit = this.getUnit()) {
    if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
    if (targetUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  }

  formatWind(speedKmh, targetUnit = this.getUnit()) {
    if (speedKmh === null || speedKmh === undefined || isNaN(speedKmh)) return '--';
    if (targetUnit === 'F') {
      const mph = Math.round(speedKmh * 0.621371);
      return `${mph} mph`;
    }
    return `${Math.round(speedKmh)} km/h`;
  }

  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(this.FAVORITES_KEY)) || [
        { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lon: -7.5898 },
        { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
        { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
        { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
        { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
      ];
    } catch {
      return [];
    }
  }

  saveFavorite(city) {
    const list = this.getFavorites().filter(c => c.name !== city.name);
    list.unshift(city);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(list.slice(0, 10)));
  }

  removeFavorite(cityName) {
    const list = this.getFavorites().filter(c => c.name !== cityName);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(list));
  }

  isFavorite(cityName) {
    return this.getFavorites().some(c => c.name.toLowerCase() === cityName.toLowerCase());
  }

  getRecents() {
    try {
      return JSON.parse(localStorage.getItem(this.RECENTS_KEY)) || [];
    } catch {
      return [];
    }
  }

  addRecent(searchItem) {
    const recents = this.getRecents().filter(r => r.name !== searchItem.name);
    recents.unshift(searchItem);
    localStorage.setItem(this.RECENTS_KEY, JSON.stringify(recents.slice(0, 6)));
  }
}

export const storage = new StorageManager();
