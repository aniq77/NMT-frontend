"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Round moon/sun theme switch that lives in the profile banner corner.
 *
 * The new game-app design has no theme control yet, but main already ships a
 * working light/dark system (next-themes). This button reuses that exact
 * mechanism (`useTheme`/`setTheme`) so the switcher isn't lost after merge —
 * it does NOT introduce a new theme system, a new light theme, or any CSS.
 *
 * It is inline-styled and absolutely positioned inside the (position:relative)
 * profile banner, so it overlays a free corner without touching or reflowing
 * any existing element. Styled with the game-app glass tokens so it stays
 * visible in both themes.
 */
const MoonIcon = (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8z" />
  </svg>
);
const SunIcon = (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export function TempThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes is client-only; read the theme after mount to avoid a
  // hydration mismatch (same pattern as main's ThemeToggle).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme !== "light" : true;

  return (
    <button
      type="button"
      aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
      title="Перемкнути тему"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        position: "absolute",
        top: 14,
        right: 14,
        zIndex: 2,
        width: 38,
        height: 38,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        color: "var(--ink-soft)",
        background: "var(--glass)",
        border: "1.5px solid var(--glass-line)",
        WebkitBackdropFilter: "blur(8px)",
        backdropFilter: "blur(8px)",
      }}
    >
      {isDark ? MoonIcon : SunIcon}
    </button>
  );
}
