// Fixed decorative background. Light = "magical world" (sky + rays + clouds),
// dark = "magical night" (aurora + moon + stars + fireflies).
// Theme is switched purely via CSS on [data-theme] so there is no hydration flash.

// Deterministic positions (no Math.random → SSR-safe).
const STARS = [
  { top: "12%", left: "18%", s: 2 }, { top: "8%", left: "62%", s: 3 },
  { top: "22%", left: "82%", s: 2 }, { top: "30%", left: "40%", s: 2 },
  { top: "16%", left: "92%", s: 3 }, { top: "44%", left: "8%", s: 2 },
  { top: "38%", left: "70%", s: 2 }, { top: "54%", left: "30%", s: 3 },
  { top: "60%", left: "88%", s: 2 }, { top: "70%", left: "14%", s: 2 },
  { top: "26%", left: "55%", s: 2 }, { top: "48%", left: "48%", s: 3 },
];

const FIREFLIES = [
  { left: "10%", size: 5, dur: 14, delay: 0 }, { left: "26%", size: 7, dur: 19, delay: 3 },
  { left: "44%", size: 4, dur: 22, delay: 1 }, { left: "62%", size: 6, dur: 16, delay: 5 },
  { left: "78%", size: 5, dur: 24, delay: 2 }, { left: "90%", size: 7, dur: 18, delay: 4 },
];

export function MagicalBackground() {
  return (
    <div className="bg-decor pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* ── Light: magical world ── */}
      <div className="light-only">
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
              "conic-gradient(from 200deg at 80% 12%, transparent 0deg, rgba(255,228,160,.18) 8deg, transparent 16deg, rgba(255,228,160,.13) 26deg, transparent 36deg, rgba(255,228,160,.16) 48deg, transparent 60deg)",
          }}
        />
        {/* drifting clouds */}
        <div
          className="absolute"
          style={{
            top: "12vh",
            width: 180,
            height: 80,
            borderRadius: "50%",
            filter: "blur(1px)",
            opacity: 0.8,
            background:
              "radial-gradient(closest-side,rgba(255,255,255,.95),rgba(255,255,255,.6) 70%,transparent)",
            boxShadow:
              "54px 16px 0 -8px rgba(255,255,255,.8),108px 0 0 -16px rgba(255,255,255,.75),-46px 14px 0 -10px rgba(255,255,255,.75)",
            animation: "drift 80s linear infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "46vh",
            width: 240,
            height: 96,
            borderRadius: "50%",
            filter: "blur(1px)",
            opacity: 0.75,
            background:
              "radial-gradient(closest-side,rgba(255,255,255,.95),rgba(255,255,255,.6) 70%,transparent)",
            boxShadow:
              "54px 16px 0 -8px rgba(255,255,255,.8),108px 0 0 -16px rgba(255,255,255,.75),-46px 14px 0 -10px rgba(255,255,255,.75)",
            animation: "driftR 110s linear infinite",
          }}
        />
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
            opacity: 0.5,
            mixBlendMode: "screen",
            background:
              "radial-gradient(60% 40% at 30% 30%,rgba(51,214,194,.55),transparent 70%)",
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
            background:
              "radial-gradient(50% 40% at 70% 20%,rgba(155,140,255,.45),transparent 70%)",
            animation: "aurora2 22s ease-in-out infinite",
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
