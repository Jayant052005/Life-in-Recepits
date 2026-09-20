// Persona Insights Component - Identity Radar & Chart Visualizations
const PersonaComponent = {
  charts: {},

  init() {
    this.renderCharts();
  },

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    this.renderCategoryChart();
    this.renderMoodChart();
    this.renderCityChart();
    this.renderSpendingChart();
  },

  renderCategoryChart() {
    const ctx = document.getElementById('chartCategories');
    if (!ctx) return;

    if (this.charts.cat) this.charts.cat.destroy();

    const counts = {};
    RECEIPTS_DATA.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    this.charts.cat = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: [
            '#ec4899', '#8b5cf6', '#10b981', '#f59e0b',
            '#3b82f6', '#06b6d4', '#6366f1', '#ef4444', '#14b8a6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
          }
        }
      }
    });
  },

  renderMoodChart() {
    const ctx = document.getElementById('chartMoods');
    if (!ctx) return;

    if (this.charts.mood) this.charts.mood.destroy();

    const moods = {};
    RECEIPTS_DATA.forEach(r => {
      if (r.mood) moods[r.mood] = (moods[r.mood] || 0) + 1;
    });

    this.charts.mood = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: Object.keys(moods).map(m => m.toUpperCase()),
        datasets: [{
          data: Object.values(moods),
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(99, 102, 241, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(6, 182, 212, 0.7)'
          ],
          borderWidth: 1,
          borderColor: '#1e293b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } }
          }
        },
        scales: {
          r: {
            ticks: { display: false },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });
  },

  renderCityChart() {
    const ctx = document.getElementById('chartCities');
    if (!ctx) return;

    if (this.charts.city) this.charts.city.destroy();

    const cities = {};
    RECEIPTS_DATA.forEach(r => {
      if (r.city) cities[r.city] = (cities[r.city] || 0) + 1;
    });

    this.charts.city = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(cities),
        datasets: [{
          label: 'Receipt Count',
          data: Object.values(cities),
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  },

  renderSpendingChart() {
    const ctx = document.getElementById('chartSpending');
    if (!ctx) return;

    if (this.charts.spending) this.charts.spending.destroy();

    // Calculate sum from Purchases
    const purchases = RECEIPTS_DATA.filter(r => r.category === 'Purchases');
    const spendingMap = {};

    purchases.forEach(p => {
      const amt = p.raw.amount_inr || 250;
      const cat = p.raw.category || 'General';
      spendingMap[cat] = (spendingMap[cat] || 0) + Number(amt);
    });

    this.charts.spending = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(spendingMap),
        datasets: [{
          label: 'Spending (INR ₹)',
          data: Object.values(spendingMap),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { display: false } }
        }
      }
    });
  }
};
