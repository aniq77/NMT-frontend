"use client";
import { GraduationCap } from "lucide-react";
import { StatChip } from "@/components/ui/StatChip";
import type { User } from "@/types/auth";

type HeaderUser = Pick<User, "streak_days" | "gems" | "energy">;

export function AppHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[image:var(--grad-primary)] text-white shadow-button">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-base font-800 text-primary-dark">NMT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatChip type="streak" value={user.streak_days} size="sm" />
          <StatChip type="gems"   value={user.gems}        size="sm" />
          <StatChip type="energy" value={user.energy}      size="sm" />
        </div>
      </div>
    </header>
  );
}
