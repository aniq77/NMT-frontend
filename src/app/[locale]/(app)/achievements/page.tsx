"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Trophy } from "lucide-react";
import { AchievementIcon } from "@/components/achievements/AchievementIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { achievementsApi } from "@/lib/api/achievements";
import { useRouter } from "@/lib/navigation";
import type { Achievement, AchievementStats } from "@/types/achievements";

const RARITY_CLASS: Record<Achievement["rarity"], string> = {
  common: "achievement-card-common",
  rare: "achievement-card-rare",
  epic: "achievement-card-epic",
  legendary: "achievement-card-legendary",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function getProgressValue(achievement: Achievement) {
  if (achievement.is_unlocked || achievement.unlocked) {
    return achievement.target_value;
  }

  return Math.min(achievement.progress, achievement.target_value);
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const unlocked = achievement.is_unlocked || achievement.unlocked;
  const progress = getProgressValue(achievement);

  return (
    <article
      className={`achievement-card ${RARITY_CLASS[achievement.rarity]} ${unlocked ? "is-unlocked" : "is-locked"}`}
      title={`${achievement.name}: ${achievement.description}. ${achievement.progress_label}`}
    >
      <div className="achievement-card-head">
        <AchievementIcon
          icon={achievement.icon}
          slug={achievement.slug}
          code={achievement.code}
          alt=""
          unlocked={unlocked}
        />
        <div className="achievement-card-title">
          <div className="achievement-card-title-row">
            <h2>{achievement.name}</h2>
            <span className={`achievement-status ${unlocked ? "is-unlocked" : "is-locked"}`}>
              {unlocked ? "Отримано" : "Закрито"}
            </span>
          </div>
          <p>{achievement.description}</p>
        </div>
      </div>

      <div className="achievement-card-progress">
        <ProgressBar value={progress} max={achievement.target_value} size="xs" color="primary" />
        <div className="achievement-progress-row">
          <span>{achievement.progress_label}</span>
          {unlocked && achievement.unlocked_at ? (
            <span>{formatDate(achievement.unlocked_at)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
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

  const total = stats?.total ?? achievements.length;
  const unlocked =
    stats?.unlocked ??
    achievements.filter((achievement) => achievement.is_unlocked || achievement.unlocked).length;
  const percentage =
    stats?.percentage ?? (total > 0 ? Math.round((unlocked / total) * 10000) / 100 : 0);

  return (
    <div className="bg-canvas min-h-screen">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="achievements-container flex items-center gap-3 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display font-800 text-primary-dark text-xl">Досягнення</h1>
        </div>
      </header>

      <main className="achievements-container achievements-main">
        <section className="achievement-stats glass">
          <div>
            <strong>{unlocked}</strong>
            <span>відкрито</span>
          </div>
          <div>
            <strong>{total}</strong>
            <span>усього</span>
          </div>
          <div>
            <strong>{percentage}%</strong>
            <span>прогрес</span>
          </div>
        </section>

        {loading && (
          <div className="achievement-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="glass h-44 animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="glass font-body text-wrong-dark rounded-lg p-6 text-center text-sm">
            {error}
          </div>
        )}

        {!loading && !error && achievements.length === 0 && (
          <div className="glass flex flex-col items-center gap-3 rounded-lg py-12 text-center">
            <Trophy className="text-text-secondary/50 h-10 w-10" />
            <p className="font-body text-text-secondary text-sm">Досягнень поки немає.</p>
          </div>
        )}

        {!loading && !error && achievements.length > 0 && (
          <div className="achievement-grid">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
