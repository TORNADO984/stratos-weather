/**
 * STRATOS Saved Stations & Favorites Slide-over Drawer
 */

import { storage } from '../services/storage.js';

export class FavoritesDrawer {
  constructor(drawerId = 'favorites-drawer', backdropId = 'favorites-backdrop') {
    this.drawer = document.getElementById(drawerId);
    this.backdrop = document.getElementById(backdropId);
    this.openBtn = document.getElementById('favorites-drawer-btn');
    this.listContainer = document.getElementById('favorites-list-container');
    this.isOpen = false;

    this.init();
  }

  init() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    const closeBtn = document.getElementById('close-favorites-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  open() {
    if (!this.drawer) return;
    this.isOpen = true;
    this.drawer.classList.remove('translate-x-full');
    this.backdrop?.classList.remove('hidden');
    this.renderList();
  }

  close() {
    if (!this.drawer) return;
    this.isOpen = false;
    this.drawer.classList.add('translate-x-full');
    this.backdrop?.classList.add('hidden');
  }

  renderList() {
    if (!this.listContainer) return;
    const favorites = storage.getFavorites();

    if (favorites.length === 0) {
      this.listContainer.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <svg class="w-8 h-8 mx-auto mb-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
          <div class="text-sm font-semibold text-white">No Bookmarked Stations</div>
          <div class="text-xs text-slate-500 mt-1">Bookmark any city from the top bar to monitor it here.</div>
        </div>
      `;
      return;
    }

    this.listContainer.innerHTML = favorites.map(city => `
      <div class="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-between group">
        <div class="cursor-pointer flex-1" onclick="window.stratos.loadCity({name: '${city.name}', country: '${city.country}', latitude: ${city.latitude}, longitude: ${city.longitude}}); window.stratosFavorites.close();">
          <div class="font-display font-semibold text-white text-sm">${city.name}</div>
          <div class="text-[11px] font-mono text-slate-400">${city.country} • ${city.latitude.toFixed(1)}°, ${city.longitude.toFixed(1)}°</div>
        </div>
        <button class="text-slate-500 hover:text-rose-400 p-1.5 opacity-60 group-hover:opacity-100 transition-opacity" onclick="window.stratosFavorites.deleteFavorite('${city.name}')" title="Remove">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    `).join('');
  }

  deleteFavorite(name) {
    storage.removeFavorite(name);
    this.renderList();
    window.stratos?.updateFavoriteButton();
  }
}
