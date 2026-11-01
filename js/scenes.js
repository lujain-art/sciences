/* =========================================================
   SCIENCE QUEST — cinematic intro, mission map and victory
   ========================================================= */
(function () {
  'use strict';
  const SQ = (window.SQ = window.SQ || {});
  const AR = '٠١٢٣٤٥٦٧٨٩';
  const ar = (n) => String(n).replace(/\d/g, (d) => AR[+d]);
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const play = (name, opts) => { if (SQ.SFX) SQ.SFX.play(name, opts); };
  const STORE_KEY = 'sq-progress-v1';

  /* ---------------- progress ---------------- */
  class ProgressStore {
    constructor() {
      this.done = this._load();
    }

    _load() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed && parsed.done) ? parsed.done : [];
        return Array.from(new Set(list.filter((i) => Number.isInteger(i) && i >= 0 && i < 4))).sort((a, b) => a - b);
      } catch (e) {
        return [];
      }
    }

    _save() {
      try { localStorage.setItem(STORE_KEY, JSON.stringify({ done: this.done })); } catch (e) { /* ignore */ }
    }

    isDone(index) { return this.done.includes(index); }

    count() { return this.done.length; }

    unlocked(index) {
      if (index === 0) return true;
      const defs = SQ.MissionDefs || [];
      for (let i = 0; i < index; i++) {
        if (i >= defs.length || !this.isDone(i)) return false;
      }
      return true;
    }

    nextIndex() {
      const total = (SQ.MissionDefs || []).length;
      for (let i = 0; i < total; i++) {
        if (!this.isDone(i)) return i;
      }
      return -1;
    }

    markDone(index) {
      if (this.isDone(index)) return false;
      this.done.push(index);
      this.done.sort((a, b) => a - b);
      this._save();
      return true;
    }

    reset() {
      this.done = [];
      this._save();
    }
  }

  SQ.Progress = new ProgressStore();

  /* ---------------- scene director ---------------- */
  class SceneDirector {
    constructor() {
      this.app = null;
      this.introToken = 0;
      this.introRunning = false;
      this.finaleToken = 0;
      this.victoryToken = 0;
      this.finaleRunning = false;
      this.completeTimer = null;
      this.bound = false;
    }

    init() {
      if (this.bound) return;
      this.bound = true;
      this.app = $('app');
      this.progress = SQ.Progress;
      if (this.app) this.app.dataset.scene = 'title';
      this.syncMap();
      this.applyLab();
    }

    /* ---------- shared helpers ---------- */
    hideScreens() {
      document.querySelectorAll('.screen').forEach((s) => s.classList.remove('is-active'));
    }

    showScreen(id) {
      const target = $(id);
      if (!target) return;
      this.hideScreens();
      target.classList.add('is-active');
    }

    applyLab() {
      const count = this.progress.count();
      if (SQ.UI) SQ.UI.setLabLight(count);
      if (this.app) {
        this.app.classList.remove('final-dim', 'lights-flicker');
        const allDone = count >= 4;
        this.app.classList.toggle('doors-open', allDone);
        this.app.classList.remove('machine-on');
      }
    }

    /* ---------- intro ---------- */
    async startIntro() {
      const token = ++this.introToken;
      this.introRunning = true;
      const screen = $('screen-intro');
      const chapter = $('intro-chapter');
      const title = $('intro-titlecard');
      const cta = $('intro-cta');
      const flash = $('intro-flash');
      if (!screen || !chapter || !title || !cta) return;

      this.showScreen('screen-intro');
      screen.classList.remove('lit');
      title.classList.remove('show');
      cta.hidden = true;
      chapter.textContent = 'المشهد ١ • المختبر السري';
      if (flash) flash.classList.remove('fire', 'fire-red');

      if (this.app) {
        this.app.dataset.scene = 'intro';
        this.app.classList.add('intro-hide-cast', 'intro-hide-bubbles');
        this.app.classList.remove('lights-flicker', 'final-dim', 'machine-on', 'doors-open', 'doors-open');
      }
      if (SQ.Characters) {
        SQ.Characters.hide('trouble');
        SQ.Characters.hideAllSpeech();
        SQ.Characters.resetLook();
      }
      if (SQ.Dialogue) SQ.Dialogue.cancelAll();
      if (SQ.Music) SQ.Music.play('story', { fade: 1.6, restart: true });

      await sleep(700);
      if (token !== this.introToken) return;

      /* lights come up */
      screen.classList.add('lit');
      play('unlock');
      if (SQ.UI) SQ.UI.flash('rgba(120, 240, 255, .16)');
      if (SQ.FX) {
        SQ.FX.sparkle(window.innerWidth * 0.5, window.innerHeight * 0.34, 1.4);
      }

      await sleep(900);
      if (token !== this.introToken) return;
      chapter.textContent = 'المشهد ٢ • مختبر العلوم';
      title.classList.add('show');

      await sleep(1900);
      if (token !== this.introToken) return;
      title.classList.remove('show');

      await sleep(420);
      if (token !== this.introToken) return;
      chapter.textContent = 'المشهد ٣ • البروفيسور ميكس';
      if (this.app) this.app.classList.remove('intro-hide-cast');
      await this._line(token, 'mix', 'يا علماء! المختبر بحاجة لمساعدتكم!', { minMs: 1300 });
      if (token !== this.introToken) return;

      /* lights flicker */
      chapter.textContent = 'المشهد ٤ • شيء غريب...';
      if (this.app) this.app.classList.add('lights-flicker');
      play('flash');
      await sleep(820);
      if (token !== this.introToken) return;

      /* Trouble sneaks in and mixes */
      if (SQ.Characters) {
        SQ.Characters.show('trouble');
        SQ.Characters.setState('trouble', 'sneak', 5200);
      }
      play('sneak');
      if (this.app) this.app.classList.remove('lights-flicker');
      await this._line(token, 'trouble', 'هاهاها! سأخلط كل المواد... ولن تفصلوها أبدًا!', { minMs: 1100 });
      if (token !== this.introToken) return;

      play('sandPour');
      play('bubble', { delay: 0.18 });
      if (SQ.FX) {
        SQ.FX.burst(window.innerWidth * 0.42, window.innerHeight * 0.62, {
          count: 26,
          colors: ['#ffd166', '#ff9f68', '#c49a63', '#9df5c8', '#4fe6ff'],
          speed: 4.2,
          spread: [Math.PI * 1.05, Math.PI * 1.95],
          gravity: 0.09,
          size: [2, 6],
          shape: 'circle',
          life: [0.6, 1.3]
        });
      }
      if (SQ.Characters) SQ.Characters.setState('trouble', 'happy', 1800);
      await sleep(650);
      if (token !== this.introToken) return;

      /* Bubbles rushes in */
      if (this.app) this.app.classList.remove('intro-hide-bubbles');
      if (SQ.Characters) {
        SQ.Characters.setState('bubbles', 'jump', 1700);
        SQ.Characters.setState('mix', 'surprised', 1600);
      }
      play('boing');
      await this._line(token, 'bubbles', 'بوب! اكتشفت شيئًا غريبًا! المواد اختلطت كلها!', { minMs: 1000 });
      if (token !== this.introToken) return;

      /* emergency call to action */
      chapter.textContent = 'المشهد ٥ • مهمة عاجلة!';
      if (SQ.Characters) {
        SQ.Characters.clearState('trouble');
        SQ.Characters.setState('mix', 'excited', 0);
        SQ.Characters.setState('bubbles', 'happy', 0);
      }
      play('heartbeat');
      if (SQ.Music) SQ.Music.jingle('mystery');
      cta.hidden = false;
      if (SQ.UI) SQ.UI.flash('rgba(255, 209, 102, .12)');

      await this._line(token, 'mix', 'مهمة عاجلة! هل أنتم مستعدون لإنقاذ مختبر العلوم؟', { minMs: 1200 });
    }

    _line(token, who, text, opts) {
      if (token !== this.introToken || !SQ.Dialogue) return Promise.resolve(null);
      return SQ.Dialogue.say(who, text, opts).catch(() => null);
    }

    endIntro() {
      this.introToken++;
      this.introRunning = false;
      if (SQ.Dialogue) SQ.Dialogue.cancelAll();
      if (this.app) this.app.classList.remove('intro-hide-cast', 'intro-hide-bubbles');
      const cta = $('intro-cta');
      const title = $('intro-titlecard');
      if (cta) cta.hidden = true;
      if (title) title.classList.remove('show');
      if (SQ.Characters) {
        SQ.Characters.hide('trouble');
        SQ.Characters.clearState('mix');
        SQ.Characters.clearState('bubbles');
        SQ.Characters.clearState('trouble');
        SQ.Characters.hideAllSpeech();
      }
    }

    skipIntro() {
      this.endIntro();
      if (SQ.Main) SQ.Main.toMap({ skipIntro: true });
    }

    /* ---------- mission map ---------- */
    syncMap(opts = {}) {
      const holder = $('map-nodes');
      if (!holder || !SQ.MissionDefs) return;
      const defs = SQ.MissionDefs;
      const positions = [[73, 26], [27, 26], [27, 71], [73, 71]];
      const count = this.progress.count();
      const next = this.progress.nextIndex();

      holder.innerHTML = defs.map((def, i) => {
        const done = this.progress.isDone(i);
        const unlocked = this.progress.unlocked(i);
        const current = unlocked && !done && i === next;
        const pos = positions[i] || [50, 50];
        const classes = [
          'mission-node',
          done ? 'is-done' : '',
          current ? 'is-current' : '',
          unlocked ? '' : 'is-locked'
        ].filter(Boolean).join(' ');
        const playLabel = done ? 'إعادة' : 'ابدأ';
        return `<button type="button" class="${classes}" style="left:${pos[0]}%;top:${pos[1]}%"
          data-mission="${i}" ${unlocked ? '' : 'disabled aria-disabled="true"'}
          aria-label="${def.title} — ${def.tag}${done ? ' — مكتملة' : unlocked ? '' : ' — مقفلة'}">
          <span class="node-top">
            <span class="node-index">${ar(i + 1)}</span>
            <span class="node-art"><svg><use href="#i-${def.icon || 'star'}"/></svg></span>
          </span>
          <span class="node-tag">${def.tag}</span>
          <b>${def.title}</b>
          <small>${def.subtitle}</small>
          <span class="node-play">${playLabel}<svg><use href="#i-play"/></svg></span>
          <span class="node-star" aria-hidden="true"><svg><use href="#i-star"/></svg></span>
          ${unlocked ? '' : '<span class="node-lock"><svg><use href="#i-lock"/></svg></span>'}
        </button>`;
      }).join('');

      const starCount = $('map-star-count');
      if (starCount) starCount.textContent = `${ar(count)} / ${ar(defs.length)}`;

      const lights = $('lights-label');
      if (lights) {
        const labels = ['خافتة', 'تشتعل', 'تزداد', 'مشرقة', 'مكتملة'];
        lights.textContent = `أنوار المختبر: ${labels[Math.min(count, 4)]}`;
      }

      const sub = $('map-sub');
      if (sub) {
        const texts = [
          'المختبر مظلم... أنجزوا المهمة الأولى لتشعّ الأنوار.',
          'أشعلتم أول ضوء! المهمة الثانية مفتوحة الآن.',
          'المختبر يزداد إشراقًا! واصلوا المغامرة.',
          'بقي ضوء واحد! المهمة الأخيرة تنتظركم.',
          'المختبر مشرق بالكامل! أنتم مستكشفو العلوم الماسترز.'
        ];
        sub.textContent = texts[Math.min(count, 4)];
      }

      const dots = $('map-progress-dots');
      if (dots) {
        dots.innerHTML = defs.map((_, i) => `<i class="${this.progress.isDone(i) ? 'done' : ''}"></i>`).join('');
      }

      if (typeof opts.highlight === 'number' && opts.highlight >= 0) {
        const target = holder.querySelector(`[data-mission="${opts.highlight}"]`);
        if (target) {
          target.classList.add('just-open');
          setTimeout(() => target.classList.remove('just-open'), 3800);
        }
      }

      this.applyLab();
    }

    /* ---------- completion overlay ---------- */
    showComplete(def, index) {
      const isNew = this.progress.markDone(index);
      this.syncMap();
      const overlay = $('overlay-complete');
      const card = overlay ? overlay.querySelector('.complete-card') : null;
      if (!overlay || !card) return;
      clearTimeout(this.completeTimer);

      const chip = $('complete-chip');
      const title = $('complete-title');
      const text = $('complete-text');
      const learn = $('complete-learn');
      if (chip) chip.textContent = isNew ? `${def.chip} مكتملة` : `${def.chip} — إعادة`;
      if (title) title.textContent = def.completeTitle || 'أحسنتم!';
      if (text) text.textContent = def.completeText || '';
      if (learn) learn.textContent = def.learn || '';

      const nextBtn = $('complete-next');
      if (nextBtn) {
        const last = index >= (SQ.MissionDefs || []).length - 2;
        nextBtn.innerHTML = `<span>${last ? 'المهمة الأخيرة' : 'المهمة التالية'}</span><svg class="btn-icon"><use href="#i-${last ? 'rocket' : 'play'}"/></svg>`;
      }

      card.classList.remove('celebrate');
      void card.offsetWidth;
      overlay.hidden = false;
      card.classList.add('celebrate');
      this.completeIndex = index;

      this.completeTimer = setTimeout(() => {
        if (overlay.hidden) return;
        const star = $('complete-star');
        if (star && SQ.FX) {
          const r = star.getBoundingClientRect();
          SQ.FX.starBurst(r.left + r.width / 2, r.top + r.height / 2);
          SQ.FX.confetti(60);
        }
      }, 420);
    }

    hideComplete() {
      clearTimeout(this.completeTimer);
      const overlay = $('overlay-complete');
      if (!overlay) return;
      overlay.hidden = true;
      const card = overlay.querySelector('.complete-card');
      if (card) card.classList.remove('celebrate');
    }

    /* ---------- final climax ---------- */
    async finale(ctx) {
      if (this.finaleRunning) return;
      this.finaleRunning = true;
      const token = ++this.finaleToken;
      this.progress.markDone(3);
      this.syncMap();

      const app = this.app;
      if (app) {
        app.classList.add('machine-on');
        app.classList.remove('final-dim');
      }
      play('flash');
      play('machineStart', { delay: 0.15 });
      if (SQ.UI) {
        SQ.UI.setLabLight(4);
        SQ.UI.flash('rgba(120, 240, 255, .22)');
      }

      setTimeout(() => {
        if (token !== this.finaleToken) return;
        if (app) app.classList.add('doors-open');
        play('door');
        if (SQ.FX) {
          SQ.FX.confetti(70);
          SQ.FX.starBurst(window.innerWidth * 0.5, window.innerHeight * 0.32);
        }
      }, 800);

      await sleep(1500);
      if (token !== this.finaleToken) return;

      if (SQ.Characters) {
        SQ.Characters.setState('mix', 'happy', 0);
        SQ.Characters.setState('bubbles', 'excited', 0);
      }
      await this._finaleLine(token, 'mix', 'رائع! لقد اكتشفتم السر! المغناطيس والغربال والترشيح أنقذت المختبر!', { minMs: 1400 });
      if (token !== this.finaleToken) return;

      await this._finaleLine(token, 'bubbles', 'ما شاء الله! أنتم علماء حقيقيون!', { minMs: 1000 });
      if (token !== this.finaleToken) return;

      if (SQ.Characters) {
        SQ.Characters.show('trouble');
        SQ.Characters.setState('trouble', 'surprised', 2000);
      }
      play('boing');
      await this._finaleLine(token, 'trouble', 'ماذا؟! كيف نجحتم في ذلك؟!', { minMs: 1100 });
      if (token !== this.finaleToken) return;

      if (SQ.Characters) SQ.Characters.setState('trouble', 'defeated', 6000);
      play('giggle');
      await this._finaleLine(token, 'mix', 'لقد أنقذتم مختبر العلوم! أنتم أبطال الفصل!', { minMs: 1200 });
      if (token !== this.finaleToken) return;

      if (SQ.Music) {
        SQ.Music.play('victory', { fade: 1.4, restart: true });
        SQ.Music.jingle('star');
      }
      play('reward');
      await sleep(650);
      if (token !== this.finaleToken) return;
      this.showVictory();
      this.finaleRunning = false;
      if (ctx) ctx.flags.finaleDone = true;
    }

    _finaleLine(token, who, text, opts) {
      if (token !== this.finaleToken || !SQ.Dialogue) return Promise.resolve(null);
      return SQ.Dialogue.say(who, text, opts).catch(() => null);
    }

    showVictory() {
      const token = ++this.victoryToken;
      this.hideScreens();
      const screen = $('screen-victory');
      if (screen) screen.classList.add('is-active');
      if (this.app) {
        this.app.dataset.scene = 'victory';
        this.app.classList.add('machine-on', 'doors-open');
        this.app.classList.remove('final-dim', 'lights-flicker');
      }
      if (SQ.UI) SQ.UI.setLabLight(4);
      if (SQ.Characters) {
        SQ.Characters.show('trouble');
        SQ.Characters.setState('mix', 'excited', 0);
        SQ.Characters.setState('bubbles', 'happy', 0);
        SQ.Characters.setState('trouble', 'defeated', 9000);
      }
      if (SQ.Music) SQ.Music.play('victory', { fade: 1.2, restart: true });

      const holder = $('victory-particles');
      if (holder) {
        holder.innerHTML = Array.from({ length: 22 }, (_, i) => {
          const left = 6 + ((i * 41) % 88);
          const delay = ((i * 0.37) % 3.4).toFixed(2);
          const dur = (2.8 + ((i * 0.53) % 2.6)).toFixed(2);
          const size = 4 + (i % 4) * 2;
          const color = ['#ffd166', '#4fe6ff', '#ff7aa8', '#9df5c8'][i % 4];
          return `<span style="left:${left}%;width:${size}px;height:${size}px;background:${color};animation-delay:${delay}s;animation-duration:${dur}s"></span>`;
        }).join('');
      }

      const bursts = [0, 900, 1900, 3100];
      bursts.forEach((delay) => {
        setTimeout(() => {
          if (token !== this.victoryToken || !this.app || this.app.dataset.scene !== 'victory') return;
          if (SQ.FX) {
            SQ.FX.confetti(56);
            SQ.FX.starBurst(
              window.innerWidth * (0.3 + Math.random() * 0.4),
              window.innerHeight * (0.18 + Math.random() * 0.3)
            );
          }
        }, delay);
      });
    }

    resetProgress() {
      this.progress.reset();
      this.syncMap();
      this.hideComplete();
      const app = this.app;
      if (app) app.classList.remove('machine-on', 'doors-open', 'final-dim', 'lights-flicker');
      if (SQ.UI) SQ.UI.setLabLight(0);
    }
  }

  SQ.Scenes = new SceneDirector();
})();
