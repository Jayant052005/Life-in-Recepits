// Story Component - Interactive Narrative Chapter Mode
const StoryComponent = {
  currentChapterId: 'chap-1',
  isPlaying: false,
  playTimer: null,

  init() {
    this.renderChapterList();
    this.selectChapter(this.currentChapterId);
    this.setupPlayer();
  },

  renderChapterList() {
    const container = document.getElementById('chapterListContainer');
    if (!container) return;

    container.innerHTML = CHAPTERS_DATA.map((chap, idx) => `
      <div class="chapter-item-card ${chap.id === this.currentChapterId ? 'active' : ''}" data-chap-id="${chap.id}">
        <span class="chap-num">Chapter ${idx + 1}</span>
        <h4 class="chap-title">${chap.title.split(':')[1] || chap.title}</h4>
        <div class="chap-dates">${chap.period} &bull; ${chap.location}</div>
      </div>
    `).join('');

    container.querySelectorAll('.chapter-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.getAttribute('data-chap-id');
        this.selectChapter(id);
      });
    });
  },

  selectChapter(chapId) {
    this.currentChapterId = chapId;
    const chap = CHAPTERS_DATA.find(c => c.id === chapId);
    if (!chap) return;

    // Highlight sidebar
    document.querySelectorAll('.chapter-item-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-chap-id') === chapId);
    });

    // Render Chapter Hero
    const heroContainer = document.getElementById('chapterHeroCard');
    if (heroContainer) {
      heroContainer.innerHTML = `
        <div class="chapter-meta">
          <span><i data-lucide="calendar"></i> ${chap.period}</span>
          <span>&bull;</span>
          <span><i data-lucide="map-pin"></i> ${chap.location}</span>
        </div>
        <h2>${chap.title}</h2>
        <p class="chapter-summary-text">${chap.summary}</p>
        <div class="chapter-highlights-list">
          ${chap.highlights.map(h => `<span class="highlight-badge"><i data-lucide="sparkles" style="width:14px;"></i> ${h}</span>`).join('')}
        </div>
      `;
    }

    // Filter receipts in date range
    const filtered = RECEIPTS_DATA.filter(r => {
      return r.date >= chap.filter.startDate && r.date <= chap.filter.endDate;
    });

    const countBadge = document.getElementById('chapterMomentCount');
    if (countBadge) countBadge.textContent = `${filtered.length} Connected Moments`;

    // Render Timeline Stream
    const streamContainer = document.getElementById('chapterTimelineContainer');
    if (streamContainer) {
      if (filtered.length === 0) {
        streamContainer.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">No receipts found for this period.</div>`;
      } else {
        streamContainer.innerHTML = filtered.map(r => this.createReceiptTimelineHTML(r)).join('');
        this.bindReceiptEvents(streamContainer);
      }
    }

    if (window.lucide) window.lucide.createIcons();
  },

  createReceiptTimelineHTML(r) {
    return `
      <div class="receipt-timeline-card" data-id="${r.id}">
        <div class="card-cat-icon" style="background:${r.color}">
          <i data-lucide="${r.icon}"></i>
        </div>
        <div class="card-body">
          <div class="card-top-info">
            <span class="card-cat-name" style="color:${r.color}">${r.category}</span>
            <span class="card-date-time">${r.date} at ${r.time} &bull; ${r.city}</span>
          </div>
          <h4 class="card-title">${r.title}</h4>
          <p class="card-detail">${r.detail}</p>
          <div class="card-tags-row">
            <span class="mood-pill">${r.mood}</span>
            ${r.tags.map(t => `<span class="tag-pill">#${t}</span>`).join('')}
            ${r.companions.length ? `<span class="tag-pill" style="color:var(--accent-pink);">with ${r.companions.join(', ')}</span>` : ''}
            
            <button class="connections-link-btn" data-id="${r.id}">
              <i data-lucide="git-commit" style="width:12px;"></i> ${r.connectedIds ? r.connectedIds.length : 0} Links
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bindReceiptEvents(container) {
    container.querySelectorAll('.receipt-timeline-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.connections-link-btn')) {
          e.stopPropagation();
          const rId = card.getAttribute('data-id');
          App.showReceiptModal(rId);
        } else {
          const rId = card.getAttribute('data-id');
          App.showReceiptModal(rId);
        }
      });
    });
  },

  setupPlayer() {
    const playBtn = document.getElementById('playChapterBtn');
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.toggleAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.stepChapter(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.stepChapter(1);
      });
    }
  },

  toggleAutoPlay() {
    const playBtn = document.getElementById('playChapterBtn');
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      playBtn.innerHTML = `<i data-lucide="pause"></i>`;
      this.playTimer = setInterval(() => {
        this.stepChapter(1);
      }, 5000);
    } else {
      playBtn.innerHTML = `<i data-lucide="play"></i>`;
      clearInterval(this.playTimer);
    }
    if (window.lucide) window.lucide.createIcons();
  },

  stepChapter(dir) {
    const currentIndex = CHAPTERS_DATA.findIndex(c => c.id === this.currentChapterId);
    let nextIndex = currentIndex + dir;

    if (nextIndex >= CHAPTERS_DATA.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = CHAPTERS_DATA.length - 1;

    this.selectChapter(CHAPTERS_DATA[nextIndex].id);
  }
};
