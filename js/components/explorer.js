// Explorer Component - Leaflet Geo Engine
const ExplorerComponent = {
  map: null,
  markers: [],

  init() {
    this.renderReceiptGrid(RECEIPTS_DATA);
    this.bindFilters();
    this.initMap();
  },

  bindFilters() {
    ['explorerCategoryFilter', 'explorerCityFilter', 'explorerMoodFilter', 'explorerCompanionFilter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.applyFilters());
      }
    });

    const toggleMapBtn = document.getElementById('toggleMapBtn');
    if (toggleMapBtn) {
      toggleMapBtn.addEventListener('click', () => {
        const container = document.getElementById('explorerMapContainer');
        const label = document.getElementById('mapToggleLabel');
        if (container.style.display === 'none') {
          container.style.display = 'block';
          label.textContent = 'Hide Map';
          this.refreshMapSize();
        } else {
          container.style.display = 'none';
          label.textContent = 'Show Map';
        }
      });
    }
  },

  applyFilters() {
    const cat = document.getElementById('explorerCategoryFilter')?.value || 'all';
    const city = document.getElementById('explorerCityFilter')?.value || 'all';
    const mood = document.getElementById('explorerMoodFilter')?.value || 'all';
    const comp = document.getElementById('explorerCompanionFilter')?.value || 'all';

    const filtered = RECEIPTS_DATA.filter(r => {
      if (cat !== 'all' && r.category !== cat) return false;
      if (city !== 'all' && r.city !== city) return false;
      if (mood !== 'all' && r.mood !== mood) return false;
      if (comp !== 'all' && !r.companions.includes(comp)) return false;
      return true;
    });

    this.renderReceiptGrid(filtered);
    this.updateMapMarkers(filtered);
  },

  renderReceiptGrid(receipts) {
    const countEl = document.getElementById('explorerCount');
    if (countEl) countEl.textContent = receipts.length;

    const grid = document.getElementById('receiptsGridContainer');
    if (!grid) return;

    if (receipts.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No matching life receipts found. Try adjusting your filters!</div>`;
      return;
    }

    grid.innerHTML = receipts.map(r => `
      <div class="receipt-ticket" data-id="${r.id}">
        <div class="ticket-header">
          <span class="ticket-cat-badge" style="background:${r.color}33; color:${r.color}; border:1px solid ${r.color}66;">${r.category}</span>
          <span class="ticket-id">${r.id}</span>
        </div>
        <h4 class="ticket-title">${r.title}</h4>
        <p class="ticket-detail">${r.detail.length > 80 ? r.detail.slice(0, 80) + '...' : r.detail}</p>
        <div class="ticket-footer">
          <span><i data-lucide="map-pin" style="width:12px;"></i> ${r.city}</span>
          <span>${r.date}</span>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.receipt-ticket').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        App.showReceiptModal(id);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  },

  initMap() {
    const mapEl = document.getElementById('leafletMap');
    if (!mapEl || typeof L === 'undefined') return;

    // Initialize Leaflet map
    this.map = L.map('leafletMap').setView([19.0760, 72.8777], 5);

    // Free OpenStreetMap Tile Layer (No API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(this.map);

    this.updateMapMarkers(RECEIPTS_DATA);
  },

  updateMapMarkers(receipts) {
    if (!this.map || typeof L === 'undefined') return;

    // Clear existing markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    const cityCoords = {
      'Mumbai': [19.0760, 72.8777],
      'Bengaluru': [12.9716, 77.5946],
      'Pune': [18.5204, 73.8567],
      'Jamshedpur': [22.8046, 86.2029],
      'Delhi': [28.6139, 77.2090]
    };

    const cityGroups = {};
    receipts.forEach(r => {
      if (r.city && cityCoords[r.city]) {
        cityGroups[r.city] = cityGroups[r.city] || [];
        cityGroups[r.city].push(r);
      }
    });

    Object.keys(cityGroups).forEach(city => {
      const coords = cityCoords[city];
      const list = cityGroups[city];

      const marker = L.circleMarker(coords, {
        radius: 10 + Math.min(list.length, 25),
        fillColor: '#dda15e',
        color: '#fefae0',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(this.map);

      marker.bindPopup(`
        <div style="font-family:var(--font-main); color:#141c0c;">
          <h4 style="margin:0; font-size:1rem; color:#bc6c25;">${city}</h4>
          <p style="margin:0.2rem 0; font-size:0.85rem;">${list.length} Digital Receipts</p>
          <small style="color:#606c38;">Top moment: ${list[0].title}</small>
        </div>
      `);

      this.markers.push(marker);
    });
  },

  refreshMapSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 50);
    }
  }
};
