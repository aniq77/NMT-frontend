"use client";
import { GraduationCap } from "lucide-react";
import { StatChip } from "@/components/ui/StatChip";
import type { User } from "@/types/auth";

type HeaderUser = Pick<User, "streak_days" | "lives" | "gems" | "exp">;

export function AppHeader({ user }: { user: HeaderUser }) {
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
          <StatChip type="lives"  value={user.lives}       size="sm" />
          <StatChip type="gems"   value={user.gems}        size="sm" />
          <StatChip type="xp"     value={user.exp}         size="sm" />
        </div>
      </div>
    </header>
  );
}
