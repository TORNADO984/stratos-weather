/**
 * STRATOS Instant City Search Component
 * Supports debounced typeahead, keyboard navigation, history chips, and loading states.
 */

import { weatherApi } from '../services/api.js';
import { storage } from '../services/storage.js';

export class CitySearch {
  constructor({ inputId, resultsId, onSelectCity }) {
    this.input = document.getElementById(inputId);
    this.results = document.getElementById(resultsId);
    this.onSelectCity = onSelectCity;

    this.debounceTimer = null;
    this.selectedIndex = -1;
    this.currentItems = [];

    this.init();
  }

  init() {
    if (!this.input || !this.results) return;

    // Input listeners
    this.input.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      const q = this.input.value.trim();

      if (q.length < 2) {
        this.showRecents();
        return;
      }

      this.showLoading();
      this.debounceTimer = setTimeout(() => this.search(q), 220);
    });

    this.input.addEventListener('focus', () => {
      if (!this.input.value.trim()) {
        this.showRecents();
      }
    });

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      const items = this.results.querySelectorAll('.search-result-item');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        this.highlightItem(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length === 0) return;
        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
        this.highlightItem(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          items[this.selectedIndex].click();
        } else if (this.currentItems.length > 0) {
          this.selectItem(this.currentItems[0]);
        }
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    // Global keyboard shortcut '/' to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.input) {
        e.preventDefault();
        this.input.focus();
        this.input.select();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.results.contains(e.target)) {
        this.close();
      }
    });
  }

  async search(query) {
    try {
      const items = await weatherApi.searchCities(query);
      this.currentItems = items || [];
      this.selectedIndex = -1;

      if (this.currentItems.length === 0) {
        this.showNoResults(query);
        return;
      }

      this.renderResults(this.currentItems);
    } catch {
      this.showError();
    }
  }

  renderResults(items) {
    this.results.classList.remove('hidden');
    this.results.innerHTML = `
      <div class="py-1">
        ${items.map((item, idx) => `
          <div class="search-result-item flex items-center justify-between px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-sm border-b border-white/5 last:border-0" data-index="${idx}">
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <div>
                <span class="font-semibold text-white">${item.name}</span>
                <span class="text-slate-400 text-xs ml-1">${item.admin1 ? `${item.admin1}, ` : ''}${item.country}</span>
              </div>
            </div>
            <div class="text-xs font-mono text-slate-500">
              ${item.latitude.toFixed(2)}°, ${item.longitude.toFixed(2)}°
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const resultElements = this.results.querySelectorAll('.search-result-item');
    resultElements.forEach((el) => {
      el.addEventListener('click', () => {
        const index = parseInt(el.getAttribute('data-index'), 10);
        this.selectItem(this.currentItems[index]);
      });
    });
  }

  showRecents() {
    const recents = storage.getRecents();
    if (!recents || recents.length === 0) {
      this.close();
      return;
    }

    this.results.classList.remove('hidden');
    this.currentItems = recents;
    this.selectedIndex = -1;

    this.results.innerHTML = `
      <div class="p-2">
        <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
          <span>Recent Atmospheric Searches</span>
        </div>
        ${recents.map((item, idx) => `
          <div class="search-result-item flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-sm" data-index="${idx}">
            <div class="flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span class="text-slate-200 font-medium">${item.name}</span>
              <span class="text-slate-500 text-xs">${item.country}</span>
            </div>
            <span class="text-[11px] text-slate-500 font-mono">Jump</span>
          </div>
        `).join('')}
      </div>
    `;

    const resultElements = this.results.querySelectorAll('.search-result-item');
    resultElements.forEach((el) => {
      el.addEventListener('click', () => {
        const index = parseInt(el.getAttribute('data-index'), 10);
        this.selectItem(recents[index]);
      });
    });
  }

  highlightItem(items) {
    items.forEach((item, idx) => {
      if (idx === this.selectedIndex) {
        item.classList.add('bg-white/15', 'text-cyan-300');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('bg-white/15', 'text-cyan-300');
      }
    });
  }

  selectItem(item) {
    if (!item) return;
    storage.addRecent({
      name: item.name,
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
    });

    this.input.value = `${item.name}, ${item.country}`;
    this.close();

    if (this.onSelectCity) {
      this.onSelectCity(item);
    }
  }

  showLoading() {
    this.results.classList.remove('hidden');
    this.results.innerHTML = `
      <div class="p-4 flex items-center justify-center gap-2.5 text-xs text-slate-400">
        <svg class="w-4 h-4 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        <span>Resolving global coordinates...</span>
      </div>
    `;
  }

  showNoResults(query) {
    this.results.classList.remove('hidden');
    this.results.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-400">
        <svg class="w-6 h-6 mx-auto mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <div>No atmospheric stations found for "<span class="text-white">${query}</span>"</div>
        <div class="text-[11px] text-slate-500 mt-1">Try searching a major city or region name.</div>
      </div>
    `;
  }

  showError() {
    this.results.classList.remove('hidden');
    this.results.innerHTML = `
      <div class="p-4 text-center text-xs text-rose-300">
        Unable to reach location services. Check your connection.
      </div>
    `;
  }

  close() {
    this.results.classList.add('hidden');
    this.selectedIndex = -1;
  }
}
