import type { Metadata } from "next";
import { AppHud } from "@/components/layout/AppHud";
import { BottomNav } from "@/components/layout/BottomNav";
import { NightSky } from "@/components/layout/NightSky";
import "../journey/game-mockup.css";
import "../journey/game-app-light.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="game-app" style={{ minHeight: "100dvh" }}>
      <div className="sky" />
      <div className="aurora a1" />
      <div className="aurora a2" />
      <NightSky />
      <AppHud />
      <main className="app" style={{ paddingBottom: 96 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
