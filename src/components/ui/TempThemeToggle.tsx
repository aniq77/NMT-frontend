"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * TEMPORARY tiny theme switch (🌙 / ☀️).
 *
 * The new game-app design has no theme control yet, but main already ships a
 * working light/dark system (next-themes). This button reuses that exact
 * mechanism (`useTheme`/`setTheme`) so the switcher isn't lost after merge —
 * it does NOT introduce a new theme system, a new light theme, or any CSS.
 *
 * It is inline-styled and absolutely positioned inside the (position:relative)
 * profile banner, so it overlays a free corner without touching or reflowing
 * any existing element. Replace with the real theme control once the design
 * port is complete.
 */
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
      aria-label="Перемкнути тему"
      title="Перемкнути тему (тимчасово)"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 2,
        width: 30,
        height: 30,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontSize: 14,
        lineHeight: 1,
        cursor: "pointer",
        background: "rgba(255,255,255,.08)",
        border: "1px solid rgba(255,255,255,.16)",
        WebkitBackdropFilter: "blur(4px)",
        backdropFilter: "blur(4px)",
      }}
    >
      {mounted ? (isDark ? "🌙" : "☀️") : "🌙"}
    </button>
  );
}
