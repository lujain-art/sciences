/* =========================================================
   SCIENCE QUEST — cast: Professor Mix, Bubbles, Trouble
   Hand-drawn SVG characters + expression controller + dialogue
   ========================================================= */
(function () {
  'use strict';
  const SQ = (window.SQ = window.SQ || {});
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const MIX_SVG = `
<svg class="char-svg" viewBox="0 0 320 460" aria-hidden="true">
  <defs>
    <linearGradient id="sq-coat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef4ff"/><stop offset="1" stop-color="#c6d5f2"/>
    </linearGradient>
    <linearGradient id="sq-skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffdabb"/><stop offset="1" stop-color="#f0b489"/>
    </linearGradient>
    <radialGradient id="sq-lens" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".55"/>
      <stop offset="1" stop-color="#9fe9ff" stop-opacity=".12"/>
    </radialGradient>
  </defs>
  <ellipse cx="160" cy="444" rx="98" ry="14" fill="#02040c" opacity=".45"/>
  <g class="char-inner">
    <path d="M112 350h44v80q0 12-12 12h-20q-12 0-12-12z" fill="#2e3d68" stroke="#141c36" stroke-width="6" stroke-linejoin="round"/>
    <path d="M164 350h44v80q0 12-12 12h-20q-12 0-12-12z" fill="#26325a" stroke="#141c36" stroke-width="6" stroke-linejoin="round"/>
    <path d="M98 424q-6 22 18 22h38q10 0 10-10v-14z" fill="#151c36" stroke="#0c1124" stroke-width="5" stroke-linejoin="round"/>
    <path d="M222 424q6 22-18 22h-38q-10 0-10-10v-14z" fill="#111730" stroke="#0c1124" stroke-width="5" stroke-linejoin="round"/>

    <path d="M160 138c-58 0-76 36-82 82l-12 134c-1 16 7 24 22 24h144c15 0 23-8 22-24l-12-134c-6-46-24-82-82-82z" fill="url(#sq-coat)" stroke="#202c4e" stroke-width="7" stroke-linejoin="round"/>
    <path d="M160 144c-20 0-33 12-40 30l-10 200h24l6-196z" fill="#ffffff" opacity=".5"/>
    <path d="M160 146l-30 42 30 36 30-36z" fill="#28c7bd" stroke="#1a7c76" stroke-width="3"/>
    <path d="M160 178l-9 42 9 18 9-18z" fill="#ffce56" stroke="#c98f1b" stroke-width="3"/>
    <path d="M96 300h46v42H96z" fill="#dbe6ff" stroke="#b4c4e6" stroke-width="3"/>
    <rect x="103" y="282" width="9" height="26" rx="4.5" fill="#ff8a5c"/>
    <rect x="117" y="276" width="9" height="32" rx="4.5" fill="#4fe6ff"/>
    <rect x="131" y="286" width="9" height="22" rx="4.5" fill="#ffd166"/>

    <g class="arm arm-l">
      <path d="M94 206q-36 28-32 76 2 12 16 12 12 0 12-14 2-32 26-48z" fill="url(#sq-coat)" stroke="#202c4e" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="76" cy="292" r="16" fill="url(#sq-skin)" stroke="#202c4e" stroke-width="6"/>
    </g>
    <g class="arm arm-r">
      <path d="M226 204q48-6 62-48 5-14 19-8 13 7 3 23-12 44-64 63z" fill="url(#sq-coat)" stroke="#202c4e" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="295" cy="150" r="17" fill="url(#sq-skin)" stroke="#202c4e" stroke-width="6"/>
      <path d="M287 138q6-9 15-7" stroke="#e2a377" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>

    <g transform="translate(160 108)">
    <g class="head">
      <circle cx="-44" cy="-56" r="19" fill="#e7ecf6" stroke="#202c4e" stroke-width="6"/>
      <circle cx="-14" cy="-70" r="21" fill="#eef3fb" stroke="#202c4e" stroke-width="6"/>
      <circle cx="20" cy="-68" r="20" fill="#e7ecf6" stroke="#202c4e" stroke-width="6"/>
      <circle cx="50" cy="-48" r="17" fill="#eef3fb" stroke="#202c4e" stroke-width="6"/>
      <path d="M-64 20c-2-44 22-74 64-74s66 30 64 74" fill="#e7ecf6" stroke="#202c4e" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="-60" cy="10" r="16" fill="#f6c9a4" stroke="#202c4e" stroke-width="6"/>
      <circle cx="60" cy="10" r="16" fill="#f6c9a4" stroke="#202c4e" stroke-width="6"/>
      <path d="M-54-12c0-36 22-58 54-58s54 22 54 58v18c0 38-24 62-54 68-30-6-54-30-54-68z" fill="url(#sq-skin)" stroke="#202c4e" stroke-width="7" stroke-linejoin="round"/>

      <ellipse cx="-38" cy="24" rx="13" ry="8" fill="#f2937f" opacity=".45"/>
      <ellipse cx="38" cy="24" rx="13" ry="8" fill="#f2937f" opacity=".45"/>

      <path d="M-42-36q15-9 30-3" stroke="#c3cad9" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M12-39q15-6 30 3" stroke="#c3cad9" stroke-width="8" stroke-linecap="round" fill="none"/>

      <circle cx="-25" cy="-8" r="22" fill="url(#sq-lens)" stroke="#262049" stroke-width="6"/>
      <circle cx="25" cy="-8" r="22" fill="url(#sq-lens)" stroke="#262049" stroke-width="6"/>
      <path d="M-3-8h6" stroke="#262049" stroke-width="5" stroke-linecap="round"/>
      <path d="M-47-10l-12-4M47-10l12-4" stroke="#262049" stroke-width="5" stroke-linecap="round"/>

      <g class="eye" data-eye="l">
        <circle cx="-25" cy="-8" r="11.5" fill="#ffffff"/>
        <g class="pupil"><circle cx="-25" cy="-8" r="6" fill="#2a2350"/><circle cx="-22.6" cy="-10.4" r="2" fill="#ffffff"/></g>
      </g>
      <g class="eye" data-eye="r">
        <circle cx="25" cy="-8" r="11.5" fill="#ffffff"/>
        <g class="pupil"><circle cx="25" cy="-8" r="6" fill="#2a2350"/><circle cx="27.4" cy="-10.4" r="2" fill="#ffffff"/></g>
      </g>

      <ellipse cx="0" cy="16" rx="11" ry="13" fill="#e8a97f" stroke="#d59468" stroke-width="2"/>
      <path d="M-34 32c9-13 23-13 34-4 11-9 25-9 34 4-8 15-24 19-34 12-10 7-26 3-34-12z" fill="#dfe5f1" stroke="#202c4e" stroke-width="6" stroke-linejoin="round"/>
      <g transform="translate(0 50)">
        <g class="mouth">
          <path d="M-15 0q15 17 30 0-15 9-30 0z" fill="#6e2438"/>
          <path d="M-9 2q9 7 18 0z" fill="#ff8fa3" opacity=".7"/>
        </g>
      </g>
    </g>
    </g>
  </g>
</svg>`;

  const BUBBLES_SVG = `
<svg class="char-svg" viewBox="0 0 300 360" aria-hidden="true">
  <defs>
    <radialGradient id="bub-body" cx=".36" cy=".3" r=".78">
      <stop offset="0" stop-color="#e9ffff" stop-opacity=".95"/>
      <stop offset=".42" stop-color="#8bf1ff" stop-opacity=".62"/>
      <stop offset=".8" stop-color="#37b7e8" stop-opacity=".4"/>
      <stop offset="1" stop-color="#1a6fc4" stop-opacity=".36"/>
    </radialGradient>
    <radialGradient id="bub-glow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#7ff0ff" stop-opacity=".45"/>
      <stop offset="1" stop-color="#7ff0ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="150" cy="338" rx="66" ry="9" fill="#02040c" opacity=".3"/>
  <circle cx="150" cy="168" r="128" fill="url(#bub-glow)"/>
  <g class="bubble-float">
    <circle cx="52" cy="234" r="11" fill="#8ff4ff" opacity=".35" stroke="#aef8ff" stroke-width="2"/>
    <circle cx="248" cy="104" r="8" fill="#8ff4ff" opacity=".3" stroke="#aef8ff" stroke-width="2"/>
    <circle cx="236" cy="250" r="6" fill="#8ff4ff" opacity=".28"/>
    <circle cx="46" cy="112" r="5" fill="#8ff4ff" opacity=".28"/>

    <path d="M72 196q-30 12-26 40 2 10 12 8 9-2 7-12-2-14 16-22z" fill="#a9f6ff" opacity=".72" stroke="#4fd8f0" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="55" cy="246" r="11" fill="#b8faff" stroke="#4fd8f0" stroke-width="4"/>
    <path d="M228 196q30 12 26 40-2 10-12 8-9-2-7-12 2-14-16-22z" fill="#a9f6ff" opacity=".72" stroke="#4fd8f0" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="245" cy="246" r="11" fill="#b8faff" stroke="#4fd8f0" stroke-width="4"/>

    <circle cx="150" cy="162" r="96" fill="url(#bub-body)" stroke="#7ff0ff" stroke-width="5"/>
    <ellipse cx="112" cy="120" rx="38" ry="21" fill="#ffffff" opacity=".55" transform="rotate(-30 112 120)"/>
    <circle cx="196" cy="214" r="9" fill="#ffffff" opacity=".3"/>
    <path d="M74 206q76 54 152 0" fill="none" stroke="#ffffff" stroke-width="4" opacity=".18" stroke-linecap="round"/>

    <g class="eye" data-eye="l">
      <ellipse cx="120" cy="152" rx="20" ry="24" fill="#ffffff" stroke="#145a78" stroke-width="3.5"/>
      <g class="pupil"><ellipse cx="123" cy="155" rx="9.5" ry="11" fill="#12364e"/><circle cx="126" cy="150" r="3.2" fill="#fff"/></g>
    </g>
    <g class="eye" data-eye="r">
      <ellipse cx="180" cy="152" rx="20" ry="24" fill="#ffffff" stroke="#145a78" stroke-width="3.5"/>
      <g class="pupil"><ellipse cx="183" cy="155" rx="9.5" ry="11" fill="#12364e"/><circle cx="186" cy="150" r="3.2" fill="#fff"/></g>
    </g>
    <ellipse cx="98" cy="188" rx="12" ry="7" fill="#ff9fc4" opacity=".55"/>
    <ellipse cx="202" cy="188" rx="12" ry="7" fill="#ff9fc4" opacity=".55"/>
    <g class="mouth">
      <path d="M118 186q32 30 64 0-32 16-64 0z" fill="#134a63" stroke="#0d3446" stroke-width="3" stroke-linejoin="round"/>
      <path d="M136 194q14 12 28 0-14 7-28 0z" fill="#ff8fb0"/>
    </g>
    <circle cx="74" cy="148" r="3" fill="#fff" opacity=".8"/>
    <path d="M238 176l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#d8fbff" opacity=".9"/>
    <path d="M60 268l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#d8fbff" opacity=".7"/>
    <circle cx="150" cy="272" r="7" fill="#aef8ff" opacity=".55"/>
  </g>
</svg>`;

  const TROUBLE_SVG = `
<svg class="char-svg" viewBox="0 0 320 380" aria-hidden="true">
  <defs>
    <linearGradient id="tr-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a273f2"/><stop offset=".55" stop-color="#7b4bd6"/><stop offset="1" stop-color="#5a2fa8"/>
    </linearGradient>
    <radialGradient id="tr-belly" cx=".5" cy=".35" r=".7">
      <stop offset="0" stop-color="#d9c7ff"/><stop offset="1" stop-color="#a88bf0"/>
    </radialGradient>
    <radialGradient id="tr-glow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#7cffb2" stop-opacity=".7"/>
      <stop offset="1" stop-color="#7cffb2" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="160" cy="360" rx="82" ry="12" fill="#02040c" opacity=".38"/>
  <path d="M224 300c42 10 62-8 58-34-3-24-26-28-33-12-6 13 8 20 15 9" fill="none" stroke="#6a3fc4" stroke-width="15" stroke-linecap="round"/>
  <path d="M300 252l16 16-20 6 4-22z" fill="#7b4bd6" stroke="#3d2175" stroke-width="3" stroke-linejoin="round"/>

  <path d="M108 316q-6 28 10 28h24q10 0 10-10v-34z" fill="#5a2fa8" stroke="#2c1553" stroke-width="6" stroke-linejoin="round"/>
  <path d="M212 316q6 28-10 28h-24q-10 0-10-10v-34z" fill="#5a2fa8" stroke="#2c1553" stroke-width="6" stroke-linejoin="round"/>
  <ellipse cx="126" cy="344" rx="28" ry="13" fill="#46218a" stroke="#2c1553" stroke-width="5"/>
  <ellipse cx="194" cy="344" rx="28" ry="13" fill="#46218a" stroke="#2c1553" stroke-width="5"/>

  <path d="M160 116c-48 0-74 36-74 84 0 56 28 116 74 116s74-60 74-116c0-48-26-84-74-84z" fill="url(#tr-body)" stroke="#2c1553" stroke-width="7" stroke-linejoin="round"/>
  <ellipse cx="160" cy="256" rx="44" ry="48" fill="url(#tr-belly)" opacity=".55"/>

  <path d="M94 190q-34 10-36 44 0 14 14 14 12 0 13-13 2-24 24-30z" fill="#7b4bd6" stroke="#2c1553" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="68" cy="246" r="13" fill="#a273f2" stroke="#2c1553" stroke-width="5"/>
  <path d="M226 196q40-16 44 12 4 18 20 16 12-2 10-16-6-28-44-30z" fill="#7b4bd6" stroke="#2c1553" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="278" cy="222" r="14" fill="#a273f2" stroke="#2c1553" stroke-width="5"/>

  <g class="vial" transform="translate(278 198)">
    <circle r="34" fill="url(#tr-glow)"/>
    <rect x="-11" y="-4" width="22" height="42" rx="9" fill="#9dffc8" opacity=".85" stroke="#1f3a4a" stroke-width="3"/>
    <rect x="-7" y="8" width="14" height="28" rx="6" fill="#48ff9b" opacity=".9"/>
    <rect x="-6" y="-15" width="12" height="12" rx="4" fill="#c9d6ef" stroke="#1f3a4a" stroke-width="2"/>
    <circle cx="0" cy="18" r="3" fill="#eafff2" opacity=".8"/>
  </g>

  <path d="M88 92l-12-38q-2-8 6-10 8-2 11 6l14 32z" fill="#8f5be0" stroke="#2c1553" stroke-width="6" stroke-linejoin="round"/>
  <path d="M232 92l12-38q2-8-6-10-8-2-11 6l-14 32z" fill="#8f5be0" stroke="#2c1553" stroke-width="6" stroke-linejoin="round"/>
  <path d="M126 66q-8-34 10-52 4-6 10-2 7 4 3 11-10 20-4 43z" fill="#3a235f" stroke="#1e1238" stroke-width="5" stroke-linejoin="round"/>
  <path d="M194 66q8-34-10-52-4-6-10-2-7 4-3 11 10 20 4 43z" fill="#3a235f" stroke="#1e1238" stroke-width="5" stroke-linejoin="round"/>

  <g class="trouble-head">
    <ellipse cx="160" cy="146" rx="50" ry="43" fill="#cbb8f7" opacity=".9"/>
    <path d="M110 128q18-18 40-14" stroke="#5b36a8" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M170 114q22 4 30 20" stroke="#5b36a8" stroke-width="6" fill="none" stroke-linecap="round"/>

    <g class="eye" data-eye="l">
      <ellipse cx="138" cy="142" rx="15" ry="12" fill="#ffe58a" stroke="#2c1553" stroke-width="3"/>
      <g class="pupil"><ellipse cx="141" cy="143" rx="4.5" ry="8" fill="#2a153f"/></g>
      <path d="M124 135q14-12 29-3-12-2-29 3z" fill="#7b4bd6"/>
    </g>
    <g class="eye" data-eye="r">
      <ellipse cx="182" cy="142" rx="15" ry="12" fill="#ffe58a" stroke="#2c1553" stroke-width="3"/>
      <g class="pupil"><ellipse cx="185" cy="143" rx="4.5" ry="8" fill="#2a153f"/></g>
      <path d="M167 132q15-9 29 3-17-5-29-3z" fill="#7b4bd6"/>
    </g>

    <g class="mouth">
      <path d="M122 168q38 34 76 0-12 34-38 34t-38-34z" fill="#2a153f" stroke="#1c0d2e" stroke-width="3" stroke-linejoin="round"/>
      <path d="M132 174l9 15 8-15z" fill="#ffffff"/>
      <path d="M171 174l9 15 8-15z" fill="#ffffff"/>
      <path d="M146 193q14 10 28 0-14 8-28 0z" fill="#ff7aa8" opacity=".8"/>
    </g>
    <ellipse cx="114" cy="162" rx="10" ry="6" fill="#ff8fc0" opacity=".35"/>
    <ellipse cx="206" cy="162" rx="10" ry="6" fill="#ff8fc0" opacity=".35"/>
    <path d="M160 96q8-16 18-6" stroke="#3a235f" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

  const CAST = {
    mix: { svg: MIX_SVG, name: 'البروفيسور ميكس' },
    bubbles: { svg: BUBBLES_SVG, name: 'بابلز' },
    trouble: { svg: TROUBLE_SVG, name: 'ترابل' }
  };

  const STATES = ['happy', 'surprised', 'sad', 'sneak', 'defeated', 'excited', 'jump', 'spin', 'wave', 'talk-hands'];

  class CharacterManager {
    constructor() {
      this.els = {};
      this.speechTimers = {};
      this.stateTimers = {};
      this.pupils = {};
      this.shown = { mix: true, bubbles: true, trouble: false };
    }

    mount() {
      const holder = document.getElementById('characters');
      if (!holder) return;
      holder.innerHTML = Object.keys(CAST).map((id) => `
        <div class="character char-${id}" id="char-${id}" data-char="${id}">
          <div class="speech" role="status">
            <b class="speech-name">${CAST[id].name}</b>
            <span class="speech-text"></span>
          </div>
          ${CAST[id].svg}
        </div>`).join('');
      Object.keys(CAST).forEach((id) => {
        const el = document.getElementById('char-' + id);
        this.els[id] = el;
        this.pupils[id] = Array.from(el.querySelectorAll('.pupil'));
      });
      this.els.trouble.classList.remove('is-present');
    }

    setState(who, state, duration) {
      const el = this.els[who];
      if (!el) return;
      clearTimeout(this.stateTimers[who]);
      STATES.forEach((s) => el.classList.remove('is-' + s));
      if (state) {
        el.classList.add('is-' + state);
        if (duration) {
          this.stateTimers[who] = setTimeout(() => {
            el.classList.remove('is-' + state);
            if (state === 'defeated') el.classList.add('is-sad');
          }, duration);
        }
      }
    }

    clearState(who) {
      const el = this.els[who];
      if (!el) return;
      clearTimeout(this.stateTimers[who]);
      STATES.forEach((s) => el.classList.remove('is-' + s));
    }

    setTalking(who, on) {
      const el = this.els[who];
      if (!el) return;
      el.classList.toggle('is-talking', !!on);
      if (who === 'mix' || who === 'bubbles') el.classList.toggle('is-talk-hands', !!on);
    }

    show(who) {
      if (who === 'trouble') {
        this.els.trouble.classList.add('is-present');
        this.shown.trouble = true;
      }
    }

    hide(who) {
      if (who === 'trouble') {
        this.els.trouble.classList.remove('is-present');
        this.shown.trouble = false;
      }
      this.hideSpeech(who);
    }

    say(who, text, duration) {
      const el = this.els[who];
      if (!el) return;
      const bubble = el.querySelector('.speech');
      bubble.querySelector('.speech-text').textContent = text;
      bubble.classList.add('show');
      this.setTalking(who, true);
      clearTimeout(this.speechTimers[who]);
      const ms = duration || Math.min(9000, Math.max(2400, text.length * 68));
      this.speechTimers[who] = setTimeout(() => {
        this.hideSpeech(who);
        this.setTalking(who, false);
      }, ms);
    }

    hideSpeech(who) {
      const el = this.els[who];
      if (!el) return;
      clearTimeout(this.speechTimers[who]);
      el.querySelector('.speech').classList.remove('show');
      this.setTalking(who, false);
    }

    hideAllSpeech() {
      Object.keys(this.els).forEach((id) => this.hideSpeech(id));
      Object.keys(this.els).forEach((id) => this.clearState(id));
    }

    lookAt(x, y) {
      Object.keys(this.pupils).forEach((id) => {
        const el = this.els[id];
        if (!el || !this.pupils[id].length) return;
        const r = el.querySelector('.char-svg').getBoundingClientRect();
        if (!r.width) return;
        const cx = r.left + r.width * 0.5;
        const cy = r.top + r.height * 0.3;
        const dx = clamp((x - cx) / 70, -3.4, 3.4);
        const dy = clamp((y - cy) / 90, -2.8, 2.8);
        const t = `translate(${dx}px, ${dy}px)`;
        this.pupils[id].forEach((p) => { p.style.transform = t; });
      });
    }

    resetLook() {
      Object.keys(this.pupils).forEach((id) => {
        this.pupils[id].forEach((p) => { p.style.transform = ''; });
      });
    }
  }

  /* ---------------- dialogue director ---------------- */
  class DialogueManager {
    constructor() {
      this.token = 0;
      this.cancelResolvers = new Set();
      this.duckCount = 0;
      this.active = false;
    }

    beginDuck() {
      this.duckCount++;
      if (this.duckCount === 1) SQ.Audio.duckMusic(0.34, 0.5);
    }

    endDuck() {
      this.duckCount = Math.max(0, this.duckCount - 1);
      if (this.duckCount === 0) SQ.Audio.unduckMusic(0.8);
    }

    async say(who, text, opts = {}) {
      if (!text) return;
      const token = ++this.token;
      const narrator = who === 'narrator';
      const characters = SQ.Characters;
      const started = performance.now();
      this.active = true;
      this.beginDuck();
      if (narrator) {
        SQ.UI.showSubtitle(text);
      } else {
        if (who === 'trouble') characters.show('trouble');
        const lineMs = Math.min(16000, Math.max(2400, SQ.Voice.lineDuration(who, text) + 700, text.length * 68));
        characters.say(who, text, lineMs);
      }
      const cancelled = new Promise((resolve) => this.cancelResolvers.add(resolve));
      const voicePromise = SQ.Voice.speak(narrator ? 'mix' : who, text, opts).catch(() => null);
      const result = await Promise.race([voicePromise, cancelled]);
      if (token !== this.token) {
        this.endDuck();
        return null;
      }
      const elapsed = performance.now() - started;
      const minMs = opts.minMs ?? 1250;
      if (elapsed < minMs) await wait(minMs - elapsed);
      if (token !== this.token) {
        this.endDuck();
        return null;
      }
      if (narrator) SQ.UI.hideSubtitle();
      else characters.hideSpeech(who);
      this.endDuck();
      this.active = false;
      await wait(140);
      return result;
    }

    /** short reaction line: bubble + voice, never cutting off main dialogue */
    quip(who, text, ms = 3200) {
      if (who === 'trouble') SQ.Characters.show('trouble');
      const hold = Math.min(9000, Math.max(ms, SQ.Voice.lineDuration(who, text) + 500));
      SQ.Characters.say(who, text, hold);
      if (!this.active) {
        this.beginDuck();
        SQ.Voice.speak(who, text)
          .catch(() => null)
          .then(() => this.endDuck());
      }
      return wait(Math.min(ms, 1200));
    }

    cancelAll() {
      this.token++;
      this.cancelResolvers.forEach((resolve) => resolve(null));
      this.cancelResolvers.clear();
      this.duckCount = 0;
      SQ.Audio.unduckMusic(0.4);
      SQ.Voice.stop();
      SQ.Characters.hideAllSpeech();
      SQ.UI.hideSubtitle();
      this.active = false;
    }
  }

  SQ.Characters = new CharacterManager();
  SQ.Dialogue = new DialogueManager();
})();
