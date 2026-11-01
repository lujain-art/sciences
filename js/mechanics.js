/* =========================================================
   SCIENCE QUEST — experiment mechanics & stage art
   ========================================================= */
(function () {
  'use strict';
  const SQ = (window.SQ = window.SQ || {});
  const SFX = () => SQ.SFX;
  const M = {};
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function play(name, opts) {
    if (SQ.SFX) SQ.SFX.play(name, opts);
  }

  /* ---------------- generic helpers ---------------- */
  M.el = function (cls, x, y, w, h) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    if (x !== undefined) d.style.left = x + 'px';
    if (y !== undefined) d.style.top = y + 'px';
    if (w !== undefined) d.style.width = w + 'px';
    if (h !== undefined) d.style.height = h + 'px';
    return d;
  };

  M.add = function (ctx, node) {
    (ctx && ctx.stage ? ctx.stage : document.getElementById('stage')).appendChild(node);
    if (ctx && ctx.nodes) ctx.nodes.push(node);
    return node;
  };

  M.svg = function (w, h, inner) {
    return `<svg viewBox="0 0 ${w} ${h}" overflow="visible" aria-hidden="true">${inner}</svg>`;
  };

  M.object = function (ctx, opts) {
    const o = Object.assign({ x: 0, y: 0, w: 120, h: 120, cls: '', html: '', type: '', label: '' }, opts);
    const el = M.el(('obj ' + o.cls).trim(), o.x, o.y, o.w, o.h);
    el.innerHTML = `<div class="obj-glow"></div><div class="obj-art">${o.html}</div>` +
      (o.label ? `<span class="obj-label">${o.label}</span>` : '');
    if (o.type) el.dataset.type = o.type;
    M.add(ctx, el);
    return el;
  };

  M.zone = function (ctx, opts) {
    const z = M.el(('dropzone ' + (opts.cls || '')).trim(), opts.x, opts.y, opts.w, opts.h);
    z.dataset.accept = opts.accept || '';
    if (opts.role) z.dataset.role = opts.role;
    if (opts.noHighlight) z.classList.add('no-highlight');
    M.add(ctx, z);
    return z;
  };

  M.tip = function (ctx, html, attention) {
    const old = ctx.stage.querySelector('.stage-tip.fx-tip');
    if (old) old.remove();
    const t = M.el('stage-tip fx-tip');
    t.innerHTML = `<svg class="tiny-icon"><use href="#i-bulb"/></svg><span>${html}</span>`;
    t.style.top = '6px';
    if (attention) t.classList.add('attention');
    M.add(ctx, t);
    if (ctx.timers) ctx.timers.push(setTimeout(() => t.classList.remove('attention'), 9000));
    else setTimeout(() => t.classList.remove('attention'), 9000);
    return t;
  };

  M.stagePoint = function (el) {
    const stage = SQ.Drag && SQ.Drag.stage;
    if (!stage) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const s = SQ.Drag.scale || 1;
    const sr = stage.getBoundingClientRect();
    return {
      x: (r.left - sr.left) / s + r.width / s / 2,
      y: (r.top - sr.top) / s + r.height / s / 2
    };
  };

  M.snapTo = function (el, zone) {
    const p = M.stagePoint(zone);
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    SQ.Drag.animateTo(el, p.x - w / 2, p.y - h / 2, 360);
    el.classList.add('snapped');
    setTimeout(() => el.classList.remove('snapped'), 520);
  };

  M.makeDrag = function (ctx, el, cfg) {
    SQ.Drag.make(el, {
      type: cfg.type,
      canDrag: cfg.canDrag,
      onDragStart(e, info) {
        el.classList.remove('hint-glow');
        play('pickup');
        if (cfg.onDragStart) cfg.onDragStart(e, info);
      },
      onDrag(e, info) {
        if (cfg.onDrag) cfg.onDrag(e, info);
      },
      onDrop(zone, info) {
        return cfg.onDrop ? cfg.onDrop(zone, info) === true : false;
      },
      onReturn() {
        play('wrong');
        if (cfg.onReturn) cfg.onReturn();
      },
      onDragEnd() {
        if (cfg.onDragEnd) cfg.onDragEnd();
      },
      onSnapEnd() {
        if (cfg.onSnapEnd) cfg.onSnapEnd();
      }
    });
    return el;
  };

  /* ---------------- small particles ---------------- */
  M.bits = function (ctx, opts) {
    const { x, y, count = 8, kind = 'flour', color, spread = 26, fall = 130, dur = 0.9 } = opts;
    for (let i = 0; i < count; i++) {
      const b = M.el('stage-bit');
      const size = kind === 'lentil' ? rnd(10, 14) : kind === 'water' ? rnd(5, 8) : rnd(4, 7);
      b.style.width = size + 'px';
      b.style.height = (kind === 'lentil' ? size * 0.72 : size) + 'px';
      b.style.left = x + rnd(-spread, spread) + 'px';
      b.style.top = y + rnd(-6, 6) + 'px';
      b.style.background = color || (kind === 'lentil' ? '#c68a4d' : kind === 'water' ? '#7ddcff' : '#f6efdb');
      b.style.setProperty('--dx', rnd(-24, 24) + 'px');
      b.style.setProperty('--dy', fall + rnd(-24, 34) + 'px');
      b.style.animationDuration = rnd(dur * 0.8, dur * 1.25) + 's';
      b.style.borderRadius = kind === 'lentil' ? '50%' : '50%';
      M.add(ctx, b);
      setTimeout(() => b.remove(), 1600);
    }
  };

  M.spark = function (el) {
    if (!SQ.FX || !SQ.FX.center) return;
    const p = SQ.FX.center(el);
    SQ.FX.sparkle(p.x, p.y, 0.8);
  };

  M.flashAt = function (el, colors) {
    if (!SQ.FX || !SQ.FX.center) return;
    const p = SQ.FX.center(el);
    SQ.FX.burst(p.x, p.y, { count: 16, colors: colors || ['#ffd166', '#fff3c4', '#4fe6ff'], speed: 3, gravity: 0.04, size: [2, 5], life: [0.4, 0.9] });
  };

  /* ---------------- art factories ---------------- */
  M.nailSVG = function () {
    return M.svg(30, 78, `
      <ellipse cx="15" cy="70" rx="11" ry="4" fill="rgba(0,0,0,.25)"/>
      <path d="M7 4h16l-2 50-6 16-6-16z" fill="#c6d2e5" stroke="#7f90ab" stroke-width="1.6" stroke-linejoin="round"/>
      <rect x="4" y="2" width="22" height="8" rx="4" fill="#e7eefb" stroke="#8a9ab4" stroke-width="1.5"/>
      <path d="M13 12v36" stroke="#f7fbff" stroke-width="2.4" opacity=".85"/>
      <path d="M8 4h14" stroke="#ffffff" stroke-width="1.4" opacity=".8"/>`);
  };

  M.chipSVG = function (color) {
    const c = color || '#ff9f68';
    return M.svg(42, 32, `
      <path d="M8 3h22l9 8-8 18H10L2 17z" fill="${c}" stroke="rgba(30,18,10,.45)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M10 7h18l5 5" fill="none" stroke="#ffffff" stroke-width="2" opacity=".5" stroke-linecap="round"/>
      <circle cx="24" cy="18" r="3" fill="#ffffff" opacity=".35"/>`);
  };

  M.lentilSVG = function () {
    return M.svg(24, 18, `<ellipse cx="12" cy="9" rx="10" ry="7" fill="#c98d4c" stroke="#96622c" stroke-width="1.6"/><path d="M7 6c3-2 8-2 11 0" stroke="#e8bb83" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  };

  M.magnetSVG = function () {
    return M.svg(180, 172, `
      <ellipse cx="90" cy="158" rx="60" ry="9" fill="rgba(0,0,0,.3)"/>
      <path d="M38 144V76a52 52 0 0 1 104 0v68h-32V76a20 20 0 0 0-40 0v68z" fill="#ef4b5f" stroke="#81152b" stroke-width="5" stroke-linejoin="round"/>
      <path d="M38 76a52 52 0 0 1 104 0" fill="none" stroke="#ff9aa5" stroke-width="6" opacity=".55" stroke-linecap="round"/>
      <path d="M46 92v42" stroke="#ffffff" stroke-width="5" opacity=".28" stroke-linecap="round"/>
      <rect x="32" y="124" width="38" height="34" rx="7" fill="#dde6f4" stroke="#77879e" stroke-width="4"/>
      <rect x="110" y="124" width="38" height="34" rx="7" fill="#dde6f4" stroke="#77879e" stroke-width="4"/>
      <path d="M38 142h26M116 142h26" stroke="#54627a" stroke-width="3" stroke-linecap="round"/>
      <path d="M42 130h18M120 130h18" stroke="#ffffff" stroke-width="3" opacity=".7" stroke-linecap="round"/>`);
  };

  M.sieveSVG = function () {
    let lentils = '';
    for (let i = 0; i < 14; i++) {
      lentils += `<ellipse cx="${50 + rnd(0, 140)}" cy="${24 + rnd(0, 14)}" rx="${rnd(5, 7)}" ry="${rnd(3.4, 4.6)}" fill="${i % 3 ? '#c98d4c' : '#b9793a'}" transform="rotate(${rnd(-40, 40)} ${50 + i} 24)"/>`;
    }
    let flour = '';
    for (let i = 0; i < 26; i++) flour += `<circle cx="${34 + rnd(0, 172)}" cy="${17 + rnd(0, 20)}" r="${rnd(1.2, 2.4)}" fill="#f5eeda" opacity=".85"/>`;
    let mesh = '';
    for (let i = 0; i < 9; i++) mesh += `<path d="M${44 + i * 16} 12v30M${36 + i * 17} 18l${i % 2 ? 3 : -3} 22" stroke="#7f8a99" stroke-width="1" opacity=".55"/>`;
    return M.svg(264, 160, `
      <ellipse cx="132" cy="136" rx="92" ry="10" fill="rgba(0,0,0,.28)"/>
      <g class="sieve-body">
        <path d="M20 28q12 86 112 92 100-6 112-92z" fill="rgba(190,214,235,.2)" stroke="#aab8cc" stroke-width="5" stroke-linejoin="round"/>
        <path d="M34 32q14 66 98 72 84-6 98-72z" fill="#1c2431" opacity=".85"/>
        <g opacity=".5">${mesh}</g>
        <ellipse cx="132" cy="28" rx="112" ry="26" fill="#8a6a45" stroke="#5f4426" stroke-width="5"/>
        <ellipse cx="132" cy="27" rx="102" ry="20" fill="#252017"/>
        <g class="sieve-grains">${flour}${lentils}</g>
        <ellipse cx="132" cy="27" rx="102" ry="20" fill="none" stroke="#d9e3f2" stroke-width="2" opacity=".5"/>
        <rect x="210" y="8" width="54" height="16" rx="8" fill="#8a6a45" stroke="#5f4426" stroke-width="3"/>
      </g>`);
  };

  M.bowlSVG = function (opts) {
    const o = opts || {};
    return M.svg(230, 120, `
      <ellipse cx="115" cy="108" rx="76" ry="9" fill="rgba(0,0,0,.28)"/>
      <path d="M16 34q8 68 99 74 91-6 99-74z" fill="rgba(150,225,255,.13)" stroke="#9adcf5" stroke-width="4.5" stroke-linejoin="round"/>
      <ellipse cx="115" cy="34" rx="99" ry="21" fill="#0e1a2c" opacity=".7"/>
      <ellipse cx="115" cy="34" rx="99" ry="21" fill="none" stroke="#c8f3ff" stroke-width="3" opacity=".75"/>
      <ellipse class="${o.fillClass || 'bowl-flour'}" cx="115" cy="35" rx="82" ry="13" fill="#f5eeda" opacity="0"/>
      <ellipse class="bowl-water" cx="115" cy="36" rx="85" ry="15" fill="#67c9ea" opacity="0"/>
      <path d="M32 46q6 40 42 54" fill="none" stroke="#ffffff" stroke-width="3.5" opacity=".28" stroke-linecap="round"/>`);
  };

  M.flaskSVG = function (opts) {
    const o = opts || {};
    const color = o.color || '#6bdcff';
    return M.svg(160, 206, `
      <ellipse cx="80" cy="192" rx="56" ry="8" fill="rgba(0,0,0,.3)"/>
      <path d="M62 14h36v46l32 82q10 30-22 30H50q-32 0-22-30l32-82z" fill="rgba(160,235,255,.12)" stroke="#a8e6ff" stroke-width="5" stroke-linejoin="round"/>
      <path class="liquid" d="M35 132q45-9 90 0v37q0 17-17 17H52q-17 0-17-17z" fill="${color}" opacity=".82" style="transform:scaleY(0)"/>
      <rect x="58" y="5" width="44" height="13" rx="6" fill="#d6f4ff" stroke="#8ed4ea" stroke-width="2"/>
      <path d="M49 84l-10 28" stroke="#ffffff" stroke-width="4" opacity=".35" stroke-linecap="round"/>
      <path d="M99 102l8 24" stroke="#ffffff" stroke-width="3" opacity=".22" stroke-linecap="round"/>`);
  };

  M.jarSVG = function (opts) {
    const o = opts || {};
    let grains = '';
    if (o.grainy) {
      for (let i = 0; i < 30; i++) {
        grains += `<ellipse cx="${33 + rnd(0, 84)}" cy="${101 + rnd(0, 72)}" rx="${rnd(3, 4.6)}" ry="${rnd(2, 3)}" fill="${i % 3 ? '#b9793a' : '#daa565'}" opacity=".9"/>`;
      }
    }
    return M.svg(150, 200, `
      <ellipse cx="75" cy="188" rx="52" ry="8" fill="rgba(0,0,0,.3)"/>
      <g class="jar-body">
        <rect x="20" y="36" width="110" height="148" rx="26" fill="rgba(165,235,255,.14)" stroke="${o.rim || '#9adcf5'}" stroke-width="4.5"/>
        <g class="liquid">
          <path d="M27 96q48-10 96 0v60q0 22-22 22H49q-22 0-22-22z" fill="${o.color || '#8a5a2e'}" opacity="${o.opacity || '0.9'}"/>
          ${grains}
        </g>
        <rect x="30" y="26" width="90" height="16" rx="7" fill="${o.lid || '#cfe3f7'}" stroke="#6f8ca8" stroke-width="3"/>
        <path d="M34 60v92" stroke="#ffffff" stroke-width="4" opacity=".3" stroke-linecap="round"/>
      </g>`);
  };

  M.funnelSVG = function () {
    return M.svg(190, 196, `
      <ellipse cx="95" cy="184" rx="54" ry="7" fill="rgba(0,0,0,.22)"/>
      <path d="M18 20h154l-58 82v52H76v-52z" fill="rgba(160,235,255,.13)" stroke="#a8e6ff" stroke-width="5" stroke-linejoin="round"/>
      <ellipse cx="95" cy="20" rx="77" ry="13" fill="rgba(120,200,235,.12)" stroke="#c8f3ff" stroke-width="3"/>
      <g class="funnel-paper" opacity="0">
        <path d="M36 20h118L95 92z" fill="#f7efd9" stroke="#dbc99c" stroke-width="2.5"/>
        <path d="M58 20l37 64M95 20v72M132 20l-37 64" stroke="#e4d5ae" stroke-width="1.6" opacity=".8"/>
      </g>
      <rect x="76" y="150" width="38" height="36" rx="8" fill="rgba(180,235,255,.18)" stroke="#9adcf5" stroke-width="3.5"/>
      <path d="M84 88l-8 30" stroke="#ffffff" stroke-width="3.5" opacity=".3" stroke-linecap="round"/>`);
  };

  M.filterPaperSVG = function () {
    return M.svg(120, 120, `
      <path d="M10 14h100L60 104z" fill="#faf3df" stroke="#d8c59a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 14l30 78M60 14v90M90 14 60 92" stroke="#e6d8b7" stroke-width="1.6" opacity=".8"/>
      <path d="M14 14h92" stroke="#ffffff" stroke-width="3" opacity=".9"/>`);
  };

  M.mysterySVG = function () {
    return M.svg(190, 220, `
      <ellipse cx="95" cy="206" rx="65" ry="9" fill="rgba(0,0,0,.35)"/>
      <g class="mystery-body">
        <rect x="26" y="42" width="138" height="158" rx="34" fill="rgba(120,240,170,.13)" stroke="#5fe3a1" stroke-width="4.5"/>
        <path d="M34 120q60-14 122 0v52q0 24-24 24H58q-24 0-24-24z" fill="#2f8c5f" opacity=".7"/>
        <circle cx="62" cy="146" r="7" fill="#a8ffcf" opacity=".7"/>
        <circle cx="112" cy="162" r="5" fill="#a8ffcf" opacity=".6"/>
        <circle cx="94" cy="132" r="4" fill="#d6ffe9" opacity=".7"/>
        <text x="95" y="150" text-anchor="middle" font-family="Baloo, Cairo, sans-serif" font-size="58" font-weight="800" fill="#d7ffe9" opacity=".75" class="mystery-q">؟</text>
      </g>
      <g class="mystery-lid">
        <rect x="20" y="22" width="150" height="30" rx="12" fill="#2e7d5b" stroke="#69e6a8" stroke-width="4"/>
        <rect x="52" y="8" width="86" height="20" rx="9" fill="#3f9d73" stroke="#69e6a8" stroke-width="3"/>
      </g>`);
  };

  M.binSVG = function (kind) {
    if (kind === 'iron') {
      return M.svg(150, 110, `
        <g transform="rotate(24 45 60)">${M.nailSVG()}</g>
        <g transform="translate(52 6) rotate(-18 20 60)">${M.nailSVG()}</g>
        <g transform="translate(84 10) rotate(40 20 60)">${M.nailSVG()}</g>`);
    }
    if (kind === 'plastic') {
      return M.svg(150, 110, `
        <g transform="translate(8 12) rotate(-16 20 20)">${M.chipSVG('#ff9f68')}</g>
        <g transform="translate(60 4) rotate(18 20 20)">${M.chipSVG('#ff7aa8')}</g>
        <g transform="translate(34 52) rotate(-4 20 20)">${M.chipSVG('#ffc46b')}</g>`);
    }
    if (kind === 'lentil') {
      return M.svg(150, 110, `
        <ellipse cx="40" cy="62" rx="12" ry="8" fill="#c98d4c"/><ellipse cx="72" cy="54" rx="12" ry="8" fill="#b9793a"/>
        <ellipse cx="104" cy="66" rx="12" ry="8" fill="#c98d4c"/><ellipse cx="58" cy="82" rx="12" ry="8" fill="#b9793a"/>
        <ellipse cx="92" cy="88" rx="12" ry="8" fill="#c98d4c"/>`);
    }
    return M.svg(150, 110, `<circle cx="75" cy="55" r="34" fill="#f5eeda" opacity=".85"/><circle cx="52" cy="76" r="20" fill="#f8f2df" opacity=".7"/><circle cx="100" cy="78" r="17" fill="#f8f2df" opacity=".6"/>`);
  };

  M.toolRack = function (ctx, x, y, w) {
    const rack = M.el('tool-rack', x, y, w || 430, 108);
    rack.innerHTML = '<span class="rack-label">أدوات المختبر</span>';
    M.add(ctx, rack);
    return rack;
  };

  /* ---------------- magnet mechanic ---------------- */
  M.setupMagnet = function (ctx, opts) {
    const magnet = opts.magnet;
    const items = (opts.items || []).slice();
    const bin = opts.bin;
    const home = opts.home || { x: parseFloat(magnet.style.left) || 0, y: parseFloat(magnet.style.top) || 0 };
    const max = opts.max || 6;
    const art = magnet.querySelector('.obj-art');
    const stuck = [];
    const attached = new Set();
    let released = 0;
    let busy = false;

    magnet.classList.add('magnet-tool');

    function attach(item) {
      if (attached.has(item.el)) return;
      attached.add(item.el);
      item.el.classList.add('fade-out');
      play('attach');
      M.spark(item.el);
      setTimeout(() => { if (item.el.parentNode) item.el.remove(); }, 330);

      const idx = stuck.length;
      const side = idx % 2;
      const n = M.el('nail-stuck');
      n.style.left = (side ? 104 : 28) + rnd(-5, 5) + 'px';
      n.style.top = (100 + Math.floor(idx / 2) * 9) + 'px';
      n.style.transform = `rotate(${rnd(-24, 24)}deg)`;
      n.innerHTML = M.nailSVG();
      art.appendChild(n);
      stuck.push(n);
      if (opts.onAttached) opts.onAttached(stuck.length, attached.size, items.length);
      if (attached.size >= items.length && opts.onAllAttached) opts.onAllAttached();
    }

    function release() {
      if (!stuck.length) return;
      const count = stuck.length;
      const binP = M.stagePoint(bin);
      stuck.forEach((n, i) => {
        n.style.transition = 'transform .32s ease, opacity .32s ease';
        n.style.transform = `translate(${rnd(-10, 10)}px, ${60 + rnd(0, 22)}px) rotate(${rnd(-70, 70)}deg) scale(.7)`;
        n.style.opacity = '0';
        setTimeout(() => n.remove(), 360);
        play('metalDrop', { delay: i * 0.055 });
      });
      stuck.length = 0;
      released += count;
      if (SQ.FX) {
        const bp = SQ.FX.center(bin);
        SQ.FX.burst(bp.x, bp.y, { count: 22, colors: ['#dfe8f7', '#ffd166', '#8ff2ff'], speed: 4, gravity: 0.09, size: [2, 5], shape: 'circle', life: [0.5, 1] });
      }
      play('place');
      bin.classList.add('snapped');
      setTimeout(() => bin.classList.remove('snapped'), 500);
      if (opts.onCollected) opts.onCollected(released, items.length);
      if (released >= items.length && opts.onEmpty) opts.onEmpty();
    }

    M.makeDrag(ctx, magnet, {
      type: 'magnet',
      onDragStart() {
        magnet.classList.add('active');
        play('magnet');
        if (ctx.onToolDrag) ctx.onToolDrag(magnet, true);
      },
      onDrag(el, info) {
        if (busy) return;
        const mx = info.centerX;
        const my = info.centerY + 46;
        items.forEach((item) => {
          if (attached.has(item.el) || stuck.length >= max) return;
          const w = item.el.offsetWidth || 24;
          const h = item.el.offsetHeight || 52;
          const x = (parseFloat(item.el.style.left) || 0) + w / 2;
          const y = (parseFloat(item.el.style.top) || 0) + h / 2;
          if (Math.hypot(x - mx, y - my) < 70) attach(item);
        });
      },
      onDrop(zone) {
        magnet.classList.remove('active');
        if (zone === bin && stuck.length) release();
        else if (stuck.length && zone !== bin && opts.onWrongDrop) opts.onWrongDrop(stuck.length);
        SQ.Drag.animateTo(magnet, home.x, home.y, 430);
        return false;
      },
      onDragEnd() {
        magnet.classList.remove('active');
        if (ctx.onToolDrag) ctx.onToolDrag(magnet, false);
      }
    });

    return {
      release,
      get stuck() { return stuck.length; },
      get released() { return released; },
      disable() { busy = true; },
      enable() { busy = false; }
    };
  };

  /* ---------------- sorting (chips -> bin) ---------------- */
  M.setupSort = function (ctx, opts) {
    const { el, bin, onCorrect, onWrong } = opts;
    M.makeDrag(ctx, el, {
      type: el.dataset.type || 'chip',
      onDrop(zone) {
        if (zone === bin) {
          const p = M.stagePoint(bin);
          play('place');
          setTimeout(() => play('cling'), 90);
          SQ.Drag.animateTo(el, p.x - el.offsetWidth / 2, p.y - el.offsetHeight / 2, 300);
          el.classList.add('snapped');
          setTimeout(() => {
            el.classList.add('fade-out');
            M.flashAt(bin, ['#ffd166', '#ff9f68', '#fff3c4']);
            if (onCorrect) onCorrect();
            setTimeout(() => el.remove(), 330);
          }, 280);
          return true;
        }
        if (zone && onWrong) onWrong();
        else if (!zone) play('wrong');
        return false;
      }
    });
  };

  /* ---------------- sieve mechanic ---------------- */
  M.setupSieve = function (ctx, opts) {
    const sieve = opts.sieve;
    const placeZone = opts.placeZone;
    const pourZone = opts.pourZone;
    const flourLayer = opts.flourLayer;
    const total = opts.ticks || 14;
    let phase = 'place';
    let tick = 0;
    let shaking = false;
    let timer = null;
    let tickedThisPress = false;
    let stolen = false;
    const placedPos = { x: 0, y: 0 };
    const grains = sieve.querySelector('.sieve-grains');
    sieve.classList.add('sieve-tool');
    sieve.style.touchAction = 'none';

    function settle() {
      phase = 'shake';
      const p = M.stagePoint(placeZone);
      placedPos.x = p.x - sieve.offsetWidth / 2;
      placedPos.y = p.y - sieve.offsetHeight / 2 + 10;
      SQ.Drag.animateTo(sieve, placedPos.x, placedPos.y, 380);
      sieving_enableShake();
      play('place');
      if (opts.onPlaced) opts.onPlaced();
    }

    function sieving_enableShake() {
      sieve.classList.add('can-shake');
    }

    function doSift() {
      tick++;
      const p = M.stagePoint(sieve);
      const bowl = opts.bowl;
      const target = bowl ? M.stagePoint(bowl) : p;
      M.bits(ctx, {
        x: p.x + rnd(-28, 28),
        y: p.y + 46,
        count: 5,
        kind: 'flour',
        spread: 24,
        fall: Math.max(60, target.y - p.y - 10),
        dur: 0.75
      });
      if (flourLayer) {
        const ratio = clamp(tick / total, 0, 1);
        flourLayer.style.opacity = String(0.15 + ratio * 0.85);
        flourLayer.style.transformBox = 'fill-box';
        flourLayer.style.transformOrigin = 'center';
        flourLayer.style.transform = `scaleY(${0.4 + ratio * 0.6})`;
      }
      if (tick % 2 === 0) play('sift');
      if (opts.onTick) opts.onTick(tick, total);
      if (sieve) {
        sieve.style.transform = `rotate(${rnd(-1.2, 1.2)}deg)`;
        setTimeout(() => { sieve.style.transform = ''; }, 120);
      }
      if (tick >= total) finish();
    }

    function startShake(e) {
      if (phase !== 'shake' || shaking || stolen) return;
      if (e) { e.preventDefault(); e.stopPropagation(); }
      shaking = true;
      tickedThisPress = false;
      sieve.classList.add('shaking');
      play('sieveShake');
      if (opts.onShakeStart) opts.onShakeStart();
      const step = () => {
        if (!shaking) return;
        tickedThisPress = true;
        doSift();
        if (shaking && tick < total) timer = setTimeout(step, 190);
      };
      timer = setTimeout(step, 90);
    }

    function stopShake() {
      if (!shaking) return;
      shaking = false;
      clearTimeout(timer);
      sieve.classList.remove('shaking');
      sieve.style.transform = '';
      if (phase === 'shake' && !tickedThisPress) doSift();
    }

    function finish() {
      shaking = false;
      clearTimeout(timer);
      sieve.classList.remove('shaking', 'can-shake');
      phase = 'pour';
      if (grains) grains.classList.add('is-empty');
      play('sparkle');
      if (opts.onFull) opts.onFull();
      M.tip(ctx, 'رائع! بقي العدس الكبير في الغربال. اسحبوا الغربال إلى وعاء العدس.', true);
    }

    function pour() {
      if (phase !== 'pour') return;
      phase = 'done';
      SQ.Drag.enable(sieve, false);
      sieve.classList.add('pouring');
      play('sandPour');
      const target = pourZone ? M.stagePoint(pourZone) : M.stagePoint(sieve);
      const waves = 4;
      for (let i = 0; i < waves; i++) {
        setTimeout(() => {
          M.bits(ctx, {
            x: M.stagePoint(sieve).x + rnd(-26, 26),
            y: M.stagePoint(sieve).y + 38,
            count: 7,
            kind: 'lentil',
            spread: 22,
            fall: Math.max(40, target.y - M.stagePoint(sieve).y),
            dur: 0.8
          });
          if (opts.pourTarget) M.setLiquid(opts.pourTarget, 0.16 + ((i + 1) / waves) * 0.84);
          play('sift');
        }, i * 180);
      }
      if (opts.onPourStart) opts.onPourStart();
      setTimeout(() => {
        sieve.style.opacity = '';
        sieve.style.transform = '';
        sieve.classList.add('fade-out');
        if (opts.onPoured) opts.onPoured();
      }, 1400);
    }

    M.makeDrag(ctx, sieve, {
      type: 'sieve',
      canDrag() { return (phase === 'place' || phase === 'pour') && !stolen; },
      onDragStart() { play('pickup'); },
      onDrop(zone) {
        if (phase === 'place' && zone === placeZone) {
          settle();
          return true;
        }
        if (phase === 'pour' && zone === pourZone) {
          pour();
          return true;
        }
        if (zone) play('wrong');
        return false;
      }
    });

    sieve.addEventListener('pointerdown', startShake);
    window.addEventListener('pointerup', stopShake);
    window.addEventListener('pointercancel', stopShake);
    if (ctx.cleanups) ctx.cleanups.push(() => {
      window.removeEventListener('pointerup', stopShake);
      window.removeEventListener('pointercancel', stopShake);
      clearTimeout(timer);
    });

    return {
      settle,
      steal() {
        stolen = true;
        shaking = false;
        clearTimeout(timer);
        sieve.classList.remove('shaking', 'can-shake');
        sieve.classList.add('is-stolen');
        phase = 'stolen';
      },
      restore() {
        stolen = false;
        phase = 'shake';
        sieve.classList.remove('is-stolen');
        sieve.classList.add('can-shake');
        sieve.classList.remove('fade-out');
        sieve.classList.add('snapped');
        setTimeout(() => sieve.classList.remove('snapped'), 500);
      },
      get phase() { return phase; },
      get tick() { return tick; }
    };
  };

  /* ---------------- filtration mechanic ---------------- */
  M.setupFilter = function (ctx, opts) {
    const { paper, funnel, jar, flask, paperZone, funnelZone, pourZone, stream } = opts;
    let phase = 'paper';
    let pouring = false;
    const funnelHome = { x: parseFloat(funnel.style.left) || 0, y: parseFloat(funnel.style.top) || 0 };

    function placePaper(zone) {
      if (phase !== 'paper' || zone !== paperZone) return false;
      phase = 'funnel';
      paper.classList.add('fade-out');
      play('place');
      setTimeout(() => {
        paper.style.display = 'none';
        funnel.classList.add('has-paper');
        M.spark(funnel);
        if (opts.onPaper) opts.onPaper();
        M.tip(ctx, 'ورق الترشيح في مكانه! الآن ضعوا القمع فوق الكأس.', true);
      }, 260);
      return true;
    }

    function placeFunnel(zone) {
      if (phase !== 'funnel' || zone !== funnelZone) return false;
      phase = 'jar';
      const p = M.stagePoint(funnelZone);
      SQ.Drag.animateTo(funnel, p.x - funnel.offsetWidth / 2, p.y - funnel.offsetHeight / 2 + 6, 360);
      SQ.Drag.enable(funnel, false);
      play('place');
      if (opts.onFunnel) opts.onFunnel();
      M.tip(ctx, 'كل شيء جاهز! اسحبوا جرة الماء العكر فوق القمع.', true);
      return true;
    }

    function startPour(zone) {
      if (phase !== 'jar' || zone !== pourZone || pouring) return false;
      pouring = true;
      phase = 'pouring';
      SQ.Drag.enable(jar, false);
      const fp = M.stagePoint(funnel);
      jar.classList.add('pouring');
      jar.style.transition = 'transform .6s ease, opacity .5s';
      jar.style.transform = 'rotate(-38deg)';
      play('pourWater');

      if (stream) {
        const sp = M.stagePoint(funnel);
        stream.style.left = (sp.x - 4) + 'px';
        stream.style.top = (sp.y + 78) + 'px';
        stream.style.height = '58px';
        stream.classList.add('flowing');
      }

      let step = 0;
      const totalSteps = 12;
      const tick = () => {
        step++;
        const r = clamp(step / totalSteps, 0, 1);
        M.bits(ctx, {
          x: fp.x + rnd(-14, 14),
          y: fp.y + 62,
          count: 3,
          kind: 'water',
          spread: 12,
          fall: 74,
          dur: 0.55
        });
        play('drip', { delay: rnd(0, 0.08) });
        if (step === 3) {
          funnel.classList.add('wet');
          play('glug');
        }
        if (opts.onPourTick) opts.onPourTick(r);
        if (step >= totalSteps) {
          stream.classList.remove('flowing');
          jar.classList.add('fade-out');
          jar.style.opacity = '0';
          play('waterFill');
          if (opts.onPourDone) opts.onPourDone();
          phase = 'done';
          return;
        }
        setTimeout(tick, 300);
      };
      setTimeout(tick, 300);
      return true;
    }

    M.makeDrag(ctx, paper, {
      type: 'paper',
      canDrag: () => phase === 'paper',
      onDragStart() { play('pickup'); },
      onDrop(zone) {
        if (placePaper(zone)) {
          SQ.Drag.animateTo(paper, M.stagePoint(paperZone).x - paper.offsetWidth / 2, M.stagePoint(paperZone).y - paper.offsetHeight / 2, 260);
          return true;
        }
        if (zone) play('wrong');
        return false;
      }
    });

    M.makeDrag(ctx, funnel, {
      type: 'funnel',
      canDrag: () => phase === 'funnel',
      onDragStart() { play('pickup'); },
      onDrop(zone) {
        if (placeFunnel(zone)) return true;
        if (zone) play('wrong');
        SQ.Drag.animateTo(funnel, funnelHome.x, funnelHome.y, 340);
        return false;
      }
    });

    M.makeDrag(ctx, jar, {
      type: 'jar',
      canDrag: () => phase === 'jar',
      onDragStart() { play('pickup'); },
      onDrop(zone) {
        if (startPour(zone)) return true;
        if (zone) play('wrong');
        return false;
      }
    });

    return {
      get phase() { return phase; },
      autoFill() { if (opts.onPourTick) opts.onPourTick(1); }
    };
  };

  /* ---------------- water stream / liquid helpers ---------------- */
  M.setLiquid = function (flaskEl, ratio) {
    const liquid = flaskEl.querySelector('.liquid');
    if (liquid) {
      liquid.style.transform = `scaleY(${clamp(ratio, 0, 1)})`;
      liquid.style.transformOrigin = '50% 100%';
      liquid.style.transformBox = 'fill-box';
    }
  };

  M.makeStream = function (ctx, x, y, h) {
    const s = M.el('water-stream', x, y, undefined, h);
    M.add(ctx, s);
    return s;
  };

  /* ---------------- mystery container ---------------- */
  M.mystery = function (ctx, opts) {
    const el = M.el('mystery-container', opts.x, opts.y, opts.w || 170, opts.h || 200);
    el.innerHTML = M.mysterySVG();
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', opts.label || 'حاوية غامضة');
    M.add(ctx, el);
    let opened = false;
    function open() {
      if (opened) return;
      opened = true;
      el.classList.add('open');
      play('lid');
      setTimeout(() => play('glug'), 180);
      if (SQ.Music) SQ.Music.jingle('mystery');
      if (SQ.FX) {
        const p = SQ.FX.center(el);
        SQ.FX.burst(p.x, p.y, { count: 18, colors: ['#7cffb2', '#d8ffe9', '#4fe6ff'], speed: 3, gravity: 0.02, size: [2, 5], life: [0.5, 1.1] });
      }
      el.style.animation = 'none';
      if (opts.onOpen) setTimeout(() => opts.onOpen(el), 380);
    }
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    const label = M.el('obj-label');
    label.textContent = opts.label || 'حاوية غامضة';
    label.style.top = '-30px';
    el.appendChild(label);
    return { el, open, get opened() { return opened; } };
  };

  /* ---------------- golden star ---------------- */
  M.goldenStar = function (ctx, opts) {
    const el = M.el('golden-star', opts.x, opts.y, opts.w || 88, opts.h || 88);
    el.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-star"/></svg>';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', opts.label || 'نجمة ذهبية');
    M.add(ctx, el);
    let taken = false;
    function take() {
      if (taken) return;
      taken = true;
      el.style.transition = 'transform .5s cubic-bezier(.2,1.5,.4,1), opacity .5s';
      el.style.transform = 'scale(1.7) translateY(-24px)';
      el.style.opacity = '0';
      play('star');
      play('reward', { delay: 0.12 });
      if (SQ.Music) SQ.Music.jingle('star');
      if (SQ.FX) {
        const p = SQ.FX.center(el);
        SQ.FX.starBurst(p.x, p.y);
        SQ.FX.confetti(36);
      }
      setTimeout(() => el.remove(), 560);
      if (opts.onCollect) opts.onCollect();
    }
    el.addEventListener('click', take);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); take(); }
    });
    return { el, take, get taken() { return taken; } };
  };

  /* ---------------- clue card ---------------- */
  M.clue = function (ctx, opts) {
    const el = M.el('clue-card', opts.x, opts.y, opts.w || 186, undefined);
    el.innerHTML = `<b><svg viewBox="0 0 24 24"><use href="#i-bulb"/></svg>${opts.tag || 'دليل بابلز'}</b>
      <span>${opts.text}</span>
      <span class="clue-mini">${opts.hint || 'اضغط على البطاقة للمتابعة'}</span>`;
    M.add(ctx, el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    play('pop');
    if (SQ.Music) SQ.Music.jingle('mystery');
    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      el.classList.remove('show');
      play('click');
      setTimeout(() => el.remove(), 380);
      if (opts.onClose) setTimeout(opts.onClose, 380);
    }
    el.addEventListener('click', close);
    if (opts.autoClose) {
      if (ctx.timers) ctx.timers.push(setTimeout(close, opts.autoClose));
      else setTimeout(close, opts.autoClose);
    }
    return { el, close, get closed() { return closed; } };
  };

  /* ---------------- clickable hiding spot ---------------- */
  M.hotspot = function (ctx, opts) {
    const el = M.el('hotspot', opts.x, opts.y, opts.w || 74, opts.h || 74);
    el.innerHTML = `<svg viewBox="0 0 24 24"><use href="#i-${opts.icon || 'bulb'}"/></svg>`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', opts.label || 'ابحث هنا');
    if (opts.hint) el.classList.add('hint-spot');
    M.add(ctx, el);
    let used = false;
    function hit(e) {
      if (used) return;
      used = true;
      if (e) e.preventDefault();
      el.classList.add('found');
      play('scan');
      if (SQ.FX) M.flashAt(el, ['#ffd166', '#7cffb2', '#fff']);
      setTimeout(() => {
        el.style.transition = 'opacity .4s, transform .4s';
        el.style.opacity = '0';
        el.style.transform = 'scale(.8)';
        setTimeout(() => el.remove(), 420);
      }, 260);
      if (opts.onFind) setTimeout(opts.onFind, 280);
    }
    el.addEventListener('click', hit);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') hit(e);
    });
    return { el, find: hit, get used() { return used; } };
  };

  /* ---------------- misc ---------------- */
  M.wait = wait;
  SQ.Mechanics = M;
})();
