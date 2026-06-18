// Fixed decorative background. Light = "magical world" (sky + sun + rays + clouds
// + drifting knowledge words), dark = "magical night" (aurora + moon + stars +
// shooting stars + glowing islands + fireflies). Theme switches purely via CSS on
// [data-theme] so there is no hydration flash.

// Deterministic data (no Math.random → SSR-safe).
const STARS = [
  { top: "10%", left: "16%", s: 2 }, { top: "7%", left: "60%", s: 3 },
  { top: "20%", left: "82%", s: 2 }, { top: "28%", left: "38%", s: 2 },
  { top: "14%", left: "92%", s: 3 }, { top: "42%", left: "8%", s: 2 },
  { top: "36%", left: "70%", s: 2 }, { top: "52%", left: "28%", s: 3 },
  { top: "58%", left: "88%", s: 2 }, { top: "68%", left: "14%", s: 2 },
  { top: "24%", left: "52%", s: 2 }, { top: "46%", left: "46%", s: 3 },
  { top: "12%", left: "34%", s: 2 }, { top: "33%", left: "20%", s: 2 },
  { top: "62%", left: "62%", s: 3 }, { top: "18%", left: "74%", s: 2 },
  { top: "50%", left: "76%", s: 2 }, { top: "9%", left: "44%", s: 2 },
];

const FIREFLIES = [
  { left: "10%", size: 5, dur: 14, delay: 0 }, { left: "26%", size: 7, dur: 19, delay: 3 },
  { left: "44%", size: 4, dur: 22, delay: 1 }, { left: "62%", size: 6, dur: 16, delay: 5 },
  { left: "78%", size: 5, dur: 24, delay: 2 }, { left: "90%", size: 7, dur: 18, delay: 4 },
];

const SHOOTING = [
  { top: "12%", left: "78%", dur: 7, delay: 2 },
  { top: "30%", left: "92%", dur: 9, delay: 6 },
  { top: "8%", left: "50%", dur: 8, delay: 11 },
];

// Drifting "knowledge" glyphs for the light theme.
const WORDS = [
  { t: "x²", top: "16%", dur: 64, dir: "swayX", color: "rgba(54,100,150,.5)" },
  { t: "π", top: "30%", dur: 82, dir: "swayXr", color: "rgba(28,90,82,.5)" },
  { t: "√2", top: "44%", dur: 72, dir: "swayX", color: "rgba(130,80,36,.45)" },
  { t: "Київ", top: "22%", dur: 92, dir: "swayXr", color: "rgba(130,80,36,.42)" },
  { t: "ДНК", top: "54%", dur: 78, dir: "swayX", color: "rgba(28,90,82,.45)" },
  { t: "H₂O", top: "38%", dur: 96, dir: "swayXr", color: "rgba(54,100,150,.42)" },
  { t: "∫", top: "62%", dur: 70, dir: "swayX", color: "rgba(54,100,150,.5)" },
];

export function MagicalBackground() {
  return (
    <div className="bg-decor pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* ── Light: magical world ── */}
      <div className="light-only">
        {/* warm sun orb */}
        <div
          className="absolute"
          style={{
            top: "-8vh",
            right: "-6vw",
            width: 260,
            height: 260,
            borderRadius: "50%",
            filter: "blur(8px)",
            background: "radial-gradient(circle at 50% 50%,rgba(255,233,170,.95),rgba(255,209,138,.5) 45%,transparent 70%)",
            animation: "pulseGlow 9s ease-in-out infinite",
          }}
        />
        {/* sun rays */}
        <div
          className="absolute"
          style={{
            top: "-15%",
            right: "-10%",
            width: "70vw",
            height: "120vh",
            mixBlendMode: "screen",
            transformOrigin: "80% 12%",
            animation: "spin8 50s linear infinite",
            background:
              "conic-gradient(from 200deg at 80% 12%, transparent 0deg, rgba(255,228,160,.2) 8deg, transparent 16deg, rgba(255,228,160,.14) 26deg, transparent 36deg, rgba(255,228,160,.17) 48deg, transparent 60deg)",
          }}
        />
        {/* drifting clouds */}
        {[
          { top: "12vh", w: 180, h: 80, op: 0.8, anim: "drift 80s linear infinite" },
          { top: "46vh", w: 240, h: 96, op: 0.75, anim: "driftR 110s linear infinite" },
          { top: "72vh", w: 150, h: 64, op: 0.6, anim: "drift 130s linear infinite" },
        ].map((c, i) => (
          <div
            key={`cloud-${i}`}
            className="absolute"
            style={{
              top: c.top,
              width: c.w,
              height: c.h,
              borderRadius: "50%",
              filter: "blur(1px)",
              opacity: c.op,
              background:
                "radial-gradient(closest-side,rgba(255,255,255,.95),rgba(255,255,255,.6) 70%,transparent)",
              boxShadow:
                "54px 16px 0 -8px rgba(255,255,255,.8),108px 0 0 -16px rgba(255,255,255,.75),-46px 14px 0 -10px rgba(255,255,255,.75)",
              animation: c.anim,
            }}
          />
        ))}
        {/* drifting knowledge glyphs */}
        {WORDS.map((w, i) => (
          <span
            key={`word-${i}`}
            className="absolute font-display font-700"
            style={{
              top: w.top,
              left: 0,
              fontSize: 26 + (i % 3) * 6,
              color: w.color,
              textShadow: "0 1px 8px rgba(255,255,255,.9)",
              whiteSpace: "nowrap",
              animation: `${w.dir} ${w.dur}s linear ${i * -8}s infinite`,
            }}
          >
            <span style={{ display: "inline-block", animation: `floaty ${5 + (i % 3)}s ease-in-out infinite` }}>
              {w.t}
            </span>
          </span>
        ))}
      </div>

      {/* ── Dark: magical night ── */}
      <div className="dark-only">
        {/* aurora ribbons */}
        <div
          className="absolute"
          style={{
            inset: "-10% 0 auto 0",
            height: "70vh",
            filter: "blur(46px)",
            opacity: 0.55,
            mixBlendMode: "screen",
            background: "radial-gradient(60% 40% at 30% 30%,rgba(51,214,194,.6),transparent 70%)",
            animation: "aurora1 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            inset: "-10% 0 auto 0",
            height: "70vh",
            filter: "blur(46px)",
            opacity: 0.5,
            mixBlendMode: "screen",
            background: "radial-gradient(50% 40% at 70% 20%,rgba(155,140,255,.5),transparent 70%)",
            animation: "aurora2 22s ease-in-out infinite",
          }}
        />
        {/* moon halo */}
        <div
          className="absolute"
          style={{
            top: "1vh",
            right: "3vw",
            width: 240,
            height: 240,
            borderRadius: "50%",
            filter: "blur(10px)",
            background: "radial-gradient(circle,rgba(190,210,255,.35),transparent 65%)",
            animation: "pulseGlow 11s ease-in-out infinite",
          }}
        />
        {/* moon */}
        <div
          className="absolute"
          style={{
            top: "7vh",
            right: "9vw",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle at 38% 34%,#fff,#dfe9ff 60%,#bcd0ff)",
            boxShadow:
              "0 0 60px 20px rgba(190,210,255,.35),inset -14px -10px 0 -6px rgba(120,150,210,.4)",
          }}
        />
        {/* glowing distant islands */}
        <div
          className="absolute"
          style={{
            bottom: "8vh",
            left: "-4vw",
            width: 220,
            height: 90,
            borderRadius: "50% 50% 46% 54% / 70% 70% 30% 30%",
            background: "linear-gradient(180deg,#13564a,#0c3330)",
            boxShadow: "0 0 50px -8px rgba(51,214,194,.45)",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "4vh",
            right: "-6vw",
            width: 260,
            height: 80,
            borderRadius: "50% 50% 46% 54% / 70% 70% 30% 30%",
            background: "linear-gradient(180deg,#123a52,#0b2436)",
            boxShadow: "0 0 50px -8px rgba(92,220,239,.4)",
            opacity: 0.55,
          }}
        />
        {/* stars */}
        {STARS.map((st, i) => (
          <span
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              top: st.top,
              left: st.left,
              width: st.s,
              height: st.s,
              background: "#eaf2ff",
              boxShadow: "0 0 6px 1px rgba(190,210,255,.7)",
              animation: `twinkle ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}
        {/* shooting stars */}
        {SHOOTING.map((sh, i) => (
          <span
            key={`shoot-${i}`}
            className="absolute"
            style={{
              top: sh.top,
              left: sh.left,
              width: 90,
              height: 2,
              borderRadius: 2,
              background: "linear-gradient(90deg,rgba(255,255,255,.9),transparent)",
              boxShadow: "0 0 8px 1px rgba(190,220,255,.7)",
              opacity: 0,
              animation: `shoot ${sh.dur}s ease-in ${sh.delay}s infinite`,
            }}
          />
        ))}
        {/* fireflies */}
        {FIREFLIES.map((f, i) => (
          <span
            key={`fly-${i}`}
            className="absolute rounded-full"
            style={{
              bottom: -10,
              left: f.left,
              width: f.size,
              height: f.size,
              background: "radial-gradient(closest-side,#fff8d0,rgba(255,210,122,.4))",
              boxShadow: "0 0 12px 3px rgba(255,210,122,.7)",
              animation: `rise ${f.dur}s linear ${f.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
