'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './boss-battle.css';

/* ---- questions (faithful port of BOSS_QUESTIONS) ---- */
function bfrac(n: string | number, d: string | number) {
  return `<span class="frac"><span class="n">${n}</span><span class="d">${d}</span></span>`;
}

type Opt = { t: string; ok?: 1 };
type Question = { q: string; opts: Opt[] };

const BOSS_QUESTIONS: Question[] = [
  { q: `Обчисли: √( ${bfrac(49, 4)} )`, opts: [{ t: bfrac(7, 2), ok: 1 }, { t: bfrac(7, 4) }, { t: bfrac(49, 2) }, { t: '7' }] },
  { q: 'Значення виразу: 2<sup>3</sup> · 2<sup>2</sup>', opts: [{ t: '32', ok: 1 }, { t: '16' }, { t: '64' }, { t: '8' }] },
  { q: `Скороти дріб ${bfrac(12, 18)}`, opts: [{ t: bfrac(2, 3), ok: 1 }, { t: bfrac(3, 4) }, { t: bfrac(6, 9) }, { t: bfrac(1, 2) }] },
  { q: 'Розв’яжи рівняння: 3x − 7 = 8', opts: [{ t: 'x = 5', ok: 1 }, { t: 'x = 3' }, { t: 'x = 15' }, { t: 'x = 1' }] },
  { q: 'Обчисли: (−3)<sup>2</sup>', opts: [{ t: '9', ok: 1 }, { t: '−9' }, { t: '−6' }, { t: '6' }] },
  { q: '√144 = ?', opts: [{ t: '12', ok: 1 }, { t: '14' }, { t: '72' }, { t: '24' }] },
  { q: 'Знайди 25% від 80', opts: [{ t: '20', ok: 1 }, { t: '25' }, { t: '40' }, { t: '16' }] },
  { q: 'Розв’яжи: x<sup>2</sup> = 49', opts: [{ t: '±7', ok: 1 }, { t: '7' }, { t: '−7' }, { t: '±14' }] },
];

type BState = {
  bossMax: number; bossHP: number; heartsMax: number; hearts: number;
  round: number; sel: number; ans: boolean; busy: boolean; lastQ: number;
  streak: number; correct: number;
};

export default function BossBattle() {
  const router = useRouter();

  // refs to the elements the imperative logic drives (mirror of getElementById ids)
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bossRef = useRef<HTMLDivElement>(null);
  const staffOrbRef = useRef<HTMLDivElement>(null);
  const bossHpFillRef = useRef<HTMLDivElement>(null);
  const heroHpFillRef = useRef<HTMLDivElement>(null);
  const bossHpNumRef = useRef<HTMLDivElement>(null);
  const heroHeartsRef = useRef<HTMLDivElement>(null);
  const turnBannerRef = useRef<HTMLDivElement>(null);
  const bqnRef = useRef<HTMLDivElement>(null);
  const bqtextRef = useRef<HTMLDivElement>(null);
  const boptsRef = useRef<HTMLDivElement>(null);
  const bfeedbackRef = useRef<HTMLDivElement>(null);
  const bcheckRef = useRef<HTMLButtonElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const resultIconRef = useRef<HTMLDivElement>(null);
  const resultTitleRef = useRef<HTMLDivElement>(null);
  const resultSubRef = useRef<HTMLDivElement>(null);
  const resultXpRef = useRef<HTMLSpanElement>(null);

  const S = useRef<BState>({
    bossMax: 6, bossHP: 6, heartsMax: 5, hearts: 5,
    round: 0, sel: -1, ans: false, busy: false, lastQ: -1, streak: 0, correct: -1,
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // stable handler slots so the static JSX buttons always call the live closures
  const checkHandler = useRef<() => void>(() => {});
  const restartHandler = useRef<() => void>(() => {});

  useEffect(() => {
    const s = S.current;

    const bshuffle = <T,>(a: T[]): T[] => {
      a = a.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const toast = (msg: string) => {
      const t = toastRef.current;
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => t.classList.remove('show'), 1800);
    };

    const bossRenderHearts = () => {
      let h = '';
      for (let i = 0; i < s.heartsMax; i++) h += `<span class="hh${i >= s.hearts ? ' lost' : ''}">❤</span>`;
      if (heroHeartsRef.current) heroHeartsRef.current.innerHTML = h;
    };

    const bossLoadQuestion = () => {
      let idx: number;
      do { idx = (Math.random() * BOSS_QUESTIONS.length) | 0; } while (idx === s.lastQ && BOSS_QUESTIONS.length > 1);
      s.lastQ = idx; s.round++; s.sel = -1; s.ans = false;
      const Q = BOSS_QUESTIONS[idx];
      const opts = bshuffle(Q.opts);
      s.correct = opts.findIndex((o) => o.ok);
      if (bqnRef.current) bqnRef.current.textContent = 'РАУНД ' + s.round;
      if (bqtextRef.current) bqtextRef.current.innerHTML = Q.q;
      const keys = ['A', 'B', 'C', 'D'];
      if (boptsRef.current) {
        boptsRef.current.innerHTML = opts.map((o, i) =>
          `<button class="opt" data-i="${i}"><span class="key">${keys[i]}</span><span class="val">${o.t}</span></button>`).join('');
      }
      const fb = bfeedbackRef.current;
      if (fb) { fb.className = 'feedback'; fb.textContent = ''; }
      const btn = bcheckRef.current;
      if (btn) { btn.className = 'check'; btn.textContent = 'Атакувати ⚔'; btn.disabled = true; }
    };

    const bpick = (i: number) => {
      if (s.ans || s.busy) return;
      s.sel = i;
      boptsRef.current?.querySelectorAll('.opt').forEach((o) =>
        o.classList.toggle('sel', +(o as HTMLElement).dataset.i! === i));
      if (bcheckRef.current) bcheckRef.current.disabled = false;
    };

    const bStageRect = () => stageRef.current!.getBoundingClientRect();
    const bPoint = (el: HTMLElement, fx: number, fy: number) => {
      const r = el.getBoundingClientRect(), st = bStageRect();
      return { x: r.left - st.left + r.width * fx, y: r.top - st.top + r.height * fy };
    };

    const spawnGatherRing = (x: number, y: number) => {
      const st = stageRef.current!;
      const r = document.createElement('div');
      r.className = 'gather-ring'; r.style.left = x + 'px'; r.style.top = y + 'px';
      st.appendChild(r); requestAnimationFrame(() => r.classList.add('go')); setTimeout(() => r.remove(), 440);
    };
    const spawnSwingArc = (x: number, y: number) => {
      const st = stageRef.current!;
      const a = document.createElement('div');
      a.className = 'swing-arc'; a.style.left = x + 'px'; a.style.top = y + 'px';
      st.appendChild(a); requestAnimationFrame(() => a.classList.add('go')); setTimeout(() => a.remove(), 460);
    };
    const spawnMuzzle = (x: number, y: number) => {
      const st = stageRef.current!;
      const m = document.createElement('div');
      m.className = 'muzzle'; m.style.left = x + 'px'; m.style.top = y + 'px';
      st.appendChild(m); requestAnimationFrame(() => m.classList.add('go')); setTimeout(() => m.remove(), 340);
    };
    const spawnImpact = (x: number, y: number, red: boolean) => {
      const st = stageRef.current!;
      const imp = document.createElement('div');
      imp.className = 'impact' + (red ? ' red' : ''); imp.style.left = x + 'px'; imp.style.top = y + 'px';
      imp.innerHTML = '<span class="ring"></span>';
      for (let i = 0; i < 10; i++) { const sp = document.createElement('i'); sp.style.transform = 'rotate(' + i * 36 + 'deg)'; imp.appendChild(sp); }
      st.appendChild(imp); setTimeout(() => imp.remove(), 600);
    };
    const spawnDamage = (x: number, y: number, txt: string, cls: string) => {
      const st = stageRef.current!;
      const d = document.createElement('div');
      d.className = 'dmg-float ' + cls; d.style.left = x + 'px'; d.style.top = y + 'px'; d.innerHTML = txt;
      st.appendChild(d); setTimeout(() => d.remove(), 1100);
    };

    const launchBolt = (start: { x: number; y: number }, hit: { x: number; y: number }, isBoss: boolean, onHit: () => void) => {
      const st = stageRef.current!;
      const bolt = document.createElement('div');
      bolt.className = 'magic-bolt' + (isBoss ? ' boss-bolt' : '');
      const ang = Math.atan2(hit.y - start.y, hit.x - start.x) * 180 / Math.PI;
      bolt.style.transform = 'rotate(' + ang + 'deg)';
      bolt.style.left = start.x - 24 + 'px'; bolt.style.top = start.y - 24 + 'px';
      st.appendChild(bolt);
      const dur = 460, t0 = performance?.now ? performance.now() : Date.now();
      let done = false;
      const finish = () => { if (done) return; done = true; bolt.remove(); onHit(); };
      const step = (now?: number) => {
        let p = ((now || Date.now()) - t0) / dur; if (p > 1) p = 1;
        const e = 1 - Math.pow(1 - p, 1.8);
        bolt.style.left = start.x - 24 + (hit.x - start.x) * e + 'px';
        bolt.style.top = start.y - 24 + (hit.y - start.y) * e + 'px';
        if (p < 1) requestAnimationFrame(step); else finish();
      };
      requestAnimationFrame(step);
      setTimeout(finish, dur + 180);
    };

    const updateBossHP = () => {
      if (bossHpFillRef.current) bossHpFillRef.current.style.width = (s.bossHP / s.bossMax * 100) + '%';
      if (bossHpNumRef.current) bossHpNumRef.current.textContent = 'HP ' + s.bossHP + ' / ' + s.bossMax;
    };

    const showResult = (kind: 'success' | 'fail') => {
      const ov = resultRef.current, card = resultCardRef.current;
      if (!ov || !card) return;
      if (kind === 'success') {
        card.classList.remove('fail');
        if (resultIconRef.current) resultIconRef.current.textContent = '🏆';
        if (resultTitleRef.current) resultTitleRef.current.textContent = 'Перемога!';
      } else {
        card.classList.add('fail');
        if (resultIconRef.current) resultIconRef.current.textContent = '💀';
        if (resultTitleRef.current) resultTitleRef.current.textContent = 'Поразка';
      }
      ov.classList.add('show');
    };

    const bossWin = () => {
      s.busy = true;
      bossRef.current?.classList.add('dead');
      const banner = turnBannerRef.current!;
      banner.textContent = '✦ СТРАЖА РОЗВІЯНО! ✦'; banner.className = 'turn-banner show';
      const st = bStageRect();
      for (let i = 0; i < 12; i++) {
        setTimeout(() => spawnImpact(st.width * (0.55 + Math.random() * 0.35), st.height * (0.25 + Math.random() * 0.45), false), i * 80);
      }
      setTimeout(() => {
        if (resultSubRef.current) resultSubRef.current.textContent = 'Прадавнього Стража Рун переможено!';
        if (resultXpRef.current) resultXpRef.current.textContent = '120';
        showResult('success'); banner.className = 'turn-banner';
      }, 1500);
    };

    const bossLose = () => {
      s.busy = true;
      heroRef.current?.classList.add('dead');
      const banner = turnBannerRef.current!;
      banner.textContent = '☠ ГЕРОЯ ПОДОЛАНО...'; banner.className = 'turn-banner bad show';
      setTimeout(() => {
        if (resultSubRef.current) resultSubRef.current.textContent = 'Страж виявився надто сильним. Спробуй ще!';
        if (resultXpRef.current) resultXpRef.current.textContent = '0';
        showResult('fail'); banner.className = 'turn-banner bad';
      }, 1250);
    };

    const bossTurnEnd = () => {
      if (s.bossHP <= 0) { bossWin(); return; }
      if (s.hearts <= 0) { bossLose(); return; }
      s.busy = false; bossLoadQuestion();
    };

    const heroAttackSeq = () => {
      const hero = heroRef.current!, boss = bossRef.current!, stage = stageRef.current!, orb = staffOrbRef.current!;
      hero.classList.remove('strike');
      hero.classList.add('windup');
      toast('⚡ Замах посохом!');
      const g0 = bPoint(orb, 0.5, 0.5); spawnGatherRing(g0.x, g0.y);
      setTimeout(() => {
        hero.classList.remove('windup');
        hero.classList.add('strike');
        const s0 = bPoint(orb, 0.5, 0.5);
        spawnSwingArc(s0.x, s0.y);
      }, 430);
      setTimeout(() => {
        const start = bPoint(orb, 0.5, 0.5);
        start.x += 18; start.y += 2;
        const hit = bPoint(boss, 0.5, 0.52);
        spawnMuzzle(start.x, start.y);
        launchBolt(start, hit, false, () => {
          spawnImpact(hit.x, hit.y, false);
          boss.classList.add('hit');
          stage.classList.add('shake', 'flash-teal');
          setTimeout(() => stage.classList.remove('shake', 'flash-teal'), 460);
          setTimeout(() => boss.classList.remove('hit'), 560);
          const crit = s.streak >= 3;
          s.bossHP = Math.max(0, s.bossHP - (crit ? 2 : 1));
          updateBossHP();
          spawnDamage(hit.x, hit.y - 24, crit ? 'КРИТ! −2' : '−1', 'dmg' + (crit ? ' crit' : ''));
          setTimeout(bossTurnEnd, 700);
        });
      }, 628);
      setTimeout(() => { hero.classList.remove('strike'); }, 1090);
    };

    const bossAttackSeq = () => {
      const hero = heroRef.current!, boss = bossRef.current!, stage = stageRef.current!;
      boss.classList.add('attack');
      setTimeout(() => {
        const start = bPoint(boss, 0.5, 0.5);
        const hit = bPoint(hero, 0.5, 0.42);
        launchBolt(start, hit, true, () => {
          spawnImpact(hit.x, hit.y, true);
          hero.classList.add('hurt');
          stage.classList.add('shake', 'flash-red');
          setTimeout(() => stage.classList.remove('shake', 'flash-red'), 460);
          setTimeout(() => hero.classList.remove('hurt'), 560);
          s.hearts = Math.max(0, s.hearts - 1);
          bossRenderHearts();
          if (heroHpFillRef.current) heroHpFillRef.current.style.width = (s.hearts / s.heartsMax * 100) + '%';
          spawnDamage(hit.x, hit.y - 28, '−1 ❤', 'heal-miss');
          toast('💥 −1 серце!');
          setTimeout(bossTurnEnd, 700);
        });
      }, 300);
      setTimeout(() => boss.classList.remove('attack'), 660);
    };

    const bossCheck = () => {
      if (s.ans || s.busy || s.sel < 0) return;
      s.ans = true; s.busy = true;
      const opts = boptsRef.current!.querySelectorAll('.opt');
      opts.forEach((o) => o.classList.add('disabled'));
      opts[s.correct].classList.add('correct');
      if (bcheckRef.current) bcheckRef.current.disabled = true;
      const fb = bfeedbackRef.current!;
      if (s.sel === s.correct) {
        s.streak++;
        fb.className = 'feedback show good'; fb.textContent = '✓ Влучне закляття! Страж отримує удар.';
        heroAttackSeq();
      } else {
        s.streak = 0;
        opts[s.sel].classList.add('wrong');
        fb.className = 'feedback show bad'; fb.textContent = '✗ Страж відбив закляття і завдав удару у відповідь!';
        bossAttackSeq();
      }
    };

    const openBoss = () => {
      S.current = { bossMax: 6, bossHP: 6, heartsMax: 5, hearts: 5, round: 0, sel: -1, ans: false, busy: false, lastQ: -1, streak: 0, correct: -1 };
      Object.assign(s, S.current);
      bossRef.current!.className = 'fighter boss-fighter';
      heroRef.current!.className = 'fighter hero-fighter';
      bossHpFillRef.current!.style.width = '100%';
      heroHpFillRef.current!.style.width = '100%';
      bossHpNumRef.current!.textContent = 'HP 6 / 6';
      turnBannerRef.current!.className = 'turn-banner';
      resultRef.current?.classList.remove('show');
      bossRenderHearts();
      bossLoadQuestion();
    };

    // option click delegation (opts are (re)built imperatively)
    const optsEl = boptsRef.current;
    const onOptsClick = (e: Event) => {
      const btn = (e.target as HTMLElement).closest('.opt') as HTMLElement | null;
      if (btn?.dataset.i != null) bpick(+btn.dataset.i);
    };
    optsEl?.addEventListener('click', onOptsClick);

    // expose current handlers to the static buttons via refs
    checkHandler.current = bossCheck;
    restartHandler.current = openBoss;

    openBoss();

    return () => {
      optsEl?.removeEventListener('click', onOptsClick);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const goBack = () => router.back();

  return (
    <div className="boss-screen">
      <div className="sky" />
      <div className="aurora a1" />
      <div className="aurora a2" />

      <div className="boss-view">
        <div className="battle-top">
          <button className="qx" onClick={goBack} aria-label="Вийти">✕</button>
          <div className="lvl-tag"><span className="sk">☠</span> ФІНАЛЬНЕ ВИПРОБУВАННЯ · ЧИСЛА І ДІЇ</div>
        </div>

        <div className="combatants">
          <div className="cbt hero">
            <div className="cbt-name"><span className="badge">ГЕРОЙ</span> Чарівниця Рун</div>
            <div className="hp-bar"><div className="fill" ref={heroHpFillRef} style={{ width: '100%' }} /></div>
            <div className="hero-hearts" ref={heroHeartsRef} />
          </div>
          <div className="cbt boss">
            <div className="cbt-name">Прадавній Страж Рун <span className="badge">БОС</span></div>
            <div className="hp-bar"><div className="fill" ref={bossHpFillRef} style={{ width: '100%' }} /></div>
            <div className="hp-num" ref={bossHpNumRef}>HP 6 / 6</div>
          </div>
        </div>

        <div className="battle-stage" ref={stageRef}>
          <div className="bs-sky" />
          <div className="bs-aurora" />
          <div className="bs-moon" />
          <span className="bs-star" style={{ top: '12%', left: '30%', width: 3, height: 3 }} />
          <span className="bs-star" style={{ top: '22%', left: '66%', width: 2, height: 2, animationDelay: '.7s' }} />
          <span className="bs-star" style={{ top: '8%', left: '48%', width: 2, height: 2, animationDelay: '1.4s' }} />
          <span className="bs-star" style={{ top: '30%', left: '22%', width: 2, height: 2, animationDelay: '2.1s' }} />
          <span className="bs-star" style={{ top: '16%', left: '80%', width: 2, height: 2, animationDelay: '2.8s' }} />
          <svg className="bs-castle" viewBox="0 0 120 90" fill="none">
            <g fill="#16294a" stroke="#2c4a78" strokeWidth="1.1">
              <rect x="18" y="42" width="12" height="46" /><rect x="90" y="42" width="12" height="46" />
              <rect x="40" y="32" width="14" height="56" /><rect x="66" y="32" width="14" height="56" />
              <rect x="52" y="18" width="16" height="70" />
              <path d="M18 42 l6 -12 6 12z M90 42 l6 -12 6 12z M40 32 l7 -14 7 14z M66 32 l7 -14 7 14z M52 18 l8 -16 8 16z" />
            </g>
            <g fill="#f7d98a" opacity=".85"><rect x="57" y="42" width="6" height="9" /><rect x="44" y="48" width="5" height="8" /><rect x="71" y="48" width="5" height="8" /></g>
          </svg>
          <div className="bs-mtn" />
          <div className="bs-ground" />
          <span className="bs-spark" style={{ left: '18%', animationDuration: '6s' }} />
          <span className="bs-spark" style={{ left: '40%', animationDuration: '7.5s', animationDelay: '2s' }} />
          <span className="bs-spark" style={{ left: '70%', animationDuration: '6.8s', animationDelay: '1s' }} />
          <span className="bs-spark" style={{ left: '88%', animationDuration: '8s', animationDelay: '3s' }} />
          <div className="turn-banner" ref={turnBannerRef} />

          <div className="fighter hero-fighter" ref={heroRef}>
            <div className="staff-orb" ref={staffOrbRef} />
            <img className="fighter-img" alt="Чарівниця Рун" src="/boss/hero.png" />
          </div>
          <div className="fighter boss-fighter" ref={bossRef}>
            <img className="fighter-img" alt="Прадавній Страж Рун" src="/boss/boss.svg" />
          </div>
        </div>

        <div className="glass qcard">
          <div className="qn" ref={bqnRef}>РАУНД 1</div>
          <div className="qtext" ref={bqtextRef}>—</div>
        </div>
        <div className="opts" ref={boptsRef} />
        <div className="feedback" ref={bfeedbackRef} />
        <button className="check" ref={bcheckRef} disabled onClick={() => checkHandler.current()}>Атакувати ⚔</button>
      </div>

      <div className="toast" ref={toastRef} />

      <div className="result-overlay" ref={resultRef}>
        <div className="result-card" ref={resultCardRef}>
          <div className="result-icon" ref={resultIconRef}>🏆</div>
          <div className="result-title" ref={resultTitleRef}>Перемога!</div>
          <div className="result-sub" ref={resultSubRef} />
          <div className="result-xp">✦ +<span ref={resultXpRef}>120</span> XP</div>
          <button className="result-btn" onClick={() => restartHandler.current()}>Битися знову</button>
          <button className="result-btn" onClick={goBack}>На карту</button>
        </div>
      </div>
    </div>
  );
}
