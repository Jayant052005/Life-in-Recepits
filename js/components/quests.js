// Quests Component - Story Detective Game Mode
const QuestsComponent = {
  unlockedQuests: new Set(),

  init() {
    this.renderQuests();
  },

  renderQuests() {
    const container = document.getElementById('questsContainer');
    if (!container) return;

    container.innerHTML = QUESTS_DATA.map(q => {
      const isDone = this.unlockedQuests.has(q.id);

      return `
        <div class="quest-card ${isDone ? 'completed' : ''}" data-id="${q.id}">
          <div style="display:flex; justify-size:space-between; align-items:flex-start;">
            <div class="quest-status-icon">
              <i data-lucide="${isDone ? 'check-circle-2' : 'lock'}"></i>
            </div>
          </div>
          
          <h3 class="quest-title">${q.title}</h3>
          <p class="quest-desc">${q.description}</p>
          <div class="quest-hint"><i data-lucide="help-circle" style="width:14px;"></i> Hint: ${q.hint}</div>
          
          <button class="btn ${isDone ? 'btn-outline' : 'btn-primary'} btn-block solve-quest-btn" data-id="${q.id}">
            ${isDone ? 'Unlocked Badge! (Inspect Story)' : 'Uncover Clue & Unlock'}
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.solve-quest-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qId = btn.getAttribute('data-id');
        this.solveQuest(qId);
      });
    });

    this.updateScore();
    if (window.lucide) window.lucide.createIcons();
  },

  solveQuest(qId) {
    const quest = QUESTS_DATA.find(q => q.id === qId);
    if (!quest) return;

    if (!this.unlockedQuests.has(qId)) {
      this.unlockedQuests.add(qId);

      // Trigger Confetti Celebration!
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      this.renderQuests();
    }

    // Filter Receipts Explorer to show matching evidence!
    App.switchTab('explorer');

    if (quest.targetCity) {
      const citySelect = document.getElementById('explorerCityFilter');
      if (citySelect) citySelect.value = quest.targetCity;
    }

    if (quest.targetCompanion) {
      const compSelect = document.getElementById('explorerCompanionFilter');
      if (compSelect) compSelect.value = quest.targetCompanion;
    }

    ExplorerComponent.applyFilters();
  },

  updateScore() {
    const scoreVal = document.getElementById('questScoreVal');
    const questBadge = document.getElementById('questBadge');

    if (scoreVal) scoreVal.textContent = `${this.unlockedQuests.size} / ${QUESTS_DATA.length}`;
    if (questBadge) questBadge.textContent = `${QUESTS_DATA.length - this.unlockedQuests.size}`;
  }
};
