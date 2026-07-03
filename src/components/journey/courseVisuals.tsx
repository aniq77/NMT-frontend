import type { ReactNode } from "react";

/** Maps a course subject to the mockup's colour class + emblem SVG. */
export function subjectVisual(subject: string): { cls: string; emblem: ReactNode } {
  const s = subject.toLowerCase();

  if (s.includes("матем") || s.includes("алгебр") || s.includes("геометр")) {
    return {
      cls: "c-math",
      emblem: (
        <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
          <path d="M10 15 L20 15 M12.5 15 L12 26 M17.5 15 L17.5 24 C17.5 26 19 26 20 25" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="33" cy="14" r="1.7" fill="#fff" /><line x1="27" y1="19" x2="39" y2="19" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /><circle cx="33" cy="24" r="1.7" fill="#fff" />
          <line x1="14" y1="31" x2="14" y2="39" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /><line x1="10" y1="35" x2="18" y2="35" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="29" y1="31" x2="37" y2="39" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /><line x1="37" y1="31" x2="29" y2="39" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      ),
    };
  }
  if (s.includes("укр") || s.includes("мова") || s.includes("літератур")) {
    return {
      cls: "c-ukr",
      emblem: (
        <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
          <rect x="8" y="10" width="16" height="30" rx="2" fill="rgba(255,255,255,.5)" /><rect x="24" y="10" width="16" height="30" rx="2" fill="rgba(255,255,255,.65)" /><rect x="22" y="9" width="4" height="32" rx="2" fill="rgba(255,255,255,.35)" />
          <line x1="27" y1="17" x2="36" y2="17" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round" /><line x1="27" y1="21" x2="36" y2="21" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round" /><line x1="27" y1="25" x2="33" y2="25" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    };
  }
  if (s.includes("істор")) {
    return {
      cls: "c-hist",
      emblem: (
        <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
          <rect x="6" y="38" width="36" height="4" rx="2" fill="rgba(255,255,255,.7)" /><rect x="6" y="10" width="36" height="4" rx="2" fill="rgba(255,255,255,.7)" />
          <rect x="8" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" /><rect x="17" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" /><rect x="26" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" /><rect x="35" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" />
        </svg>
      ),
    };
  }
  if (s.includes("біолог") || s.includes("біо")) {
    return {
      cls: "c-bio",
      emblem: (
        <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
          <path d="M24 8 C10 8 8 24 14 34 C18 40 24 42 24 42 C24 42 30 40 34 34 C40 24 38 8 24 8Z" fill="rgba(255,255,255,.6)" />
          <path d="M24 8 C24 8 26 20 22 34" stroke="rgba(255,255,255,.35)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    };
  }
  if (s.includes("фізик") || s.includes("фіз")) {
    return {
      cls: "c-phys",
      emblem: (
        <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
          <path d="M28 6 L14 26 L22 26 L18 44 L36 20 L27 20 Z" fill="rgba(255,255,255,.75)" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    };
  }
  return {
    cls: "c-math",
    emblem: (
      <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
        <path d="M12 10h24v28H12z" fill="rgba(255,255,255,.5)" /><path d="M17 18h14M17 24h14M17 30h9" stroke="rgba(255,255,255,.8)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  };
}
