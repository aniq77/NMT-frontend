"use client";
import { useAuthStore } from "@/store/auth.store";

/** Top HUD (crest + streak/gems/energy) in the mockup's night style, real user data. */
export function AppHud() {
  const user = useAuthStore((s) => s.user);
  const streak = user?.streak_days ?? 0;
  const gems = user?.gems ?? 0;
  const energy = user?.energy ?? 0;

  return (
    <header className="hud">
      <div className="brand">
        <svg className="crest" viewBox="0 0 48 48" fill="none">
          <path d="M24 3l5 6 8-1-1 8 6 5-6 5 1 8-8-1-5 6-5-6-8 1 1-8-6-5 6-5-1-8 8 1 5-6z" fill="#33d6c2" stroke="#0f7a70" strokeWidth="1.4" />
          <path d="M16 26l5 5 11-13" stroke="#06221f" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <b>NMT&nbsp;JOURNEY</b>
      </div>
      <div className="hud-stats">
        <div className="pill flame">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 2 C12 2 6 6.5 6 13 C6 17.5 8.7 21 12 21 C15.3 21 18 17.5 18 13 C18 10.5 16.5 8.5 16.5 8.5 C16.5 10.5 14.5 11.5 14.5 9 C14.5 5.5 12 2 12 2Z" fill="#ff7a3c" /><path d="M12 9 C12 9 9 11.5 9 15 C9 17.2 10.3 19 12 19 C13.7 19 15 17.2 15 15 C15 13 13.5 12 13.5 12 C13.5 13.5 12 13.8 12 12 C12 10.5 12 9 12 9Z" fill="#ffc93c" /></svg>
          <span>{streak}</span>
        </div>
        <div className="pill gem">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12l4 6-10 12L2 9z" /></svg>
          <span>{gems}</span>
        </div>
        <div className="pill xp">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7z" /></svg>
          <span>{energy}</span>
        </div>
      </div>
    </header>
  );
}
