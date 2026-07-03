"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import {
  BookOpen,
  Check,
  ChevronLeft,
  Flame,
  Gem,
  GraduationCap,
  Lock,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { achievementsApi } from "@/lib/api/achievements";
import type { Achievement, AchievementConditionType, AchievementTier } from "@/types/achievements";

// ─── lookup tables ───────────────────────────────────────────────────────────

const TIER_ORDER: AchievementTier[] = ["platinum", "gold", "silver", "bronze"];

const TIER_LABELS: Record<AchievementTier, string> = {
  platinum: "Платина",
  gold:     "Золото",
  silver:   "Срібло",
  bronze:   "Бронза",
};

const TIER_STYLES: Record<AchievementTier, { text: string; iconBg: string; iconText: string; dot: string }> = {
  platinum: { text: "text-violet-500", iconBg: "bg-violet-500/15", iconText: "text-violet-500", dot: "bg-violet-500" },
  gold:     { text: "text-reward",     iconBg: "bg-reward/15",     iconText: "text-reward",     dot: "bg-reward" },
  silver:   { text: "text-slate-400",  iconBg: "bg-slate-400/15",  iconText: "text-slate-400",  dot: "bg-slate-400" },
  bronze:   { text: "text-orange-500", iconBg: "bg-orange-500/15", iconText: "text-orange-500", dot: "bg-orange-500" },
};

const CONDITION_ICONS: Record<AchievementConditionType, LucideIcon> = {
  lessons_completed: BookOpen,
  courses_completed: GraduationCap,
  streak_days:       Flame,
  exp_earned:        Zap,
  level_reached:     Star,
};

// ─── components ──────────────────────────────────────────────────────────────

function AchievementRow({ achievement }: { achievement: Achievement }) {
  const Icon  = CONDITION_ICONS[achievement.condition_type];
  const style = TIER_STYLES[achievement.tier];

  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 transition-opacity ${achievement.unlocked ? "opacity-100" : "opacity-55"}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}>
        {achievement.unlocked
          ? <Icon className={`h-5 w-5 ${style.iconText}`} />
          : <Lock className="h-4 w-4 text-text-secondary" />
        }
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-sm font-700 text-text-primary leading-tight">{achievement.title}</p>
          {achievement.unlocked
            ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-correct" />
            : <span className="font-display text-xs font-600 text-text-secondary shrink-0 tabular-nums">
                {achievement.user_progress}/{achievement.condition_value}
              </span>
          }
        </div>

        <p className="mt-0.5 font-body text-xs text-text-secondary line-clamp-2">{achievement.description}</p>

        {!achievement.unlocked && achievement.user_progress > 0 && (
          <div className="mt-2">
            <ProgressBar value={achievement.user_progress} max={achievement.condition_value} size="xs" color="primary" />
          </div>
        )}

        {(achievement.exp_reward > 0 || achievement.gems_reward > 0) && (
          <div className="mt-1.5 flex items-center gap-3">
            {achievement.exp_reward > 0 && (
              <span className="flex items-center gap-1 font-display text-xs font-600 text-reward">
                <Zap className="h-3 w-3" />+{achievement.exp_reward} XP
              </span>
            )}
            {achievement.gems_reward > 0 && (
              <span className="flex items-center gap-1 font-display text-xs font-600 text-primary-dark">
                <Gem className="h-3 w-3" />+{achievement.gems_reward}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementsApi.list()
      .then(setAchievements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const grouped = TIER_ORDER.reduce<Record<AchievementTier, Achievement[]>>(
    (acc, tier) => { acc[tier] = achievements.filter((a) => a.tier === tier); return acc; },
    { platinum: [] as Achievement[], gold: [] as Achievement[], silver: [] as Achievement[], bronze: [] as Achievement[] },
  );

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 font-display text-base font-800 text-primary-dark">Досягнення</h1>
          {!loading && (
            <span className="font-display text-sm font-600 text-text-secondary tabular-nums">
              {unlockedCount}/{achievements.length}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6 space-y-4">

        {/* Loading */}
        {loading && (
          <div className="glass overflow-hidden rounded-2xl divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-border" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-border" />
                  <div className="h-2.5 w-full animate-pulse rounded bg-border" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && achievements.length === 0 && (
          <div className="glass flex flex-col items-center gap-3 rounded-2xl py-12 text-center">
            <Trophy className="h-10 w-10 text-text-secondary/40" />
            <p className="font-body text-sm text-text-secondary">Досягнень поки немає</p>
          </div>
        )}

        {/* Grouped by tier */}
        {!loading && TIER_ORDER.map((tier) => {
          const list = grouped[tier];
          if (!list.length) return null;
          const style = TIER_STYLES[tier];
          const unlockedInTier = list.filter((a) => a.unlocked).length;

          return (
            <div key={tier} className="glass overflow-hidden rounded-2xl">
              {/* Tier header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <span className={`font-display text-sm font-700 uppercase tracking-wider ${style.text}`}>
                    {TIER_LABELS[tier]}
                  </span>
                </div>
                <span className="font-display text-xs font-600 text-text-secondary tabular-nums">
                  {unlockedInTier}/{list.length}
                </span>
              </div>

              <div className="divide-y divide-border">
                {list.map((ach) => <AchievementRow key={ach.id} achievement={ach} />)}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
