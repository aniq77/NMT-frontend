"use client";
import { useSyncExternalStore } from "react";

type Star = { left: string; top: string; r: string; o: string; twinkle: boolean; dur: string };
type Spore = { left: string; size: string; dur: string; delay: string };

// Generated once at module scope (outside React's render) so Math.random() is
// never called during render. Rendering is gated on the client (see useIsClient)
// so these never appear in the SSR/hydration output — avoiding a hydration mismatch.
const STARS: Star[] = Array.from({ length: 90 }, () => {
  const o = Math.random() * 0.7 + 0.2;
  return {
    left: (Math.random() * 100).toFixed(2),
    top: (Math.random() * 85).toFixed(2),
    r: (Math.random() * 1.4 + 0.3).toFixed(1),
    o: o.toFixed(2),
    twinkle: Math.random() < 0.25,
    dur: (2 + Math.random() * 3).toFixed(1),
  };
});

const SPORES: Spore[] = Array.from({ length: 18 }, () => {
  const dur = 10 + Math.random() * 16;
  const size = 4 + Math.random() * 5;
  return {
    left: (Math.random() * 100).toFixed(2),
    size: size.toFixed(1),
    dur: dur.toFixed(1),
    delay: (-Math.random() * dur).toFixed(1),
  };
});

const emptySubscribe = () => () => {};
/** false during SSR and the hydration render, true afterwards — no setState-in-effect. */
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Fixed night-scene background (moon + drifting clouds + scenery islands +
 * twinkling stars + rising fireflies), ported verbatim from the mockup so app
 * views match the dark design.
 */
export function NightSky() {
  const isClient = useIsClient();
  const stars = isClient ? STARS : [];
  const spores = isClient ? SPORES : [];

  return (
    <>
      <div className="moon" />
      <svg className="stars" width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.left}%`} cy={`${s.top}%`} r={s.r} fill="#fff" opacity={s.o}>
            {s.twinkle && (
              <animate
                attributeName="opacity"
                values={`${s.o};0.1;${s.o}`}
                dur={`${s.dur}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
      </svg>
      <div className="cloud c1" />
      <div className="cloud c2" />
      <div className="scenery" aria-hidden>
        <div className="island" style={{ left: "4%", top: "64%", width: 160, height: 54, background: "linear-gradient(180deg,#1f7a55,#0e3326)" }} />
        <div className="island" style={{ right: "5%", top: "56%", width: 120, height: 42, background: "linear-gradient(180deg,#1f5f74,#0e2f3e)" }} />
        <div className="island" style={{ left: "15%", top: "32%", width: 90, height: 30, background: "linear-gradient(180deg,#2a6f5a,#143a30)", opacity: 0.6 }} />
      </div>
      <div className="particles" aria-hidden>
        {spores.map((sp, i) => (
          <span
            key={i}
            className="spore"
            style={{
              left: `${sp.left}vw`,
              width: `${sp.size}px`,
              height: `${sp.size}px`,
              animationDuration: `${sp.dur}s`,
              animationDelay: `${sp.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
