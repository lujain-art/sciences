/* =========================================================
   SCIENCE QUEST — four missions, objectives and surprises
   ========================================================= */
(function () {
  'use strict';
  const SQ = (window.SQ = window.SQ || {});
  const M = SQ.Mechanics;
  const AR = '٠١٢٣٤٥٦٧٨٩';
  const ar = (n) => String(n).replace(/\d/g, (d) => AR[+d]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const play = (name, opts) => { if (SQ.SFX) SQ.SFX.play(name, opts); };

  const app = () => document.getElementById('app');

  /* ---------------- shared stage scaffolding ---------------- */
  function base(ctx) {
    ctx.add(M.el('stage-ambient'));
    ctx.add(M.el('stage-glow'));
    ctx.add(M.el('stage-bench'));
    buildStageSteps(ctx);
  }

  function buildStageSteps(ctx) {
    const box = M.el('stage-steps');
    ctx.def.steps.forEach((label, i) => {
      const s = M.el('stage-step');
      s.innerHTML = `<i>${ar(i + 1)}</i><span>${label}</span>`;
      box.appendChild(s);
    });
    ctx.add(box);
    ctx.stageSteps = Array.from(box.children);
  }

  function bin(ctx, opts) {
    const b = M.el(('bin dropzone ' + (opts.cls || '')).trim(), opts.x, opts.y, opts.w, opts.h);
    b.dataset.accept = opts.accept;
    b.innerHTML = `<div class="bin-art">${M.binSVG(opts.kind)}</div><span class="bin-label">${opts.label}</span>`;
    ctx.add(b);
    return b;
  }

  function vessel(ctx, opts) {
    const v = M.el(('vessel ' + (opts.cls || '')).trim(), opts.x, opts.y, opts.w, opts.h);
    v.innerHTML = `${opts.html}${opts.label ? `<span class="vessel-label">${opts.label}</span>` : ''}`;
    if (opts.type) v.dataset.type = opts.type;
    ctx.add(v);
    return v;
  }

  function pop(el, scale) {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.classList.add('snapped');
    setTimeout(() => el.classList.remove('snapped'), 520);
    if (SQ.FX) M.spark(el);
    if (scale) el.style.transform = '';
  }

  function reaction(who, state, ms) {
    if (SQ.Characters) SQ.Characters.setState(who, state, ms);
  }

  function confettiBurst(n) {
    if (SQ.FX) SQ.FX.confetti(n || 70);
  }

  /* ---------------- mission definitions ---------------- */
  const DEFS = [
    /* ============ 1. MAGNET ============ */
    {
      id: 'magnet',
      chip: 'المهمة الأولى',
      title: 'مغناطيس الحديد',
      short: 'المغناطيس',
      tag: 'فصل بالجذب',
      subtitle: 'المسامير تنجذب، والبلاستيك لا ينجذب.',
      goal: 'اسحبوا المغناطيس فوق الخليط ليجذب المسامير، ثم رتّبوا البلاستيك في صندوقه.',
      objective: 'مرّروا المغناطيس فوق الخليط لالتقاط المسامير',
      icon: 'magnet',
      music: 'mission',
      total: 9,
      steps: ['اجذب المسامير', 'ضعها في الصندوق', 'رتّب البلاستيك'],
      learn: 'المغناطيس يجذب الحديد فقط. لذلك التصقت المسامير الحديدية به، بينما بقي البلاستيك في الصينية.',
      completeTitle: 'مغناطيس رائع!',
      completeText: 'فصلتم المسامير الحديدية عن قطع البلاستيك من دون أن تلمسوها!',
      hint(ctx) {
        if (ctx.flags.nailsDone) return 'رتّبوا قطع البلاستيك: اسحبوا كل قطعة إلى صندوق البلاستيك البرتقالي.';
        if (ctx.flags.released) return 'ضعوا المغناطيس فوق صندوق الحديد، ثم اسحبوه فوق بقية المسامير.';
        return 'مرّروا المغناطيس ببطء فوق المسامير. سوف تلتصق وحدها!';
      },
      build(ctx) {
        base(ctx);
        const tray = M.object(ctx, { x: 330, y: 300, w: 340, h: 140, cls: 'tray' });
        const trayLabel = M.el('tray-label');
        trayLabel.textContent = 'خليط: مسامير حديد + قطع بلاستيك';
        tray.appendChild(trayLabel);

        const iron = bin(ctx, { x: 62, y: 284, w: 172, h: 168, kind: 'iron', accept: 'magnet', label: 'الحديد', cls: 'iron-bin' });
        const plastic = bin(ctx, { x: 762, y: 284, w: 172, h: 168, kind: 'plastic', accept: 'chip', label: 'البلاستيك', cls: 'plastic-bin' });

        const nailSpots = [[372, 330], [420, 362], [472, 326], [524, 366], [576, 332], [620, 364]];
        const chipSpots = [[388, 392], [500, 396], [606, 392]];
        const nails = nailSpots.map(([x, y]) => {
          const n = M.object(ctx, { x, y, w: 22, h: 56, type: 'nail', html: M.nailSVG() });
          return { el: n };
        });
        const chips = chipSpots.map(([x, y], i) => M.object(ctx, {
          x, y, w: 38, h: 30, type: 'chip',
          html: M.chipSVG(['#ff9f68', '#ff7aa8', '#ffc46b'][i]),
          label: i === 0 ? 'بلاستيك' : ''
        }));

        const magnet = M.object(ctx, {
          x: 748, y: 102, w: 148, h: 142, type: 'magnet', html: M.magnetSVG(), label: 'المغناطيس'
        });
        const label = magnet.querySelector('.obj-label');
        if (label) label.style.top = '-26px';

        const magnetAura = M.el('magnet-aura');
        magnet.querySelector('.obj-art').appendChild(magnetAura);

        let done = 0;
        ctx.flags.nailsDone = false;
        const state = { sorted: 0 };

        function refresh(text) {
          ctx.progress(done, 9, text);
        }

        function maybeFinish() {
          if (done >= 9 && !ctx.flags.finished) {
            refresh('فصلتم كل المواد!');
            ctx.complete();
          }
        }

        const magnetApi = M.setupMagnet(ctx, {
          magnet,
          items: nails,
          bin: iron,
          home: { x: 748, y: 102 },
          onAttached(count, total) {
            if (count === 1) {
              ctx.setHint('ضع المغناطيس في صندوق الحديد');
              ctx.goal('المسامير التصقت! الآن ضعوا المغناطيس في صندوق الحديد.');
            }
            if (count === total) {
              ctx.setHint('المغناطيس ممتلئ! ضعوه في صندوق الحديد');
            }
          },
          onCollected(count) {
            done += count;
            ctx.flags.released = true;
            refresh('المسامير في صندوق الحديد! أحسنتم.');
            ctx.setStep(1);
            reaction('mix', 'happy', 1500);
            maybeFinish();
            if (!ctx.flags.clueShown && count >= 3) {
              ctx.flags.clueShown = true;
              ctx.timer(() => {
                M.clue(ctx, {
                  x: 226, y: 116,
                  tag: 'دليل بابلز',
                  text: 'المسامير مصنوعة من الحديد. المغناطيس يجذب الحديد فقط، ولا يجذب البلاستيك!',
                  hint: 'اضغطوا على البطاقة للمتابعة',
                  autoClose: 7000
                });
                ctx.quip('bubbles', 'بوب! المسامير من الحديد! انظروا كم تلتصق بسرعة!', 4200);
              }, 500);
            }
          },
          onEmpty() {
            ctx.flags.nailsDone = true;
            ctx.setHint('الآن رتّبوا البلاستيك');
            ctx.goal('ممتاز! المسامير كلها في صندوق الحديد. اسحبوا قطع البلاستيك إلى صندوقها.');
            reaction('mix', 'excited', 1500);
          },
          onWrongDrop() {
            ctx.toast('ضعوا المغناطيس فوق صندوق الحديد لفك المسامير', 'bulb');
          }
        });

        chips.forEach((chip) => {
          M.setupSort(ctx, {
            el: chip,
            bin: plastic,
            onCorrect() {
              done++;
              state.sorted++;
              play('cling');
              refresh('قطعة بلاستيك في مكانها!');
              if (state.sorted === 1) ctx.setHint('أكملوا ترتيب البلاستيك');
              maybeFinish();
            },
            onWrong() {
              ctx.toast('هذا صندوق الحديد. البلاستيك لا ينجذب للمغناطيس!', 'bulb');
            }
          });
        });

        ctx.setStep(0);
        refresh('مرّروا المغناطيس فوق الخليط');
        ctx.setHint('المغناطيس فوق الخليط');
        ctx.timer(() => {
          (async () => {
            await ctx.say('mix', 'يا علماء! المختبر بحاجة لمساعدتكم! لنبدأ بالمسامير الحديدية.', { minMs: 1000 });
            if (!ctx.active) return;
            await ctx.say('bubbles', 'بوب! تذكّروا: المغناطيس صديق الحديد فقط!', { minMs: 800 });
          })();
        }, 350);
      }
    },

    /* ============ 2. SIEVE ============ */
    {
      id: 'sieve',
      chip: 'المهمة الثانية',
      title: 'غربال الفصل',
      short: 'الغربال',
      tag: 'فصل بالحجم',
      subtitle: 'الطحين الناعم يعبر، والعدس الكبير يبقى.',
      goal: 'ضعوا الغربال فوق الوعاء، واضغطوا عليه باستمرار لتهزّوه، ثم اسكبوا العدس في جرّته.',
      objective: 'اسحبوا الغربال إلى فوق الوعاء',
      icon: 'sieve',
      music: 'experiment',
      total: 15,
      steps: ['ضع الغربال فوق الوعاء', 'اهزّ الغربال', 'اسكب العدس'],
      learn: 'الغربال يفصل المواد حسب حجم حبيباتها: الطحين الناعم يعبر الثقوب، والعدس الكبير يبقى في الأعلى.',
      completeTitle: 'غربال ذكي!',
      completeText: 'هززتم الغربال وفرّقتم الطحين عن العدس بسهولة!',
      hint(ctx) {
        const a = ctx.sieveApi;
        if (a && a.phase === 'place') return 'اسحبوا الغربال وضعه داخل الإطار المضيء فوق الوعاء.';
        if (a && a.phase === 'shake') return 'اضغطوا على الغربال باستمرار حتى يسقط الطحين كله في الوعاء.';
        if (a && a.phase === 'pour') return 'اسحبوا الغربال إلى جرّة العدس على اليمين.';
        if (a && a.phase === 'stolen') return 'ابحثوا عن الغربال عند الرف، ثم اضغطوا على المكان المضيء.';
        return 'تابعوا الخطوات واحدة بعد الأخرى.';
      },
      build(ctx) {
        base(ctx);
        const bowl = vessel(ctx, {
          x: 386, y: 344, w: 232, h: 122,
          html: M.bowlSVG({ fillClass: 'bowl-flour' }),
          label: 'وعاء الطحين'
        });
        const flourLayer = bowl.querySelector('.bowl-flour');

        const placeZone = M.zone(ctx, { x: 392, y: 244, w: 220, h: 104, accept: 'sieve', role: 'place' });
        placeZone.classList.add('no-highlight');

        const jar = vessel(ctx, {
          x: 776, y: 296, w: 150, h: 198,
          html: M.jarSVG({ color: '#c98d4c', opacity: '.92', rim: '#e0b988', grainy: true }),
          label: 'جرّة العدس'
        });
        M.setLiquid(jar, 0.16);
        const pourZone = M.zone(ctx, { x: 786, y: 300, w: 130, h: 180, accept: 'sieve', role: 'pour' });
        pourZone.classList.add('no-highlight');

        const sieve = M.object(ctx, {
          x: 380, y: 96, w: 250, h: 152, type: 'sieve', html: M.sieveSVG(), label: 'غربال'
        });

        let tickCount = 0;
        let pourDone = false;
        let stolenYet = false;
        let stolenAnimating = false;
        const totalTicks = 14;

        function update(done, text) {
          ctx.progress(done, 15, text);
        }

        function finish() {
          if (!pourDone) return;
          update(15, 'فصلتم الطحين عن العدس!');
          ctx.complete();
        }

        ctx.sieveApi = M.setupSieve(ctx, {
          sieve,
          placeZone,
          bowl,
          flourLayer,
          ticks: totalTicks,
          pourZone,
          pourTarget: jar,
          onPlaced() {
            ctx.setStep(1);
            ctx.setHint('اهزّ الغربال');
            ctx.goal('الغربال في مكانه! اضغطوا عليه باستمرار حتى يهتز ويسقط الطحين.');
            update(0, 'اضغطوا باستمرار على الغربال لتهزّوه');
          },
          onTick(tick) {
            tickCount = tick;
            update(tick, `هزّوا الغربال… الطحين يتساقط (${ar(tick)} من ${ar(totalTicks)})`);
            if (tick === 4 && !stolenYet) {
              stolenYet = true;
              ctx.timer(() => stealSieve(), 420);
            }
          },
          onFull() {
            ctx.setStep(2);
            ctx.setHint('اسكب العدس في الجرة');
            ctx.goal('بقي العدس الكبير في الغربال. اسحبوا الغربال إلى جرّة العدس.');
            update(14, 'بقي العدس! اسحبوا الغربال إلى جرّة العدس');
            reaction('bubbles', 'excited', 2000);
          },
          onPoured() {
            pourDone = true;
            update(15, 'فصلتم الطحين عن العدس!');
            ctx.setHint('اكتملت المهمة');
            ctx.quip('bubbles', 'ما شاء الله! أنتم علماء حقيقيون!', 3200);
            reaction('bubbles', 'spin', 1800);
            reaction('mix', 'happy', 2000);
            ctx.timer(finish, 900);
          }
        });

        function stealSieve() {
          if (!ctx.active || ctx.flags.finished || !ctx.sieveApi || ctx.sieveApi.phase !== 'shake') return;
          if (stolenAnimating) return;
          stolenAnimating = true;
          ctx.sieveApi.steal();
          play('sneak');
          play('giggle', { delay: 0.25 });
          reaction('trouble', 'sneak', 4000);
          (async () => {
            await ctx.say('trouble', 'هاهاها! لن تستطيعوا ترتيب هذه المواد بسهولة!', { minMs: 1100 });
            if (!ctx.active) return;
            reaction('bubbles', 'surprised', 2200);
            await ctx.say('bubbles', 'بوب! الغربال مخبّأ عند رف القوارير! ابحثوا عنه!', { minMs: 900 });
            if (!ctx.active) return;
            if (SQ.Characters) SQ.Characters.hide('trouble');
            const clue = M.clue(ctx, {
              x: 236, y: 96,
              tag: 'دليل بابلز',
              text: 'رأيت ترابل يخبّئ الغربال قرب رف القوارير في أعلى اليسار.',
              hint: 'اضغطوا على المكان المضيء للعثور عليه',
              autoClose: 9000
            });
            const spot = M.hotspot(ctx, {
              x: 84, y: 104,
              label: 'ابحث عن الغربال هنا',
              icon: 'bulb',
              hint: true,
              onFind() {
                if (clue) clue.close();
                ctx.sieveApi.restore();
                play('sparkle');
                ctx.toast('وجدتم الغربال! أكملوا الهزّ', 'check');
                ctx.setHint('اهزّ الغربال');
                ctx.quip('bubbles', 'وجدتموه! واصلوا الهزّ بسرعة!', 2600);
                stolenAnimating = false;
              }
            });
            ctx.flags.findSpot = spot;
          })();
        }

        ctx.setStep(0);
        update(0, 'اسحبوا الغربال إلى فوق الوعاء');
        ctx.setHint('الغربال إلى الوعاء');
        ctx.timer(() => ctx.say('mix', 'الخليط هنا: عدس كبير وطحين ناعم. الغربال سيحلّ المشكلة!', { minMs: 900 }), 350);
      }
    },

    /* ============ 3. FILTRATION ============ */
    {
      id: 'filter',
      chip: 'المهمة الثالثة',
      title: 'ترشيح الماء العكر',
      short: 'الترشيح',
      tag: 'فصل صلب عن سائل',
      subtitle: 'الطين يبقى على الورق، والماء يعبر صافيًا.',
      goal: 'افتحوا حاوية ترابل الغامضة، ثم ركّبوا ورق الترشيح والقمع واسكبوا الماء العكر فوقه.',
      objective: 'اضغطوا على الحاوية الغامضة',
      icon: 'funnel',
      music: 'experiment',
      total: 5,
      steps: ['افتح الحاوية', 'ركّب أداة الترشيح', 'اسكب الماء العكر', 'التقط النجمة'],
      learn: 'الترشيح يفصل المواد الصلبة غير الذائبة عن السائل. يبقى الطين على ورق الترشيح، ويعبر الماء الصافي إلى الكأس.',
      completeTitle: 'ماء صافٍ!',
      completeText: 'فتحتم الحاوية الغامضة، وركّبتم الترشيح، وحوّلتم الماء العكر إلى ماء صافٍ!',
      hint(ctx) {
        if (ctx.flags.starReady) return 'اضغطوا على النجمة الذهبية في الأعلى لإنهاء المهمة.';
        if (!ctx.flags.opened) return 'اضغطوا على الحاوية الغامضة في اليسار.';
        if (!ctx.flags.papered) return 'اسحبوا ورق الترشيح إلى فتحة القمع.';
        if (!ctx.flags.funneled) return 'اسحبوا القمع إلى الإطار فوق الكأس.';
        return 'اسحبوا الحاوية المفتوحة فوق القمع لسكب الماء العكر.';
      },
      build(ctx) {
        base(ctx);
        const mystery = M.mystery(ctx, {
          x: 60, y: 276, w: 176, h: 206,
          label: 'حاوية ترابل الغامضة',
          onOpen() { begin(); }
        });
        mystery.el.style.zIndex = '22';

        const flask = vessel(ctx, {
          x: 650, y: 300, w: 150, h: 192,
          html: M.flaskSVG({ color: '#71ddff' }),
          label: 'كأس الماء الصافي'
        });
        const stream = M.makeStream(ctx, 716, 340, 70);

        const funnel = M.object(ctx, {
          x: 428, y: 140, w: 170, h: 182, type: 'funnel', cls: 'funnel', html: M.funnelSVG(), label: 'القمع'
        });
        const paper = M.object(ctx, {
          x: 298, y: 316, w: 108, h: 108, type: 'paper', html: M.filterPaperSVG(), label: 'ورق الترشيح'
        });
        const paperZone = M.zone(ctx, { x: 444, y: 150, w: 138, h: 72, accept: 'paper', role: 'paper' });
        paperZone.classList.add('no-highlight');
        const funnelZone = M.zone(ctx, { x: 635, y: 202, w: 180, h: 96, accept: 'funnel', role: 'funnel' });
        funnelZone.classList.add('no-highlight');
        const pourZone = M.zone(ctx, { x: 642, y: 168, w: 164, h: 84, accept: 'jar', role: 'pour' });
        pourZone.classList.add('no-highlight');

        [paper, funnel, flask, stream, paperZone, funnelZone, pourZone].forEach((el) => {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.transition = 'opacity .45s ease, transform .45s ease';
        });
        if (SQ.Drag) {
          SQ.Drag.enable(paper, false);
          SQ.Drag.enable(funnel, false);
        }
        let filterApi = null;
        let done = 0;

        function update(n, text) {
          done = n;
          ctx.progress(n, 5, text);
        }

        function reveal() {
          [paper, funnel, flask].forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.pointerEvents = '';
              el.style.transform = 'none';
              M.spark(el);
              play('pop', { delay: i * 0.03 });
            }, i * 160);
          });
          if (SQ.Drag) {
            SQ.Drag.enable(paper, true);
            SQ.Drag.enable(funnel, true);
          }
          stream.style.opacity = '';
          setTimeout(() => {
            paperZone.style.opacity = '';
            funnelZone.style.opacity = '';
          }, 500);
        }

        function begin() {
          if (ctx.flags.opened) return;
          ctx.flags.opened = true;
          reaction('bubbles', 'surprised', 2400);
          ctx.setStep(1);
          update(1, 'ضعوا ورق الترشيح في القمع');
          ctx.setHint('ورق الترشيح إلى القمع');
          ctx.goal('اكتشفتم الماء العكر! ركّبوا ورق الترشيح في القمع أولًا.');
          reveal();
          ctx.timer(() => {
            M.clue(ctx, {
              x: 70, y: 96,
              tag: 'اكتشاف بابلز',
              text: 'هذا ماء عكر: ماء مختلط بجزيئات الطين الصغيرة. ورق الترشيح سيمسك الطين!',
              hint: 'اضغطوا على البطاقة للمتابعة',
              autoClose: 8000
            });
          }, 650);
          ctx.timer(() => ctx.say('bubbles', 'بوب! اكتشفت شيئًا غريبًا! ماء عكر داخل الحاوية!', { minMs: 900 }), 320);

          filterApi = M.setupFilter(ctx, {
            paper,
            funnel,
            jar: mystery.el,
            flask,
            paperZone,
            funnelZone,
            pourZone,
            stream,
            onPaper() {
              ctx.flags.papered = true;
              update(2, 'القمع إلى الإطار فوق الكأس');
              ctx.setHint('القمع إلى الكأس');
              ctx.goal('ورق الترشيح في مكانه. الآن ضعوا القمع فوق الكأس.');
              play('sparkle');
            },
            onFunnel() {
              ctx.flags.funneled = true;
              ctx.setStep(2);
              update(3, 'اسحبوا الحاوية المفتوحة فوق القمع');
              ctx.setHint('اسكب الماء العكر');
              ctx.goal('كل شيء جاهز! اسحبوا الحاوية المفتوحة واسكبوا الماء العكر فوق القمع.');
              pourZone.style.opacity = '';
              M.spark(funnel);
              play('pop');
            },
            onPourTick(r) {
              M.setLiquid(flask, r * 0.82);
            },
            onPourDone() {
              ctx.flags.filtered = true;
              ctx.setStep(3);
              update(4, 'التقطوا النجمة الذهبية!');
              ctx.setHint('اضغطوا على النجمة الذهبية');
              ctx.goal('الماء عبر ورق الترشيح وبقي الطين عليه. التقطوا النجمة الذهبية!');
              reaction('mix', 'excited', 2400);
              reaction('bubbles', 'spin', 2000);
              ctx.timer(spawnStar, 900);
            }
          });
          ctx.filterApi = filterApi;
        }

        function spawnStar() {
          if (ctx.flags.starReady) return;
          ctx.flags.starReady = true;
          const star = M.goldenStar(ctx, {
            x: 470, y: 78,
            label: 'نجمة ذهبية',
            onCollect() {
              update(5, 'ماء صافٍ! اكتملت المهمة');
              ctx.sparkleAll();
              ctx.complete();
            }
          });
          ctx.flags.star = star;
          M.flashAt(star.el, ['#ffd166', '#fff3c4', '#8ff2ff']);
          ctx.quip('bubbles', 'نجمة ذهبية! اضغطوا عليها!', 2600);
          play('sparkle');
        }

        ctx.setStep(0);
        update(0, 'اضغطوا على الحاوية الغامضة');
        ctx.setHint('افتح الحاوية الغامضة');
        ctx.timer(() => ctx.say('mix', 'انظروا! حاوية غامضة وسط المختبر. ماذا بداخلها؟', { minMs: 900 }), 350);
      }
    },

    /* ============ 4. FINAL ============ */
    {
      id: 'final',
      chip: 'المهمة الأخيرة',
      title: 'إنقاذ المختبر',
      short: 'المهمة الأخيرة',
      tag: 'التحدي الكبير',
      subtitle: 'المسامير، العدس، والطحين... كلها في خليط واحد!',
      goal: 'افصلوا المسامير بالمغناطيس، والعدس بالغربال، والطحين بالترشيح. ثم أشعلوا أنوار المختبر!',
      objective: 'اكشفوا الحاوية الغامضة',
      icon: 'rocket',
      music: 'final',
      total: 5,
      final: true,
      steps: ['مغناطيس المسامير', 'غربال العدس', 'ترشيح الطحين', 'أشعلوا الأنوار'],
      learn: 'لفصل خليط من مواد مختلفة نختار الطريقة المناسبة: المغناطيس للحديد، الغربال حسب الحجم، والترشيح للصلب غير الذائب مع السائل.',
      hint(ctx) {
        const p = ctx.flags.phase || 0;
        if (p === 0) return 'اسحبوا المغناطيس فوق الخليط، ثم ضعوه في صندوق الحديد.';
        if (p === 1) return 'ضعوا الغربال فوق الوعاء واضغطوا عليه باستمرار.';
        if (p === 2) return 'اسحبوا الغربال إلى جرّة العدس.';
        if (p === 3) return 'اسحبوا قارورة الماء فوق وعاء الطحين.';
        if (p === 4) return 'اسحبوا الوعاء فوق القمع لترشيح خليط الطحين.';
        if (p === 5) return 'اضغطوا على النجمة الذهبية لتشغيل المختبر!';
        return 'تابعوا الخطوات.';
      },
      build(ctx) {
        base(ctx);
        const root = app();
        root.classList.add('final-dim');
        ctx.flags.phase = 0;

        const bowl = vessel(ctx, {
          x: 356, y: 300, w: 300, h: 148,
          html: M.bowlSVG({ fillClass: 'bowl-flour' }),
          label: 'وعاء الخليط'
        });
        bowl.style.opacity = '0';
        const flourLayer = bowl.querySelector('.bowl-flour');

        const content = M.el('mixture-content', 372, 318, 268, 76);
        content.innerHTML = M.svg(268, 76, `
          <ellipse cx="76" cy="44" rx="52" ry="20" fill="#f5eeda" opacity=".9"/>
          <ellipse cx="120" cy="52" rx="38" ry="14" fill="#f8f2df" opacity=".8"/>
          ${Array.from({ length: 18 }, () => `<ellipse cx="${52 + Math.random() * 170}" cy="${28 + Math.random() * 34}" rx="${4 + Math.random() * 2}" ry="${2.6 + Math.random() * 1.4}" fill="#c98d4c"/>`).join('')}
          ${Array.from({ length: 22 }, () => `<circle cx="${44 + Math.random() * 190}" cy="${22 + Math.random() * 42}" r="${1 + Math.random() * 1.6}" fill="#fff8e6" opacity=".9"/>`).join('')}`);
        content.style.pointerEvents = 'none';
        content.style.opacity = '0';
        ctx.add(content);

        const mystery = M.mystery(ctx, {
          x: 386, y: 258, w: 196, h: 210,
          label: 'حاوية ترابل',
          onOpen() { reveal(); }
        });
        mystery.el.style.zIndex = '22';

        const iron = bin(ctx, { x: 54, y: 322, w: 158, h: 156, kind: 'iron', accept: 'magnet', label: 'الحديد', cls: 'iron-bin' });
        const magnet = M.object(ctx, {
          x: 84, y: 104, w: 142, h: 136, type: 'magnet', html: M.magnetSVG(), label: 'المغناطيس'
        });
        const magnetAura = M.el('magnet-aura');
        magnet.querySelector('.obj-art').appendChild(magnetAura);
        [iron, magnet].forEach((el) => {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        });
        if (SQ.Drag) SQ.Drag.enable(magnet, false);

        const nails = [];
        const nailSpots = [[392, 324], [438, 350], [486, 322], [534, 352], [582, 326], [618, 352]];
        nailSpots.forEach(([x, y]) => {
          const n = M.object(ctx, { x, y, w: 20, h: 52, type: 'nail', html: M.nailSVG() });
          n.style.opacity = '0';
          nails.push({ el: n });
        });

        let revealed = false;
        let phase = 0;
        let magnetApi = null;
        let sieveApi = null;
        let bowlDraggable = false;
        let finishedPhase = false;

        function reveal() {
          if (revealed) return;
          revealed = true;
          ctx.flags.revealed = true;
          play('flash');
          if (SQ.FX) SQ.FX.confetti(28);
          mystery.el.style.transition = 'opacity .5s, transform .5s';
          mystery.el.style.opacity = '0';
          mystery.el.style.transform = 'scale(.7)';
          setTimeout(() => mystery.el.remove(), 520);
          bowl.style.transition = 'opacity .5s';
          bowl.style.opacity = '1';
          content.style.transition = 'opacity .6s';
          content.style.opacity = '1';
          [iron, magnet].forEach((el, i) => {
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.pointerEvents = '';
              M.spark(el);
            }, 200 + i * 140);
          });
          if (SQ.Drag) SQ.Drag.enable(magnet, true);
          nails.forEach((n) => { n.el.style.opacity = '1'; });
          ctx.setStep(0);
          ctx.progress(0, 5, 'اسحبوا المغناطيس فوق الخليط');
          ctx.setHint('المغناطيس للمسامير');
          ctx.goal('الخليط كله أمامكم! ابدأوا بالمسامير: اسحبوا المغناطيس فوقها.');
          startMagnet();
        }

        function startMagnet() {
          if (magnetApi) return;
          magnetApi = M.setupMagnet(ctx, {
            magnet,
            items: nails,
            bin: iron,
            home: { x: 84, y: 104 },
            onAttached(count, total) {
              if (count === total) ctx.setHint('ضع المغناطيس في صندوق الحديد');
            },
            onCollected(count) {
              ctx.progress(0, 5, `المسامير: ${ar(count)} من ${ar(6)}`);
              if (count >= 6 && !finishedPhase) {
                finishedPhase = true;
                content.style.opacity = '0';
                phase = 1;
                ctx.flags.phase = 1;
                ctx.progress(1, 5, 'تم فصل المسامير! الآن الغربال');
                ctx.setStep(1);
                ctx.setHint('الغربال للعدس');
                ctx.goal('المسامير في صندوق الحديد. بقي العدس والطحين… استخدموا الغربال!');
                reaction('mix', 'happy', 1800);
                play('star');
                ctx.timer(startSieve, 700);
              }
            },
            onWrongDrop() { ctx.toast('صندوق الحديد في اليسار', 'bulb'); }
          });
        }

        function startSieve() {
          if (sieveApi) return;
          if (SQ.Characters) SQ.Characters.show('trouble');
          reaction('trouble', 'sneak', 3200);
          play('giggle');
          ctx.quip('trouble', 'هاهاها! لن تنجحوا في فصل الباقي!', 2800);
          ctx.timer(() => { if (SQ.Characters) SQ.Characters.hide('trouble'); }, 3200);

          const placeZone = M.zone(ctx, { x: 396, y: 236, w: 220, h: 100, accept: 'sieve', role: 'place' });
          placeZone.classList.add('no-highlight');
          const sieve = M.object(ctx, {
            x: 398, y: 92, w: 238, h: 146, type: 'sieve', html: M.sieveSVG(), label: 'غربال'
          });
          sieve.style.opacity = '0';
          sieve.style.transform = 'translateY(-22px)';
          const jar = vessel(ctx, {
            x: 780, y: 304, w: 142, h: 188,
            html: M.jarSVG({ color: '#c98d4c', opacity: '.94', rim: '#e0b988', grainy: true }),
            label: 'جرّة العدس'
          });
          M.setLiquid(jar, 0.16);
          jar.style.opacity = '0';
          const pourZone = M.zone(ctx, { x: 788, y: 306, w: 126, h: 170, accept: 'sieve', role: 'pour' });
          pourZone.classList.add('no-highlight');
          setTimeout(() => {
            sieve.style.transition = 'opacity .4s, transform .4s';
            jar.style.transition = 'opacity .4s';
            sieve.style.opacity = '1';
            sieve.style.transform = 'none';
            jar.style.opacity = '1';
            M.spark(sieve);
            play('pop');
          }, 200);

          let pourDone = false;
          sieveApi = M.setupSieve(ctx, {
            sieve, placeZone, bowl, flourLayer, ticks: 12, pourZone, pourTarget: jar,
            onPlaced() {
              ctx.setHint('اهزّ الغربال');
              ctx.goal('اضغطوا على الغربال باستمرار، دعوا الطحين الناعم يعبر.');
            },
            onTick(tick) {
              ctx.progress(1, 5, `هزّوا الغربال… (${ar(tick)} من ${ar(12)})`);
            },
            onFull() {
              ctx.flags.phase = 2;
              phase = 2;
              ctx.setStep(2);
              ctx.setHint('العدس إلى الجرة');
              ctx.goal('الطحين في الوعاء! اسحبوا الغربال إلى جرّة العدس.');
              ctx.progress(2, 5, 'بقي العدس! اسحبوا الغربال إلى جرّة العدس');
            },
            onPoured() {
              pourDone = true;
              phase = 3;
              ctx.flags.phase = 3;
              ctx.progress(3, 5, 'العدس في مكانه! أضيفوا الماء إلى الطحين');
              ctx.setHint('أضف الماء إلى الطحين');
              ctx.goal('فصلتم العدس! لترشيح الطحين، أضيفوا الماء أولًا.');
              ctx.timer(startWater, 750);
              ctx.timer(() => {
                jar.style.transition = 'opacity .6s ease, transform .6s ease';
                jar.style.opacity = '0';
                jar.style.transform = 'translateY(12px)';
              }, 1500);
            }
          });
          ctx.sieveApi = sieveApi;
        }

        function startWater() {
          if (ctx.flags.waterStarted) return;
          ctx.flags.waterStarted = true;
          const water = M.object(ctx, {
            x: 158, y: 178, w: 128, h: 170, type: 'water',
            html: M.jarSVG({ color: '#78d8ff', opacity: '.85', rim: '#a9eaff' }),
            label: 'ماء'
          });
          water.style.opacity = '0';
          water.style.pointerEvents = 'none';
          const zone = M.zone(ctx, { x: 392, y: 278, w: 228, h: 132, accept: 'water', role: 'water' });
          zone.classList.add('no-highlight');
          setTimeout(() => {
            water.style.transition = 'opacity .4s';
            water.style.opacity = '1';
            water.style.pointerEvents = '';
            M.spark(water);
            play('pop');
          }, 150);
          M.makeDrag(ctx, water, {
            type: 'water',
            onDrop(z) {
              if (z !== zone) {
                if (z) play('wrong');
                return false;
              }
              water.classList.add('pouring');
              const bp = M.stagePoint(bowl);
              SQ.Drag.animateTo(water, bp.x - 20, bp.y - 110, 300);
              play('pourWater');
              M.bits(ctx, { x: bp.x, y: bp.y - 40, count: 18, kind: 'water', spread: 34, fall: 54, dur: 0.7 });
              const waterLayer = bowl.querySelector('.bowl-water');
              if (waterLayer) {
                waterLayer.style.transition = 'opacity .7s ease';
                waterLayer.style.opacity = '.5';
              }
              if (flourLayer) {
                flourLayer.setAttribute('fill', '#c49a63');
                flourLayer.style.opacity = '.95';
              }
              bowl.querySelector('.vessel-label').textContent = 'خليط الطحين والماء';
              setTimeout(() => {
                water.style.opacity = '';
                water.classList.add('fade-out');
                M.spark(bowl);
                play('waterFill');
                phase = 4;
                ctx.flags.phase = 4;
                ctx.progress(4, 5, 'اسحبوا الوعاء فوق القمع لترشيحه');
                ctx.setHint('رشّح خليط الطحين');
                ctx.goal('أصبح الطحين عالقًا في الماء. اسحبوا الوعاء فوق القمع لترشيحه.');
                ctx.timer(startFilter, 700);
              }, 1700);
              return true;
            }
          });
        }

        function startFilter() {
          if (ctx.flags.filterStarted) return;
          ctx.flags.filterStarted = true;
          const funnelEl = M.object(ctx, {
            x: 704, y: 169, w: 158, h: 176, html: M.funnelSVG(), cls: 'funnel'
          });
          const paperInFunnel = funnelEl.querySelector('.funnel-paper');
          if (paperInFunnel) paperInFunnel.style.opacity = '1';
          const flask = vessel(ctx, {
            x: 713, y: 306, w: 140, h: 186,
            html: M.flaskSVG({ color: '#9fe9ff' }),
            label: 'ماء صافٍ'
          });
          const stream = M.makeStream(ctx, 779, 330, 76);
          const zone = M.zone(ctx, { x: 704, y: 209, w: 158, h: 78, accept: 'bowl', role: 'filter' });
          zone.classList.add('no-highlight');
          [funnelEl, flask].forEach((el) => {
            el.style.opacity = '0';
            el.style.transition = 'opacity .45s';
            setTimeout(() => {
              el.style.opacity = '1';
              M.spark(el);
              play('pop');
            }, 200);
          });

          SQ.Drag.make(bowl, {
            type: 'bowl',
            onDragStart() { play('pickup'); },
            onDrop(z) {
              if (z !== zone) {
                if (z) play('wrong');
                return false;
              }
              bowl.classList.add('pouring');
              bowl.style.transition = 'transform .6s ease, opacity .6s';
              bowl.style.transform = 'rotate(-34deg)';
              play('pourWater');
              const spout = M.stagePoint(funnelEl);
              stream.style.left = (spout.x - 4) + 'px';
              stream.style.top = '330px';
              stream.style.height = '76px';
              stream.classList.add('flowing');
              let step = 0;
              const tick = () => {
                step++;
                M.bits(ctx, { x: spout.x, y: 334, count: 2, kind: 'water', spread: 10, fall: 76, dur: 0.55 });
                play('drip');
                M.setLiquid(flask, clamp(step / 10, 0, 1) * 0.86);
                if (step === 2) {
                  funnelEl.classList.add('wet');
                  play('glug');
                }
                if (step >= 10) {
                  stream.classList.remove('flowing');
                  play('waterFill');
                  bowl.classList.add('fade-out');
                  bowl.style.opacity = '0';
                  phase = 5;
                  ctx.flags.phase = 5;
                  ctx.progress(5, 5, 'الطحين على ورق الترشيح! أشعلوا الأنوار');
                  ctx.setHint('اضغطوا على النجمة');
                  ctx.goal('الماء صافٍ في الكأس، والطحين بقي على الورق. التقطوا نجمة الإنقاذ!');
                  ctx.sparkleAll();
                  ctx.timer(spawnFinalStar, 600);
                  return;
                }
                setTimeout(tick, 260);
              };
              setTimeout(tick, 300);
              return true;
            }
          });
          ctx.setStep(3);
          ctx.setHint('اسحب الوعاء إلى القمع');
          ctx.toast('القمع جاهز بورق الترشيح. اسحبوا الوعاء فوقه', 'bulb');
        }

        function spawnFinalStar() {
          if (ctx.flags.starReady) return;
          ctx.flags.starReady = true;
          const star = M.goldenStar(ctx, {
            x: 498, y: 62,
            label: 'نجمة الإنقاذ',
            onCollect() {
              ctx.setStep(4);
              ctx.complete();
            }
          });
          ctx.flags.star = star;
          M.flashAt(star.el, ['#ffd166', '#fff3c4', '#8ff2ff']);
          ctx.quip('bubbles', 'نجمة الإنقاذ! اضغطوا عليها لتعود الأنوار!', 3000);
        }

        /* --- opening scene --- */
        ctx.setStep(0);
        ctx.progress(0, 5, 'اكشفوا الحاوية الغامضة');
        if (SQ.Characters) {
          SQ.Characters.show('trouble');
          reaction('trouble', 'sneak', 4200);
        }
        play('heartbeat');
        const troubleLine = ctx.say('trouble', 'هاهاها! خلطت كل شيء! لن تفصلوا هذه المواد أبدًا!', { minMs: 1200 });
        ctx.timer(() => {
          play('sneak');
          reaction('bubbles', 'surprised', 2000);
          mystery.open();
        }, 2600);
        if (troubleLine && typeof troubleLine.then === 'function') {
          troubleLine.then(() => {
            if (!ctx.active) return;
            ctx.timer(() => {
              ctx.say('mix', 'لا تقلقوا يا علماء! الخطة واضحة: الحديد أولًا بالمغناطيس.', { minMs: 800 });
            }, 450);
          });
        }
      }
    }
  ];

  /* ---------------- mission runner ---------------- */
  class MissionRunner {
    constructor() {
      this.defs = DEFS;
      this.current = null;
      this.index = -1;
      this.onComplete = null;
    }

    start(index) {
      this.stop();
      const def = DEFS[index];
      if (!def) return null;
      this.index = index;
      const stage = document.getElementById('stage');
      if (!stage) return null;
      stage.innerHTML = '';
      const chip = document.getElementById('mission-chip');
      const title = document.getElementById('mission-title');
      const goal = document.getElementById('mission-goal');
      if (chip) chip.textContent = def.chip;
      if (title) title.textContent = def.title;
      if (goal) goal.textContent = def.goal;

      const stepsBox = document.getElementById('mission-steps');
      if (stepsBox) {
        stepsBox.innerHTML = def.steps.map(() => '<span class="mstep"></span>').join('');
      }

      const ctx = {
        def,
        index,
        stage,
        active: true,
        flags: {},
        timers: [],
        cleanups: [],
        nodes: [],
        total: def.total,
        stageSteps: [],
        add(node) {
          if (!node) return;
          stage.appendChild(node);
          ctx.nodes.push(node);
          return node;
        },
        timer(fn, ms) {
          const id = setTimeout(() => {
            if (!ctx.active) return;
            try { fn(); } catch (e) { console.error(e); }
          }, ms);
          ctx.timers.push(id);
          return id;
        },
        interval(fn, ms) {
          const id = setInterval(() => { if (ctx.active) fn(); }, ms);
          ctx.timers.push(id);
          return id;
        },
        wait(ms) {
          return new Promise((resolve) => ctx.timer(resolve, ms));
        },
        say(who, text, opts) {
          if (!ctx.active || !SQ.Dialogue) return Promise.resolve(null);
          return SQ.Dialogue.say(who, text, opts).catch(() => null);
        },
        quip(who, text, ms) {
          if (!ctx.active || !SQ.Dialogue) return;
          SQ.Dialogue.quip(who, text, ms);
        },
        toast(text, icon) {
          if (SQ.UI) SQ.UI.toast(text, { icon: icon || 'bulb' });
        },
        goal(text) {
          if (goal) goal.textContent = text;
        },
        progress(done, total, text) {
          const t = total || ctx.total || 1;
          const d = clamp(done, 0, t);
          const fill = document.getElementById('progress-fill');
          const count = document.getElementById('objective-count');
          const obj = document.getElementById('objective-text');
          if (fill) fill.style.width = `${(d / t) * 100}%`;
          if (count) count.textContent = `${ar(d)} / ${ar(t)}`;
          if (obj && text) obj.textContent = text;
        },
        setStep(done) {
          ctx.stageSteps.forEach((el, i) => {
            el.classList.toggle('done', i < done);
            el.classList.toggle('active', i === done);
          });
          const dots = document.querySelectorAll('#mission-steps .mstep');
          dots.forEach((el, i) => el.classList.toggle('done', i < done));
          ctx.stepDone = done;
        },
        hintFn: def.hint,
        setHint(fn) {
          if (typeof fn === 'function') ctx.hintFn = fn;
          else if (typeof fn === 'string') ctx.hintText = fn;
        },
        sparkleAll() {
          if (!SQ.FX) return;
          SQ.FX.confetti(50);
          const r = ctx.stage.getBoundingClientRect();
          SQ.FX.starBurst(r.left + r.width * 0.5, r.top + r.height * 0.4);
        },
        complete() {
          if (ctx.flags.finished) return;
          ctx.flags.finished = true;
          if (SQ.Dialogue) SQ.Dialogue.cancelAll();
          play('celebrate');
          play('reward', { delay: 0.2 });
          if (SQ.Music) SQ.Music.jingle('success');
          confettiBurst(70);
          reaction('mix', 'happy', 2600);
          reaction('bubbles', 'spin', 2200);
          if (def.final) {
            if (SQ.Scenes) SQ.Scenes.finale(ctx);
            return;
          }
          if (SQ.Missions.onComplete) {
            SQ.Missions.onComplete(def, ctx.index, ctx);
          }
        }
      };
      this.current = ctx;
      if (SQ.Music) SQ.Music.play(def.music || 'mission');
      try {
        def.build(ctx);
      } catch (e) {
        console.error('Mission build failed', e);
        ctx.toast('تعذّر تحميل المهمة. حاولوا من جديد.', 'bulb');
      }
      return ctx;
    }

    stop() {
      const ctx = this.current;
      if (!ctx) return;
      ctx.active = false;
      ctx.flags.finished = true;
      ctx.timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
      ctx.timers.length = 0;
      ctx.cleanups.forEach((fn) => { try { fn(); } catch (e) { /* noop */ } });
      ctx.cleanups.length = 0;
      if (SQ.Dialogue) SQ.Dialogue.cancelAll();
      if (SQ.Characters) {
        SQ.Characters.hide('trouble');
        SQ.Characters.hideAllSpeech();
      }
      const stage = document.getElementById('stage');
      if (stage) stage.innerHTML = '';
      const tip = document.querySelector('.stage-tip');
      if (tip) tip.remove();
      const root = app();
      if (root) {
        root.classList.remove('final-dim', 'machine-on', 'doors-open', 'lights-flicker');
      }
      this.current = null;
    }

    hint() {
      const ctx = this.current;
      if (!ctx || !ctx.active) return;
      play('click');
      let text = '';
      if (typeof ctx.hintFn === 'function') {
        try { text = ctx.hintFn(ctx) || ''; } catch (e) { text = ''; }
      }
      if (!text) text = ctx.hintText || 'تابعوا الخطوات واحدة بعد الأخرى.';
      M.tip(ctx, text, true);
      if (SQ.UI) SQ.UI.toast(text, { icon: 'bulb', time: 4200 });
      ctx.stage.querySelectorAll('.hint-glow').forEach((el) => el.classList.remove('hint-glow'));
      const target = ctx.stage.querySelector('.obj.draggable:not(.locked)');
      if (target) target.classList.add('hint-glow');
    }
  }

  SQ.Missions = new MissionRunner();
  SQ.MissionDefs = DEFS;
})();
