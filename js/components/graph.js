// Graph Component - Interactive Multi-Dimensional Web of Life Engine (2D/3D Spatial Orbit)
const GraphComponent = {
  canvas: null,
  ctx: null,
  nodes: [],
  links: [],
  selectedNode: null,
  hoveredNode: null,
  draggedNode: null,
  
  // 3D & 2D Spatial Controls
  is3DMode: true,
  rotX: 0.2,
  rotY: 0.3,
  targetRotX: 0.2,
  targetRotY: 0.3,
  autoRotate: true,
  
  panX: 0,
  panY: 0,
  zoomScale: 1.0,
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  
  animId: null,
  criterion: 'all',
  categoryFilter: 'all',

  init() {
    this.canvas = document.getElementById('graphCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.draw();
    });

    this.bindControls();
    this.buildGraphData();
    this.startSimulation();
    this.bindInteractions();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth || 900;
    const h = parent.clientHeight || 600;

    this.canvas.width = w;
    this.canvas.height = h;
  },

  bindControls() {
    const critSelect = document.getElementById('graphLinkCriterion');
    const catSelect = document.getElementById('graphCategoryFilter');
    const resetBtn = document.getElementById('resetGraphBtn');
    const toggle3dBtn = document.getElementById('toggle3dBtn');

    if (critSelect) {
      critSelect.addEventListener('change', (e) => {
        this.criterion = e.target.value;
        this.buildGraphData();
      });
    }

    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.buildGraphData();
      });
    }

    if (toggle3dBtn) {
      toggle3dBtn.addEventListener('click', () => {
        this.is3DMode = !this.is3DMode;
        const label = document.getElementById('dimensionModeLabel');
        if (label) label.textContent = this.is3DMode ? '3D Galaxy Orbit' : '2D Plane Layout';
        this.buildGraphData();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.selectedNode = null;
        this.panX = 0;
        this.panY = 0;
        this.zoomScale = 1.0;
        this.rotX = 0.2;
        this.rotY = 0.3;
        this.targetRotX = 0.2;
        this.targetRotY = 0.3;
        this.buildGraphData();
        this.renderSidePanel(null);
      });
    }
  },

  buildGraphData() {
    this.resizeCanvas();

    let filtered = RECEIPTS_DATA;
    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === this.categoryFilter);
    }

    // Sample ~60 receipts across dataset
    const step = Math.max(1, Math.floor(filtered.length / 60));
    const sampled = filtered.filter((_, idx) => idx % step === 0).slice(0, 60);

    // 3D Spherical & Spatial Distribution
    this.nodes = sampled.map((r, i) => {
      // Golden spiral distribution on sphere in 3D dimensions
      const phi = Math.acos(-1 + (2 * i) / sampled.length);
      const theta = Math.sqrt(sampled.length * Math.PI) * phi;
      const radius = 180 + Math.random() * 80;

      return {
        id: r.id,
        receipt: r,
        // 3D Coordinates centered around (0,0,0)
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        // Projected coordinates
        px: 0,
        py: 0,
        pz: 0,
        pScale: 1.0,
        // Velocities
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.02,
        radius: 8 + Math.random() * 5,
        color: r.color || '#dda15e'
      };
    });

    this.links = [];
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const r1 = this.nodes[i].receipt;
        const r2 = this.nodes[j].receipt;
        let connect = false;

        if (this.criterion === 'all' || this.criterion === 'date') {
          if (r1.date === r2.date) connect = true;
        }
        if (this.criterion === 'all' || this.criterion === 'companion') {
          if (r1.companions.some(c => r2.companions.includes(c))) connect = true;
        }
        if (this.criterion === 'all' || this.criterion === 'city') {
          if (r1.city === r2.city && r1.city !== 'Unknown') connect = true;
        }
        if (this.criterion === 'all' || this.criterion === 'mood') {
          if (r1.mood === r2.mood && r1.mood !== 'neutral') connect = true;
        }

        if (connect) {
          this.links.push({
            source: this.nodes[i],
            target: this.nodes[j]
          });
        }
      }
    }
  },

  startSimulation() {
    if (this.animId) cancelAnimationFrame(this.animId);

    const animate = () => {
      this.updatePhysics();
      this.project3D();
      this.draw();
      this.animId = requestAnimationFrame(animate);
    };

    animate();
  },

  updatePhysics() {
    // Gentle auto-rotation when user is not dragging
    if (this.autoRotate && !this.isDragging) {
      this.targetRotY += 0.002;
    }

    // Smooth rotation interpolation
    this.rotX += (this.targetRotX - this.rotX) * 0.1;
    this.rotY += (this.targetRotY - this.rotY) * 0.1;

    // Slow internal 3D physics
    this.nodes.forEach(node => {
      if (node === this.draggedNode) return;

      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;

      // Heavy dampening for smooth steady float
      node.vx *= 0.95;
      node.vy *= 0.95;
      node.vz *= 0.95;
    });
  },

  project3D() {
    const width = this.canvas.width || 900;
    const height = this.canvas.height || 600;
    const centerX = (width - 320) / 2 + this.panX;
    const centerY = height / 2 + this.panY;
    const fov = 500 * this.zoomScale;

    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);

    this.nodes.forEach(node => {
      if (!this.is3DMode) {
        // Flat 2D layout fallback
        node.px = centerX + node.x * this.zoomScale;
        node.py = centerY + node.y * this.zoomScale;
        node.pz = 0;
        node.pScale = this.zoomScale;
        return;
      }

      // 3D Matrix Rotation Transformation
      const rx1 = node.x * cosY + node.z * sinY;
      const rz1 = -node.x * sinY + node.z * cosY;
      
      const ry2 = node.y * cosX - rz1 * sinX;
      const rz2 = node.y * sinX + rz1 * cosX;

      // Perspective Projection
      const pScale = fov / (fov + rz2 + 300);
      
      node.px = centerX + rx1 * pScale;
      node.py = centerY + ry2 * pScale;
      node.pz = rz2;
      node.pScale = Math.max(0.2, pScale);
    });
  },

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Sort nodes by Z-depth for realistic 3D rendering (farthest nodes drawn first)
    const sortedNodes = [...this.nodes].sort((a, b) => a.pz - b.pz);

    // Draw Links
    this.links.forEach(link => {
      const isHighlighted = this.selectedNode && 
        (link.source.id === this.selectedNode.id || link.target.id === this.selectedNode.id);

      const alpha = isHighlighted ? 0.95 : Math.min(0.25, 0.1 * ((link.source.pScale + link.target.pScale) / 2));
      
      this.ctx.strokeStyle = isHighlighted ? '#c4bca8' : `rgba(196, 188, 168, ${alpha})`;
      this.ctx.lineWidth = isHighlighted ? 2.5 : 1;

      this.ctx.beginPath();
      this.ctx.moveTo(link.source.px, link.source.py);
      this.ctx.lineTo(link.target.px, link.target.py);
      this.ctx.stroke();
    });

    // Draw Nodes
    sortedNodes.forEach(node => {
      const isSelected = this.selectedNode && node.id === this.selectedNode.id;
      const isHovered = this.hoveredNode && node.id === this.hoveredNode.id;

      const r = Math.max(3, (node.radius + (isSelected ? 5 : (isHovered ? 3 : 0))) * node.pScale);

      this.ctx.beginPath();
      this.ctx.arc(node.px, node.py, r, 0, Math.PI * 2);
      
      this.ctx.fillStyle = node.color;
      this.ctx.shadowBlur = isSelected ? 22 : (isHovered ? 14 : 5);
      this.ctx.shadowColor = isSelected ? '#c4bca8' : node.color;
      
      // Depth fading effect
      this.ctx.globalAlpha = Math.min(1.0, Math.max(0.35, node.pScale));
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      if (isSelected || isHovered) {
        this.ctx.strokeStyle = '#c4bca8';
        this.ctx.lineWidth = isSelected ? 3 : 2;
        this.ctx.stroke();
      }
      this.ctx.globalAlpha = 1.0;
    });

    // Draw Hover Tooltip in 3D Space
    if (this.hoveredNode && !this.draggedNode) {
      const n = this.hoveredNode;
      const r = n.receipt;
      const text = `${r.title} (${r.category}) • ${r.date}`;
      
      this.ctx.font = '600 12px "Outfit", sans-serif';
      const textWidth = this.ctx.measureText(text).width;
      
      const px = n.px - textWidth / 2;
      const py = n.py - 22;

      this.ctx.fillStyle = 'rgba(57, 60, 40, 0.95)';
      this.ctx.strokeStyle = '#c4bca8';
      this.ctx.lineWidth = 1;
      
      this.ctx.beginPath();
      this.ctx.roundRect(px - 10, py - 18, textWidth + 20, 26, 6);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#c4bca8';
      this.ctx.fillText(text, px, py);
    }
  },

  bindInteractions() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const findNodeAt = (pos) => {
      // Search in reverse order (closest projected Z node first)
      const sorted = [...this.nodes].sort((a, b) => b.pz - a.pz);
      for (const node of sorted) {
        const dx = pos.x - node.px;
        const dy = pos.y - node.py;
        const hitRadius = (node.radius + 8) * node.pScale;
        if (Math.sqrt(dx * dx + dy * dy) <= hitRadius) {
          return node;
        }
      }
      return null;
    };

    // Wheel Zoom in 3D space
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoomScale = Math.min(Math.max(0.4, this.zoomScale * zoomFactor), 2.5);
    }, { passive: false });

    // Mouse Move (Hover & 3D Spatial Orbit Dragging)
    this.canvas.addEventListener('mousemove', (e) => {
      const pos = getPos(e);

      if (this.isDragging) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;

        if (e.shiftKey) {
          // Shift + Drag for 2D Pan
          this.panX += dx;
          this.panY += dy;
        } else {
          // Drag for 3D Dimension Rotation
          this.targetRotY += dx * 0.005;
          this.targetRotX -= dy * 0.005;
        }

        this.dragStart = { x: e.clientX, y: e.clientY };
        return;
      }

      const node = findNodeAt(pos);
      this.hoveredNode = node;
      this.canvas.style.cursor = node ? 'pointer' : 'grab';
    });

    // Mouse Down (Start 3D Rotation / Node Drag)
    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      const node = findNodeAt(pos);

      if (node) {
        this.selectedNode = node;
        this.renderSidePanel(node.receipt);
      } else {
        this.isDragging = true;
        this.autoRotate = false;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
      }
    });

    // Mouse Up
    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
        // Resume gentle auto rotate after 4s idle
        setTimeout(() => { this.autoRotate = true; }, 4000);
      }
    });

    // Click
    this.canvas.addEventListener('click', (e) => {
      const pos = getPos(e);
      const node = findNodeAt(pos);
      this.selectedNode = node;
      this.renderSidePanel(node ? node.receipt : null);
    });
  },

  renderSidePanel(receipt) {
    const panel = document.getElementById('graphNodeDetails');
    if (!panel) return;

    if (!receipt) {
      panel.innerHTML = `
        <div class="panel-placeholder">
          <i data-lucide="compass" class="big-icon"></i>
          <p>Drag across canvas to rotate the 3D multi-dimensional galaxy orbit! Scroll to zoom in/out.</p>
        </div>
      `;
    } else {
      const connectedCount = this.links.filter(l => l.source.id === receipt.id || l.target.id === receipt.id).length;

      panel.innerHTML = `
        <div class="panel-header" style="margin-bottom:1rem;">
          <span class="ticket-cat-badge" style="background:${receipt.color}33; color:${receipt.color}; border:1px solid ${receipt.color}66;">${receipt.category}</span>
          <h3 style="font-size:1.15rem; color:#fefae0; margin:0.4rem 0; font-family:var(--font-heading);">${receipt.title}</h3>
          <p style="font-size:0.82rem; color:var(--text-muted); font-family:var(--font-mono);">${receipt.date} at ${receipt.time} &bull; ${receipt.city}</p>
        </div>

        <div style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1rem; line-height:1.5;">
          ${receipt.detail}
        </div>

        <div style="margin-bottom:1rem; display:flex; flex-direction:column; gap:0.4rem;">
          <span class="mood-pill" style="align-self:flex-start;">Mood: ${receipt.mood}</span>
          ${receipt.companions.length ? `<p style="font-size:0.82rem; color:var(--accent-pink);">With: ${receipt.companions.join(', ')}</p>` : ''}
        </div>

        <div style="padding:0.85rem; background:rgba(254, 250, 224, 0.05); border-radius:var(--radius-md); border:1px solid var(--glass-border); margin-bottom:1.25rem;">
          <div style="font-size:0.75rem; color:var(--accent-primary); font-weight:700; text-transform:uppercase;">CONNECTED WEB</div>
          <div style="font-size:1.3rem; font-family:var(--font-heading); font-weight:800; color:#fefae0;">${connectedCount} Linked Moments</div>
        </div>

        <button type="button" class="btn btn-primary btn-block" id="viewNodeModalBtn">
          Inspect Full Receipt Details
        </button>
      `;

      document.getElementById('viewNodeModalBtn').addEventListener('click', () => {
        App.showReceiptModal(receipt.id);
      });
    }

    if (window.lucide) window.lucide.createIcons();
  }
};
