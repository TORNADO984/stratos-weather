/**
 * STRATOS API Client
 * Connects to FastAPI backend with fail-safe fallback simulation for immediate offline preview.
 */

const API_BASE = window.location.origin.includes(':8000') || window.location.origin.includes(':3000')
  ? 'http://localhost:8000/api/v1'
  : '/api/v1';

class WeatherApiClient {
  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
  }

  async fetchForecast(lat, lon) {
    try {
      const res = await fetch(`${this.baseUrl}/weather/forecast?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.warn('Backend API connection unavailable, activating local fallback generator:', err.message);
      return this.generateFallbackForecast(lat, lon);
    }
  }

  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];

    try {
      const res = await fetch(`${this.baseUrl}/locations/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || json;
    } catch {
      // Fallback local city search database
      const fallbackList = [
        { name: 'Casablanca', country: 'Morocco', admin1: 'Casablanca-Settat', latitude: 33.5731, longitude: -7.5898, timezone: 'Africa/Casablanca' },
        { name: 'Rabat', country: 'Morocco', admin1: 'Rabat-Salé-Kénitra', latitude: 34.0209, longitude: -6.8416, timezone: 'Africa/Casablanca' },
        { name: 'Tangier', country: 'Morocco', admin1: 'Tanger-Tetouan-Al Hoceima', latitude: 35.7595, longitude: -5.8340, timezone: 'Africa/Casablanca' },
        { name: 'Marrakech', country: 'Morocco', admin1: 'Marrakech-Safi', latitude: 31.6295, longitude: -7.9811, timezone: 'Africa/Casablanca' },
        { name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
        { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
        { name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
        { name: 'Paris', country: 'France', admin1: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
        { name: 'Dubai', country: 'United Arab Emirates', admin1: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
        { name: 'Reykjavik', country: 'Iceland', admin1: 'Capital Region', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' },
        { name: 'Sydney', country: 'Australia', admin1: 'New South Wales', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
      ];

      return fallbackList.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.country.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  async reverseGeocode(lat, lon) {
    try {
      const res = await fetch(`${this.baseUrl}/locations/reverse?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || json;
    } catch {
      return {
        name: 'Current Location',
        country: 'GPS Fix',
        latitude: lat,
        longitude: lon,
      };
    }
  }

  generateFallbackForecast(lat, lon) {
    const isNight = new Date().getHours() < 6 || new Date().getHours() > 19;
    const baseTemp = lat > 50 ? 8 : lat < 20 ? 29 : 22;

    const hourly = [];
    const currentHour = new Date().getHours();
    for (let i = 0; i < 24; i++) {
      const h = (currentHour + i) % 24;
      const hourNight = h < 6 || h > 19;
      hourly.push({
        time: `${String(h).padStart(2, '0')}:00`,
        temperature: Math.round(baseTemp + Math.sin(i / 3.8) * 4),
        weatherCode: i % 7 === 0 ? 61 : i % 4 === 0 ? 2 : 0,
        isNight: hourNight,
        precipitationProb: (i * 7) % 65,
        windSpeed: 14 + (i % 6),
      });
    }

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIdx = new Date().getDay();
    const daily = [];
    for (let d = 0; d < 7; d++) {
      const dayName = d === 0 ? 'Today' : daysOfWeek[(todayIdx + d) % 7];
      daily.push({
        day: dayName,
        date: new Date(Date.now() + d * 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        weatherCode: d === 2 ? 61 : d === 4 ? 3 : 0,
        tempMax: Math.round(baseTemp + 3 + (d % 3)),
        tempMin: Math.round(baseTemp - 4 - (d % 2)),
        precipitationProb: d === 2 ? 75 : d === 4 ? 40 : 10,
        uvIndex: 7 - (d % 3),
      });
    }

    return {
      current: {
        temperature: baseTemp,
        apparentTemperature: baseTemp + 1,
        weatherCode: 0,
        isNight,
        relativeHumidity: 58,
        windSpeed: 18.2,
        windDirection: 245,
        surfacePressure: 1016.4,
        visibility: 10000,
        uvIndex: isNight ? 0 : 6.4,
        dewPoint: 13.8,
        cloudCover: 18,
        precipitation: 0.0,
        sunrise: new Date().setHours(6, 35, 0, 0),
        sunset: new Date().setHours(19, 48, 0, 0),
      },
      hourly,
      daily,
      location: {
        name: 'Casablanca',
        country: 'Morocco',
        latitude: lat,
        longitude: lon,
        elevation: 27,
      },
    };
  }
}

export const weatherApi = new WeatherApiClient();
