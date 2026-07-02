"use client";
import { StatChip } from "@/components/ui/StatChip";
import type { User } from "@/types/auth";

type HeaderUser = Pick<User, "streak_days" | "lives" | "gems" | "exp">;

export function AppHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-[820px] items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 48 48" fill="none" className="h-[38px] w-[38px] drop-shadow-[0_0_10px_rgba(51,214,194,0.6)]">
            <path d="M24 3l5 6 8-1-1 8 6 5-6 5 1 8-8-1-5 6-5-6-8 1 1-8-6-5 6-5-1-8 8 1 5-6z" fill="#33d6c2" stroke="#0f7a70" strokeWidth="1.4" />
            <path d="M16 26l5 5 11-13" stroke="#06221f" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden font-display text-xl font-800 tracking-[0.5px] text-primary-dark [text-shadow:0_0_16px_rgba(51,214,194,0.5)] sm:inline">
            NMT&nbsp;JOURNEY
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatChip type="streak" value={user.streak_days} size="sm" />
          <StatChip type="lives"  value={user.lives}       size="sm" />
          <StatChip type="gems"   value={user.gems}        size="sm" />
          <StatChip type="xp"     value={user.exp}         size="sm" />
        </div>
      </div>
    </header>
  );
}
