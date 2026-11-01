/* =========================================================
   SCIENCE QUEST — pointer drag & drop in stage coordinates
   ========================================================= */
(function () {
  'use strict';
  const SQ = (window.SQ = window.SQ || {});

  const Drag = {
    stage: null,
    scale: 1,
    active: null,
    bound: false,

    init(stage) {
      this.stage = stage;
      if (this.bound) return;
      this.bound = true;
      this._down = this._down.bind(this);
      this._move = this._move.bind(this);
      this._up = this._up.bind(this);
      stage.addEventListener('pointerdown', this._down);
      window.addEventListener('pointermove', this._move, { passive: false });
      window.addEventListener('pointerup', this._up);
      window.addEventListener('pointercancel', this._up);
    },

    setScale(s) {
      this.scale = s || 1;
    },

    make(el, cfg) {
      el._drag = cfg;
      if (el.dataset.type === undefined && cfg.type) el.dataset.type = cfg.type;
      if (!el.classList.contains('obj')) el.classList.add('obj');
      el.classList.add('draggable');
      if (!el.style.left) el.style.left = '0px';
      if (!el.style.top) el.style.top = '0px';
      return el;
    },

    enable(el, on) {
      if (!el) return;
      el.classList.toggle('draggable', !!on);
      el.classList.toggle('locked', !on);
    },

    _point(e) {
      const r = this.stage.getBoundingClientRect();
      return { x: (e.clientX - r.left) / this.scale, y: (e.clientY - r.top) / this.scale };
    },

    _zoneRects(acceptsType) {
      const stageRect = this.stage.getBoundingClientRect();
      return Array.from(this.stage.querySelectorAll('.dropzone')).map((z) => {
        const r = z.getBoundingClientRect();
        const accepts = (z.dataset.accept || '').split(/\s+/).filter(Boolean);
        return {
          el: z,
          left: (r.left - stageRect.left) / this.scale,
          top: (r.top - stageRect.top) / this.scale,
          right: (r.right - stageRect.left) / this.scale,
          bottom: (r.bottom - stageRect.top) / this.scale,
          ok: !accepts.length || accepts.includes(acceptsType)
        };
      });
    },

    _down(e) {
      if (e.button !== undefined && e.button !== 0) return;
      const el = e.target.closest('.draggable');
      if (!el || !this.stage.contains(el)) return;
      if (el.classList.contains('locked')) return;
      const cfg = el._drag || {};
      if (cfg.canDrag && cfg.canDrag(el) === false) return;
      e.preventDefault();
      const p = this._point(e);
      const startLeft = parseFloat(el.style.left) || 0;
      const startTop = parseFloat(el.style.top) || 0;
      this.active = {
        el,
        cfg,
        startLeft,
        startTop,
        px: p.x,
        py: p.y,
        moved: false,
        type: el.dataset.type || ''
      };
      el.classList.remove('returning');
      el.classList.add('dragging');
      if (cfg.onDragStart) cfg.onDragStart(el, { x: p.x, y: p.y });
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    },

    _move(e) {
      const a = this.active;
      if (!a) return;
      const p = this._point(e);
      const dx = p.x - a.px;
      const dy = p.y - a.py;
      if (Math.abs(dx) + Math.abs(dy) > 3) a.moved = true;
      const left = a.startLeft + dx;
      const top = a.startTop + dy;
      a.el.style.left = left + 'px';
      a.el.style.top = top + 'px';
      const rect = a.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const zones = this._zoneRects(a.type);
      let hot = null;
      zones.forEach((z) => {
        z.el.classList.toggle('active', z.ok && !z.el.classList.contains('no-highlight'));
        const r = z.el.getBoundingClientRect();
        const inside = cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
        z.hot = inside && z.ok;
        z.el.classList.toggle('hot', z.hot && z.ok);
        if (z.hot && z.ok) hot = z.el;
      });
      a.el.classList.toggle('target-hover', !!hot);
      if (a.cfg.onDrag) {
        a.cfg.onDrag(a.el, {
          x: left,
          y: top,
          centerX: left + a.el.offsetWidth / 2,
          centerY: top + a.el.offsetHeight / 2,
          dx,
          dy,
          hotZone: hot,
          moved: a.moved
        });
      }
      if (e.cancelable) e.preventDefault();
    },

    _up(e) {
      const a = this.active;
      if (!a) return;
      this.active = null;
      const el = a.el;
      el.classList.remove('dragging');
      a.el.classList.remove('target-hover');
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const zones = this._zoneRects(a.type);
      let drop = null;
      zones.forEach((z) => {
        z.el.classList.remove('active', 'hot');
        const r = z.el.getBoundingClientRect();
        if (z.ok && cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) drop = z.el;
      });
      let handled = false;
      if (a.cfg.onDrop) {
        handled = a.cfg.onDrop(drop, {
          el,
          moved: a.moved,
          x: parseFloat(el.style.left) || 0,
          y: parseFloat(el.style.top) || 0,
          startLeft: a.startLeft,
          startTop: a.startTop
        }) === true;
      }
      if (!handled) {
        Drag.animateTo(el, a.startLeft, a.startTop, 340);
        if (a.cfg.onReturn) a.cfg.onReturn(el);
      }
      if (a.cfg.onDragEnd) a.cfg.onDragEnd(el, !!drop);
    },

    animateTo(el, left, top, ms = 420) {
      el.classList.add('returning');
      // force layout so the transition applies
      void el.offsetWidth;
      el.style.left = left + 'px';
      el.style.top = top + 'px';
      clearTimeout(el._returnTimer);
      el._returnTimer = setTimeout(() => {
        el.classList.remove('returning');
        if (el._drag && el._drag.onSnapEnd) el._drag.onSnapEnd(el);
      }, ms + 30);
    },

    animateScale(el, scale = 1, ms = 300) {
      el.style.transition = `transform ${ms}ms ease`;
      el.style.transform = `scale(${scale})`;
      setTimeout(() => { el.style.transition = ''; }, ms + 30);
    }
  };

  SQ.Drag = Drag;
  SQ.fitStage = function fitStage() {
    const stage = document.getElementById('stage');
    const wrap = document.getElementById('stage-wrap');
    if (!stage || !wrap) return 1;
    const w = wrap.clientWidth - 8;
    const h = wrap.clientHeight - 2;
    if (w <= 0 || h <= 0) return 1;
    const scale = Math.max(0.45, Math.min(1.12, Math.min(w / 1000, h / 520)));
    stage.style.transform = `scale(${scale})`;
    Drag.setScale(scale);
    return scale;
  };
})();
