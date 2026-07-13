"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Trophy } from "lucide-react";
import { AchievementIcon } from "@/components/achievements/AchievementIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { achievementsApi } from "@/lib/api/achievements";
import { useRouter } from "@/lib/navigation";
import type { Achievement, AchievementCategory, AchievementStats } from "@/types/achievements";

const CATEGORIES: Array<{ id: "all" | AchievementCategory; label: string }> = [
  { id: "all", label: "Усі" },
  { id: "learning", label: "Навчання" },
  { id: "mastery", label: "Майстерність" },
  { id: "bosses", label: "Боси" },
  { id: "pvp", label: "PvP" },
  { id: "friends", label: "Друзі" },
  { id: "levels", label: "Рівні" },
  { id: "shop", label: "Магазин" },
  { id: "quests", label: "Завдання" },
];

const RARITY_CLASS: Record<Achievement["rarity"], string> = {
  common: "border-primary/20 bg-primary-light/45",
  rare: "border-water/25 bg-water/10",
  epic: "border-violet/25 bg-violet/10",
  legendary: "border-reward/35 bg-reward-light/35",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

function shouldShowProgress(achievement: Achievement) {
  return !achievement.is_unlocked && achievement.target_value > 1 && achievement.progress > 0;
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const unlocked = achievement.is_unlocked || achievement.unlocked;
  const progress = Math.min(achievement.progress, achievement.target_value);

  return (
    <article
      className={`rounded-lg border p-4 shadow-sm transition ${RARITY_CLASS[achievement.rarity]} ${
        unlocked ? "opacity-100" : "opacity-70 grayscale-[.35]"
      }`}
      title={`${achievement.name}: ${achievement.description}. ${achievement.progress_label}`}
    >
      <div className="flex items-start gap-3">
        <AchievementIcon icon={achievement.icon} unlocked={unlocked} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-base font-800 leading-tight text-text-primary">{achievement.name}</h2>
            <span className={`shrink-0 rounded-full px-2 py-1 font-display text-[10px] font-800 uppercase tracking-wide ${
              unlocked ? "bg-correct-light text-correct-dark" : "bg-surface-alt text-text-secondary"
            }`}>
              {unlocked ? "Отримано" : "Закрито"}
            </span>
          </div>
          <p className="mt-1 font-body text-sm leading-snug text-text-secondary">{achievement.description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3 font-display text-xs font-700 text-text-secondary">
          <span>{achievement.progress_label}</span>
          {unlocked && achievement.unlocked_at && <span>{formatDate(achievement.unlocked_at)}</span>}
        </div>
        {shouldShowProgress(achievement) && (
          <ProgressBar value={progress} max={achievement.target_value} size="xs" color="primary" />
        )}
      </div>
    </article>
  );
}

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | AchievementCategory>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([achievementsApi.list(), achievementsApi.stats()])
      .then(([list, nextStats]) => {
        setAchievements(list);
        setStats(nextStats);
      })
      .catch(() => setError("Не вдалося завантажити досягнення."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      achievements.filter((achievement) =>
        activeCategory === "all" ? true : achievement.category === activeCategory,
      ),
    [achievements, activeCategory],
  );

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 font-display text-lg font-800 text-primary-dark">Досягнення</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        <section className="glass rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-display text-2xl font-800 text-text-primary">{stats?.unlocked ?? 0}</div>
              <div className="font-body text-xs text-text-secondary">відкрито</div>
            </div>
            <div>
              <div className="font-display text-2xl font-800 text-text-primary">{stats?.total ?? achievements.length}</div>
              <div className="font-body text-xs text-text-secondary">усього</div>
            </div>
            <div>
              <div className="font-display text-2xl font-800 text-text-primary">{stats?.percentage ?? 0}%</div>
              <div className="font-body text-xs text-text-secondary">прогрес</div>
            </div>
          </div>
        </section>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`shrink-0 rounded-full px-4 py-2 font-display text-xs font-800 transition ${
                activeCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-surface-alt text-text-secondary hover:text-text-primary"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="glass h-36 animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="glass mt-4 rounded-lg p-6 text-center font-body text-sm text-wrong-dark">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="glass mt-4 flex flex-col items-center gap-3 rounded-lg py-12 text-center">
            <Trophy className="h-10 w-10 text-text-secondary/50" />
            <p className="font-body text-sm text-text-secondary">Досягнень у цій категорії поки немає.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filtered.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
