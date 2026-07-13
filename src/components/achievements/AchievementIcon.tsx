"use client";

import {
  ArrowUp,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Crown,
  Flag,
  Footprints,
  Gem,
  GraduationCap,
  Handshake,
  HeartHandshake,
  HeartPulse,
  ListChecks,
  Lock,
  PackageCheck,
  Pi,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  footsteps: Footprints,
  book_10: BookOpenCheck,
  books: BookOpen,
  graduation_cap: GraduationCap,
  island: Flag,
  algebra_x: X,
  geometry_tools: Pi,
  golden_path: Sparkles,
  pi_crown: Crown,
  shield_check: ShieldCheck,
  hundred: Sparkles,
  boss: Trophy,
  heart_shield: HeartPulse,
  crossed_swords: Swords,
  sword: Swords,
  handshake: Handshake,
  friends_duel: HeartHandshake,
  team: Users,
  arrow_up: ArrowUp,
  star_5: Star,
  star_10: Crown,
  shopping_bag: ShoppingBag,
  gem: Gem,
  gem_chest: PackageCheck,
  gems: Gem,
  legendary_chest: Crown,
  checklist: ListChecks,
  scroll_100: ScrollText,
  calendar_7: CalendarDays,
};

type Props = {
  icon: string;
  unlocked?: boolean;
  className?: string;
};

export function AchievementIcon({ icon, unlocked = true, className = "" }: Props) {
  const Icon = ICONS[icon] ?? Star;

  return (
    <span className={`achievement-icon ${unlocked ? "" : "is-locked"} ${className}`}>
      <Icon aria-hidden="true" />
      {!unlocked && (
        <span className="achievement-icon-lock">
          <Lock aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
