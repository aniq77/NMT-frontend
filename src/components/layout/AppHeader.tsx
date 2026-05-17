"use client";
import { useState, useEffect } from "react";
import { GraduationCap, Heart } from "lucide-react";
import { StatChip } from "@/components/ui/StatChip";

type User = {
  username: string;
  level: number;
  xp: number;
  gems: number;
  lives: number;
  streak_days: number;
  hearts_refill_at?: string | null;
};

function useHeartCountdown(hearts_refill_at?: string | null): string | null {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!hearts_refill_at) return;
    const target = new Date(hearts_refill_at).getTime();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [hearts_refill_at]);

  if (!hearts_refill_at || remaining === 0) return null;
  const mins = Math.floor(remaining / 60_000);
  const secs = Math.floor((remaining % 60_000) / 1_000);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function AppHeader({ user }: { user: User }) {
  const heartCountdown = useHeartCountdown(user.hearts_refill_at);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-button">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-base font-700 text-text-primary">NMT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatChip type="streak" value={user.streak_days} size="sm" />
          {user.lives < 5 && heartCountdown ? (
            <div className="flex items-center gap-1 rounded-full bg-wrong-light px-2.5 py-1">
              <Heart className="h-3.5 w-3.5 text-wrong-dark" />
              <span className="font-display text-xs font-700 text-wrong-dark tabular-nums">
                {user.lives}
              </span>
              <span className="mx-0.5 leading-none text-wrong/30">·</span>
              <span className="font-display text-[11px] font-700 text-wrong-dark tabular-nums">
                {heartCountdown}
              </span>
            </div>
          ) : (
            <StatChip type="lives" value={user.lives} size="sm" />
          )}
          <StatChip type="gems" value={user.gems} size="sm" />
          <StatChip type="xp" value={user.xp} size="sm" />
        </div>
      </div>
    </header>
  );
}
