"use client";
import type { ReactNode } from "react";
import { NightSky } from "@/components/layout/NightSky";
import { BottomNav } from "@/components/layout/BottomNav";
import "../../app/[locale]/journey/game-mockup.css";
import "../../app/[locale]/journey/game-app-light.css";

/**
 * Standalone game-app shell for routes that live OUTSIDE the (app) group and
 * therefore don't get AppShell (the course drill-down flow: subjects, islands,
 * lesson path). Mirrors AppShell's game-app branch — the night background plus
 * the `.app` phone container — so these screens match the mockup. `dock` keeps
 * the fixed bottom nav; disable it on immersive screens (quiz/boss).
 */
export function GameScreen({ children, dock = true }: { children: ReactNode; dock?: boolean }) {
  return (
    <div className="game-app" style={{ minHeight: "100dvh" }}>
      <div className="sky" />
      <div className="aurora a1" />
      <div className="aurora a2" />
      <NightSky />
      <main className="app" style={{ paddingBottom: dock ? 96 : 28 }}>
        {children}
      </main>
      {dock && <BottomNav />}
    </div>
  );
}
