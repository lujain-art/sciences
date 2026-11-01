/* =========================================================
   SCIENCE QUEST — bootstrap, routing and audio settings
   ========================================================= */
(function () {
  'use strict';
  const SQ = (window.SQ = window.SQ || {});
  const AR = '٠١٢٣٤٥٦٧٨٩';
  const ar = (n) => String(n).replace(/\d/g, (d) => AR[+d]);
  const $ = (id) => document.getElementById(id);
  const play = (name, opts) => { if (SQ.SFX) SQ.SFX.play(name, opts); };

  const Main = {
    app: null,
    audioPromise: null,
    voiceStatus: '',
    voiceWarn: false,
    noteOverride: null,
    testBusy: false,
    hasStarted: false,

    init() {
      this.app = $('app');
      if (SQ.FX) SQ.FX.init();
      if (SQ.UI) SQ.UI.init();
      if (SQ.Characters) SQ.Characters.mount();
      if (SQ.Scenes) SQ.Scenes.init();
      const stage = $('stage');
      if (stage && SQ.Drag) SQ.Drag.init(stage);

      if (SQ.Missions) {
        SQ.Missions.onComplete = (def, index) => {
          if (SQ.Scenes) SQ.Scenes.showComplete(def, index);
        };
      }
      this.bindAudioUI();
      this.bindActions();
      this.bindMap();
      this.bindPointer();
      this.bindKeyboard();
      this.bindResize();
      this.syncAudioUI(SQ.Audio.settings);

      if (SQ.Voice) {
        SQ.Voice.onStatus((text, warn) => {
          this.voiceStatus = text;
          this.voiceWarn = !!warn;
          this.updateAudioNote();
        });
        SQ.Voice.init().catch((e) => console.warn('Voice init failed', e));
      }

      this.armFirstGesture();
      this.updateAudioNote();

      window.addEventListener('error', (event) => {
        if (event && event.message) this.showFatal(event.message);
      });
    },

    /* ---------- audio boot ---------- */
    armFirstGesture() {
      const once = () => {
        window.removeEventListener('pointerdown', once, true);
        this.ensureAudio();
      };
      window.addEventListener('pointerdown', once, { capture: true, once: true });
    },

    ensureAudio() {
      if (!this.audioPromise) {
        this.audioPromise = SQ.Audio.unlock()
          .then((ok) => {
            if (ok && SQ.Music && this.app && this.app.dataset.scene === 'title') {
              SQ.Music.play('menu', { fade: 1.1 });
            }
            this.updateAudioNote();
            this.syncAudioUI(SQ.Audio.settings);
            return ok;
          })
          .catch(() => {
            this.updateAudioNote();
            return false;
          });
      }
      return this.audioPromise;
    },

    /* ---------- routing ---------- */
    toTitle() {
      if (SQ.Scenes) {
        SQ.Scenes.endIntro();
        SQ.Scenes.hideComplete();
        SQ.Scenes.showScreen('screen-title');
      }
      if (SQ.Missions) SQ.Missions.stop();
      if (this.app) this.app.dataset.scene = 'title';
      this.clearStageStates();
      if (SQ.UI) SQ.UI.setLabLight(SQ.Progress ? SQ.Progress.count() : 0);
      if (SQ.Music && SQ.Audio.ready) SQ.Music.play('menu', { fade: 0.8 });
      if (SQ.Characters) SQ.Characters.resetLook();
    },

    toIntro() {
      if (SQ.Missions) SQ.Missions.stop();
      if (SQ.Scenes) {
        SQ.Scenes.hideComplete();
        SQ.Scenes.startIntro();
      }
      this.clearStageStates();
      if (SQ.Characters) SQ.Characters.resetLook();
    },

    toMap(opts = {}) {
      if (SQ.Missions) SQ.Missions.stop();
      if (SQ.Scenes) {
        SQ.Scenes.endIntro();
        SQ.Scenes.hideComplete();
        SQ.Scenes.showScreen('screen-map');
        if (this.app) this.app.dataset.scene = 'map';
        SQ.Scenes.syncMap(opts);
      }
      this.clearStageStates();
      if (SQ.Music && SQ.Audio.ready) SQ.Music.play('menu', { fade: 1.1 });
      if (SQ.Characters) {
        SQ.Characters.resetLook();
        SQ.Characters.hideAllSpeech();
      }
      if (opts.skipIntro && SQ.UI) {
        SQ.UI.toast('تخطّيتم المقدمة. الخريطة جاهزة!', { icon: 'map', time: 3200 });
      } else if (typeof opts.highlight === 'number' && opts.highlight >= 0 && SQ.UI) {
        SQ.UI.toast(`المهمة ${ar(opts.highlight + 1)} مفتوحة الآن!`, { icon: 'unlock', time: 2600 });
      }
    },

    startMission(index) {
      const defs = SQ.MissionDefs || [];
      const def = defs[index];
      if (!def) return;
      if (SQ.Progress && !SQ.Progress.unlocked(index)) {
        play('error');
        if (SQ.UI) SQ.UI.toast('أكملوا المهمة السابقة أولًا لتفتحوا هذه المهمة.', { icon: 'lock', time: 3200 });
        return;
      }
      if (SQ.Scenes) {
        SQ.Scenes.endIntro();
        SQ.Scenes.hideComplete();
        SQ.Scenes.showScreen('screen-mission');
      }
      if (this.app) {
        this.app.dataset.scene = 'mission';
        this.clearStageStates();
      }
      if (SQ.UI) SQ.UI.setLabLight(SQ.Progress ? SQ.Progress.count() : 0);
      if (SQ.Characters) {
        SQ.Characters.resetLook();
        SQ.Characters.hideAllSpeech();
      }
      if (SQ.Missions) SQ.Missions.start(index);
      requestAnimationFrame(() => {
        if (SQ.fitStage) SQ.fitStage();
        requestAnimationFrame(() => { if (SQ.fitStage) SQ.fitStage(); });
      });
    },

    nextMission() {
      const current = SQ.Scenes ? SQ.Scenes.completeIndex : -1;
      if (SQ.Scenes) SQ.Scenes.hideComplete();
      const next = SQ.Progress ? SQ.Progress.nextIndex() : -1;
      if (next >= 0) {
        play('unlock');
        this.toMap({ highlight: next });
      } else {
        this.toMap({});
        if (SQ.UI) SQ.UI.toast('كل المهام مكتملة! أنتم مستكشفو العلوم الماسترز.', { icon: 'star', time: 4200 });
      }
      if (SQ.Scenes && typeof current === 'number' && current >= 0 && SQ.Progress && SQ.Progress.count() >= 4) {
        if (SQ.UI) SQ.UI.toast('أعدتم مهمة مكتملة. النجوم محفوظة!', { icon: 'check', time: 3000 });
      }
    },

    clearStageStates() {
      if (!this.app) return;
      this.app.classList.remove('final-dim', 'lights-flicker');
      if (!SQ.Scenes || !SQ.Scenes.progress || SQ.Scenes.progress.count() < 4) {
        this.app.classList.remove('machine-on', 'doors-open');
      }
    },

    /* ---------- actions ---------- */
    bindActions() {
      document.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action]');
        if (actionEl && !actionEl.disabled) {
          event.preventDefault();
          this.handleAction(actionEl.dataset.action, actionEl);
          return;
        }
        const toggle = event.target.closest('[data-toggle]');
        if (toggle) {
          event.preventDefault();
          this.handleToggle(toggle);
        }
      });

      const backdrop = $('settings-backdrop');
      if (backdrop) backdrop.addEventListener('click', () => this.closeSettings());

      document.addEventListener('pointerdown', (event) => {
        const btn = event.target.closest('button');
        if (btn && !btn.disabled && !btn.dataset.silent) play('click');
      }, { capture: true, passive: true });
    },

    handleAction(action, el) {
      switch (action) {
        case 'start-adventure':
          this.startAdventure(el);
          break;
        case 'skip-intro':
          if (SQ.Scenes) SQ.Scenes.skipIntro();
          break;
        case 'enter-game':
          if (SQ.Scenes) SQ.Scenes.endIntro();
          this.hasStarted = true;
          this.toMap({
            highlight: SQ.Progress && SQ.Progress.count() === 0 ? 0 : undefined,
            silent: true
          });
          if (SQ.Audio.ready) play('whoosh');
          break;
        case 'to-map':
          this.leaveMission();
          break;
        case 'hint':
          if (SQ.Missions) SQ.Missions.hint();
          break;
        case 'next-mission':
          this.nextMission();
          break;
        case 'replay-intro':
          this.toIntro();
          break;
        case 'victory-map':
          this.toMap({});
          break;
        case 'replay-game':
          this.replayGame();
          break;
        case 'open-settings':
          this.openSettings();
          break;
        case 'close-settings':
          this.closeSettings();
          break;
        case 'toggle-mute':
          this.toggleMute();
          break;
        case 'test-audio':
          this.testAudio(el);
          break;
        case 'reset-progress':
          this.resetProgress();
          break;
        default:
          break;
      }
    },

    async startAdventure(button) {
      if (button) button.disabled = true;
      await this.ensureAudio();
      if (SQ.Audio.ready) play('whoosh');
      this.hasStarted = true;
      this.toIntro();
      if (button) button.disabled = false;
    },

    leaveMission() {
      const missionLive = SQ.Missions && SQ.Missions.current && !SQ.Missions.current.flags.finished;
      if (missionLive) {
        const ok = window.confirm('العودة إلى الخريطة ستوقف هذه المهمة. هل تريدون المتابعة؟');
        if (!ok) return;
      }
      this.toMap({});
    },

    replayGame() {
      const ok = window.confirm('هل تريدون بدء المغامرة من جديد؟ ستُعاد كل النجوم والمهام.');
      if (!ok) return;
      if (SQ.Scenes) SQ.Scenes.resetProgress();
      if (SQ.Missions) SQ.Missions.stop();
      if (SQ.UI) {
        SQ.UI.setLabLight(0);
        SQ.UI.toast('بدأت مغامرة جديدة!', { icon: 'replay', time: 2600 });
      }
      this.toTitle();
    },

    resetProgress() {
      const ok = window.confirm('هل تريدون إعادة ضبط تقدّم المهام والنجوم؟');
      if (!ok) return;
      if (SQ.Scenes) SQ.Scenes.resetProgress();
      if (SQ.Missions) SQ.Missions.stop();
      if (this.app && this.app.dataset.scene === 'title') {
        if (SQ.UI) SQ.UI.toast('أُعيد ضبط التقدّم. اضغطوا «ابدأ المغامرة».', { icon: 'replay', time: 3200 });
        return;
      }
      this.toMap({});
      if (SQ.UI) SQ.UI.toast('أُعيد ضبط التقدّم. المهمة الأولى جاهزة.', { icon: 'replay', time: 3200 });
    },

    /* ---------- map ---------- */
    bindMap() {
      const holder = $('map-nodes');
      if (!holder) return;
      holder.addEventListener('click', (event) => {
        const node = event.target.closest('[data-mission]');
        if (!node || node.disabled) return;
        this.startMission(Number(node.dataset.mission));
      });
      holder.addEventListener('pointerover', (event) => {
        if (event.target.closest('.mission-node:not(.is-locked)')) play('hover');
      }, { passive: true });
    },

    /* ---------- settings ---------- */
    openSettings() {
      const panel = $('settings');
      const backdrop = $('settings-backdrop');
      if (!panel || !backdrop) return;
      backdrop.hidden = false;
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => backdrop.classList.add('open'));
      this.syncAudioUI(SQ.Audio.settings);
      this.updateAudioNote();
    },

    closeSettings() {
      const panel = $('settings');
      const backdrop = $('settings-backdrop');
      if (!panel || !backdrop) return;
      if (panel.contains(document.activeElement)) {
        const opener = document.querySelector('[data-action="open-settings"]');
        if (opener) opener.focus({ preventScroll: true });
        else if (document.activeElement) document.activeElement.blur();
      }
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('open');
      setTimeout(() => {
        if (!panel.classList.contains('open')) backdrop.hidden = true;
      }, 360);
    },

    toggleMute() {
      SQ.Audio.toggle('muted');
      if (!SQ.Audio.settings.muted) play('click');
      this.syncAudioUI(SQ.Audio.settings);
    },

    handleToggle(el) {
      const key = el.dataset.toggle;
      if (!key) return;
      SQ.Audio.toggle(key);
      this.syncAudioUI(SQ.Audio.settings);
      if (key === 'musicOn' && SQ.Audio.settings.musicOn && SQ.Audio.ready) {
        const track = this.app && this.app.dataset.scene === 'mission'
          ? ((SQ.Missions && SQ.Missions.current && SQ.Missions.current.def.music) || 'mission')
          : 'menu';
        SQ.Music.play(track, { fade: 0.8 });
      }
    },

    syncAudioUI(settings) {
      const s = settings || SQ.Audio.settings;
      document.querySelectorAll('[data-audio]').forEach((input) => {
        const key = input.dataset.audio;
        const value = Number(s[key]);
        if (document.activeElement !== input) input.value = String(value);
        input.style.setProperty('--pct', `${value}%`);
        const out = $('out-' + key);
        if (out) out.textContent = `${ar(value)}%`;
      });
      document.querySelectorAll('[data-toggle]').forEach((el) => {
        const key = el.dataset.toggle;
        el.setAttribute('aria-checked', String(!!s[key]));
      });
      const mute = $('mute-btn');
      if (mute) {
        mute.classList.toggle('is-off', !!s.muted);
        mute.setAttribute('aria-pressed', String(!!s.muted));
        const use = mute.querySelector('use');
        if (use) use.setAttribute('href', s.muted ? '#i-muted' : '#i-volume');
      }
      this.updateAudioNote();
    },

    bindAudioUI() {
      document.querySelectorAll('[data-audio]').forEach((input) => {
        input.addEventListener('input', () => {
          const key = input.dataset.audio;
          const value = Number(input.value);
          input.style.setProperty('--pct', `${value}%`);
          SQ.Audio.setSetting(key, value, 0.06);
          const out = $('out-' + key);
          if (out) out.textContent = `${ar(value)}%`;
        });
        input.addEventListener('change', () => play('tick'));
      });
      SQ.Audio.onChange((settings) => this.syncAudioUI(settings));
    },

    updateAudioNote() {
      const note = $('audio-note');
      if (!note) return;
      let text = '';
      let warn = false;
      if (this.noteOverride && Date.now() < this.noteOverride.until) {
        text = this.noteOverride.text;
        warn = !!this.noteOverride.warn;
      } else if (!SQ.Audio._supported) {
        text = 'المتصفح لا يدعم الصوت. اللعبة تعمل كاملة، وكل الحوارات مكتوبة في الفقاعات.';
        warn = true;
      } else if (!SQ.Audio.unlocked) {
        text = 'الصوت متوقف مؤقتًا بسياسة المتصفح. اضغطوا «ابدأ المغامرة» أو أي زر لتشغيل الموسيقى والمؤثرات.';
        warn = true;
      } else {
        text = this.voiceStatus || 'جارٍ فحص أصوات الشخصيات...';
        warn = this.voiceWarn;
        if (SQ.Audio.settings.muted) {
          text += ' الصوت مكتوم الآن.';
          warn = false;
        }
        if (!SQ.Audio.settings.musicOn) {
          text += ' الموسيقى متوقفة.';
        }
      }
      note.textContent = text;
      note.classList.toggle('warn', warn);
    },

    flashNote(text, ms = 4200, warn = false) {
      this.noteOverride = { text, until: Date.now() + ms, warn };
      this.updateAudioNote();
      setTimeout(() => {
        if (this.noteOverride && Date.now() >= this.noteOverride.until) {
          this.noteOverride = null;
          this.updateAudioNote();
        }
      }, ms + 80);
    },

    async testAudio(button) {
      if (this.testBusy) return;
      this.testBusy = true;
      if (button) button.disabled = true;
      await this.ensureAudio();
      if (!SQ.Audio.ready) {
        this.flashNote('تعذّر تشغيل الصوت في هذا المتصفح. كل الحوارات ما زالت مكتوبة على الشاشة.', 6000, true);
        if (button) button.disabled = false;
        this.testBusy = false;
        return;
      }
      play('reward');
      play('star', { delay: 0.18 });
      if (SQ.Music) SQ.Music.jingle('success');
      this.flashNote('تم اختبار الصوت: نغمة نجاح + مؤثرات + صوت البروفيسور ميكس.', 7000, false);
      if (SQ.Dialogue) {
        await SQ.Dialogue.say('mix', 'اختبار الصوت ناجح! هل تسمعون الموسيقى والمؤثرات؟', { minMs: 1400 }).catch(() => null);
      }
      if (button) button.disabled = false;
      this.testBusy = false;
      this.updateAudioNote();
    },

    /* ---------- pointer / keyboard ---------- */
    bindPointer() {
      let raf = 0;
      let lastX = 0;
      let lastY = 0;
      window.addEventListener('pointermove', (event) => {
        lastX = event.clientX;
        lastY = event.clientY;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const scene = this.app && this.app.dataset.scene;
          if (!SQ.Characters || scene === 'title') return;
          SQ.Characters.lookAt(lastX, lastY);
        });
      }, { passive: true });
    },

    bindKeyboard() {
      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const panel = $('settings');
        if (panel && panel.classList.contains('open')) {
          event.preventDefault();
          this.closeSettings();
        }
      });
    },

    bindResize() {
      let timer = 0;
      const fit = () => {
        if (SQ.fitStage) SQ.fitStage();
      };
      window.addEventListener('resize', () => {
        clearTimeout(timer);
        timer = setTimeout(fit, 60);
      });
      window.addEventListener('orientationchange', () => setTimeout(fit, 180));
    },

    /* ---------- fatal ---------- */
    showFatal(message) {
      const box = $('fatal');
      const msg = $('fatal-msg');
      if (!box || !box.hidden) return;
      box.hidden = false;
      if (msg) msg.textContent = message || 'حدث خطأ غير متوقع.';
    }
  };

  SQ.Main = Main;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Main.init());
  } else {
    Main.init();
  }
})();
