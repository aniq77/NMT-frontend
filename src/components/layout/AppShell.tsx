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

// Reskinned pages that render their OWN full game-app shell via <GameScreen>
// (night background + `.app` container + `.dock`). AppShell must not wrap them,
// or they'd get a second dock / background.
const SELF_SHELLED_ROUTES = ["/quests", "/shop", "/friends", "/pvp"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGameApp = GAME_APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isSelfShelled = SELF_SHELLED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  if (isSelfShelled) {
    // The page owns its shell (GameScreen). Render it as-is.
    return <>{children}</>;
  }

  if (!isGameApp) {
    // Render Tailwind pages OUTSIDE `.game-app`: its universal reset
    // (`.game-app * { margin:0; padding:0 }`) would otherwise override Tailwind
    // utilities like `mx-auto`/`px-*` and break centering + spacing. The dock
    // keeps a minimal `.game-app` ancestor only so its scoped styles apply.
    return (
      <>
        <div className="pb-24">{children}</div>
        <div className="game-app">
          <BottomNav />
        </div>
      </>
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
