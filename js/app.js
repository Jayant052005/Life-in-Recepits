// Main App Orchestrator & State Manager
const App = {
  activeTab: 'story',

  init() {
    this.bindNavigation();
    this.bindGlobalSearch();
    this.bindModalEvents();
    this.bindAddReceiptForm();
    this.bindCityChips();

    // Initialize Components
    StoryComponent.init();
    GraphComponent.init();
    PersonaComponent.init();
    QuestsComponent.init();
    ExplorerComponent.init();

    if (window.lucide) window.lucide.createIcons();
  },

  bindNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Nav UI
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
    });

    // Update Tab View Containers
    document.querySelectorAll('.tab-view').forEach(v => {
      v.classList.toggle('active', v.id === `view-${tabId}`);
    });

    // Trigger tab-specific resize / updates
    if (tabId === 'graph') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          GraphComponent.resizeCanvas();
          GraphComponent.buildGraphData();
        });
      });
    } else if (tabId === 'persona') {
      setTimeout(() => PersonaComponent.renderCharts(), 50);
    } else if (tabId === 'explorer') {
      setTimeout(() => {
        if (ExplorerComponent.map) ExplorerComponent.map.invalidateSize();
      }, 50);
    }
  },

  bindGlobalSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    if (!searchInput) return;

    // Keyboard shortcut '/'
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) return;

      // Switch to explorer tab automatically on search
      if (this.activeTab !== 'explorer') {
        this.switchTab('explorer');
      }

      const matching = RECEIPTS_DATA.filter(r => {
        return r.title.toLowerCase().includes(q) ||
               r.detail.toLowerCase().includes(q) ||
               r.city.toLowerCase().includes(q) ||
               r.category.toLowerCase().includes(q) ||
               r.tags.some(t => t.toLowerCase().includes(q)) ||
               r.companions.some(c => c.toLowerCase().includes(q));
      });

      ExplorerComponent.renderReceiptGrid(matching);
      ExplorerComponent.updateMapMarkers(matching);
    });
  },

  bindModalEvents() {
    const closeReceiptModal = document.getElementById('closeReceiptModal');
    const receiptModal = document.getElementById('receiptModal');

    if (closeReceiptModal) {
      closeReceiptModal.addEventListener('click', () => {
        receiptModal.classList.remove('open');
      });
    }

    if (receiptModal) {
      receiptModal.addEventListener('click', (e) => {
        if (e.target === receiptModal) receiptModal.classList.remove('open');
      });
    }

    const addReceiptBtn = document.getElementById('addReceiptBtn');
    const addReceiptModal = document.getElementById('addReceiptModal');
    const closeAddModal = document.getElementById('closeAddReceiptModal');

    if (addReceiptBtn) {
      addReceiptBtn.addEventListener('click', () => {
        addReceiptModal.classList.add('open');
      });
    }

    if (closeAddModal) {
      closeAddModal.addEventListener('click', () => {
        addReceiptModal.classList.remove('open');
      });
    }
  },

  showReceiptModal(rId) {
    const modal = document.getElementById('receiptModal');
    const content = document.getElementById('modalContent');
    if (!modal || !content) return;

    const receipt = RECEIPTS_DATA.find(r => r.id === rId);
    if (!receipt) return;

    // Find linked receipts
    const linkedReceipts = (receipt.connectedIds || []).map(id => RECEIPTS_DATA.find(r => r.id === id)).filter(Boolean);

    content.innerHTML = `
      <div style="margin-bottom:1.25rem;">
        <span class="ticket-cat-badge" style="background:${receipt.color}22; color:${receipt.color}; font-size:0.8rem;">${receipt.category}</span>
        <h2 style="font-size:1.6rem; font-family:var(--font-heading); color:white; margin:0.5rem 0 0.2rem 0;">${receipt.title}</h2>
        <div style="font-size:0.88rem; color:var(--accent-cyan); font-family:var(--font-mono);">
          Receipt ID: ${receipt.id} &bull; ${receipt.date} at ${receipt.time} &bull; ${receipt.city}
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.04); border-radius:var(--radius-md); padding:1.25rem; border:1px solid var(--glass-border); margin-bottom:1.5rem;">
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:0.4rem;">DIGITAL DETAIL / NOTE</div>
        <p style="font-size:1rem; color:white; line-height:1.6;">${receipt.detail || 'No additional text detail recorded.'}</p>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <div style="background:rgba(255,255,255,0.03); border-radius:var(--radius-md); padding:1rem; border:1px solid var(--glass-border);">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">EMOTIONAL MOOD</div>
          <div style="font-size:1.1rem; font-weight:700; color:var(--accent-emerald); margin-top:0.2rem;">${receipt.mood}</div>
        </div>
        
        <div style="background:rgba(255,255,255,0.03); border-radius:var(--radius-md); padding:1rem; border:1px solid var(--glass-border);">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">COMPANIONS</div>
          <div style="font-size:0.95rem; font-weight:600; color:var(--accent-pink); margin-top:0.2rem;">
            ${receipt.companions.length ? receipt.companions.join(', ') : 'Solo Activity'}
          </div>
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <div style="font-size:0.85rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
          <i data-lucide="git-branch" style="width:16px;"></i> Connected Moments in Story Web (${linkedReceipts.length})
        </div>
        <div style="display:flex; flex-direction:column; gap:0.5rem; max-height:160px; overflow-y:auto;">
          ${linkedReceipts.length === 0 ? '<span style="font-size:0.82rem; color:var(--text-muted);">No direct links.</span>' : 
            linkedReceipts.map(lr => `
              <div class="modal-link-item" data-id="${lr.id}" style="padding:0.6rem 0.8rem; background:rgba(255,255,255,0.04); border-radius:var(--radius-sm); border:1px solid var(--glass-border); cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="color:white; font-size:0.88rem;">${lr.title}</strong>
                  <span style="font-size:0.78rem; color:var(--text-muted); margin-left:0.5rem;">(${lr.category})</span>
                </div>
                <span style="font-size:0.78rem; color:var(--accent-cyan);">${lr.date}</span>
              </div>
            `).join('')}
        </div>
      </div>

      <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">
        Raw Data Payload: ${JSON.stringify(receipt.raw)}
      </div>
    `;

    content.querySelectorAll('.modal-link-item').forEach(item => {
      item.addEventListener('click', () => {
        const nextId = item.getAttribute('data-id');
        this.showReceiptModal(nextId);
      });
    });

    modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  },

  bindAddReceiptForm() {
    const form = document.getElementById('addReceiptForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const catName = document.getElementById('newCategory').value;
      const title = document.getElementById('newTitle').value;
      const city = document.getElementById('newCity').value;
      const date = document.getElementById('newDate').value;
      const detail = document.getElementById('newDetail').value;
      const mood = document.getElementById('newMood').value;
      const companionsRaw = document.getElementById('newCompanions').value;

      const companions = companionsRaw ? companionsRaw.split(',').map(c => c.trim()) : [];

      const catColors = {
        'Music': '#ec4899', 'Movies & Entertainment': '#8b5cf6', 'Places': '#10b981',
        'Purchases': '#f59e0b', 'Photos': '#3b82f6', 'Messages': '#06b6d4', 'Personal Notes': '#14b8a6'
      };

      const newReceipt = {
        id: `NEW${Date.now().toString().slice(-4)}`,
        category: catName,
        categoryKey: '09_Custom',
        icon: 'star',
        color: catColors[catName] || '#a855f7',
        date: date,
        time: '14:00',
        title: title,
        detail: detail,
        city: city,
        mood: mood,
        companions: companions,
        tags: ['custom', 'memory'],
        connectedIds: [],
        raw: { id: `NEW${Date.now().toString().slice(-4)}`, title, city, date }
      };

      RECEIPTS_DATA.unshift(newReceipt);

      // Update badge
      const badge = document.getElementById('receiptsCountBadge');
      if (badge) badge.textContent = `${RECEIPTS_DATA.length} Moments`;

      // Refresh current views
      ExplorerComponent.applyFilters();
      StoryComponent.selectChapter(StoryComponent.currentChapterId);
      PersonaComponent.renderCharts();

      document.getElementById('addReceiptModal').classList.remove('open');
      form.reset();

      if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
      }
    });
  },

  bindCityChips() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const city = chip.getAttribute('data-city');

        // Switch to explorer view and set city filter
        this.switchTab('explorer');
        const citySelect = document.getElementById('explorerCityFilter');
        if (citySelect) {
          citySelect.value = city;
          ExplorerComponent.applyFilters();
        }
      });
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
