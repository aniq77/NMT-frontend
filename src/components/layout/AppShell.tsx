"use client";
import { usePathname } from "@/lib/navigation";
import { AppHud } from "@/components/layout/AppHud";
import { BottomNav } from "@/components/layout/BottomNav";
import { NightSky } from "@/components/layout/NightSky";

/**
 * Only Home/Profile/Leaderboard use the game-app design; the other (app)
 * routes (quests, shop, friends, pvp, achievements, avatar, subscription) are
 * main's Tailwind pages that bring their own full-page `min-h-screen bg-canvas`
 * layout. Wrapping those in the game-app shell (the constrained `.app`
 * container + AppHud + night scene) breaks their layout — so give them a bare
 * shell. They stay inside `.game-app` only so the fixed bottom `.dock` nav
 * (styled via `.game-app .dock`) keeps its styling.
 */
const GAME_APP_ROUTES = ["/home", "/profile", "/leaderboard"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGameApp = GAME_APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (!isGameApp) {
    return (
      <div className="game-app" style={{ minHeight: "100dvh" }}>
        {children}
        <BottomNav />
      </div>
    );
  }

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
