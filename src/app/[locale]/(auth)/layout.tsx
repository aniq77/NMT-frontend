import { NightSky } from "@/components/layout/NightSky";
import "../journey/game-mockup.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="game-app" style={{ minHeight: "100dvh" }}>
      <div className="sky" />
      <div className="aurora a1" />
      <div className="aurora a2" />
      <NightSky />
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          padding: "24px 0",
        }}
      >
        <div className="auth-card">
          <div className="auth-logo">
            <svg viewBox="0 0 48 48" fill="none">
              <path
                d="M24 3l5 6 8-1-1 8 6 5-6 5 1 8-8-1-5 6-5-6-8 1 1-8-6-5 6-5-1-8 8 1 5-6z"
                fill="rgba(255,255,255,.2)"
                stroke="rgba(255,255,255,.5)"
                strokeWidth="1.4"
              />
              <path
                d="M16 26l5 5 11-13"
                stroke="#06221f"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="auth-title">NMT Journey</div>
          <div className="auth-sub">Підготовка до НМТ — просто і цікаво</div>
          {children}
        </div>
      </div>
    </div>
  );
}
