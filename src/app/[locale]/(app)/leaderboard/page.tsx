"use client";
import { useState, useEffect } from "react";
import { Award, Medal, Trophy, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { leaderboardApi, type LeaderboardEntry, type LeaderboardSeason } from "@/lib/api/leaderboard";

const PROMOTE_COUNT = 10;
const DEMOTE_START  = 16;

const MEDALS: React.ReactNode[] = [
  <Trophy key="gold"   className="h-7 w-7 text-yellow-500" />,
  <Medal  key="silver" className="h-7 w-7 text-slate-400" />,
  <Award  key="bronze" className="h-7 w-7 text-amber-600" />,
];

function useCountdown(endIso: string) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(endIso).getTime() - now.getTime());
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface shadow-card">
        <span className="font-display text-md font-800 text-text-primary tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="font-display text-xs font-600 text-text-secondary">{label}</span>
    </div>
  );
}

function SeasonBanner({ season }: { season: LeaderboardSeason }) {
  const { days, hours, minutes, seconds } = useCountdown(season.ends_at);
  return (
    <div className="border-b border-reward bg-reward-light px-4 pb-5 pt-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Trophy className="h-16 w-16 text-yellow-500" />
        <h2 className="font-display text-xl font-800 text-reward-dark">{season.title}</h2>
        <p className="font-body text-sm text-reward-dark/70">Сезон завершується через</p>
        <div className="flex items-end gap-2">
          <TimeBox value={days}    label="дні" />
          <span className="mb-3 font-display text-lg font-700 text-text-secondary">:</span>
          <TimeBox value={hours}   label="год" />
          <span className="mb-3 font-display text-lg font-700 text-text-secondary">:</span>
          <TimeBox value={minutes} label="хв" />
          <span className="mb-3 font-display text-lg font-700 text-text-secondary">:</span>
          <TimeBox value={seconds} label="сек" />
        </div>
      </div>
    </div>
  );
}

function ZoneDivider({ type }: { type: "promote" | "safe" | "demote" }) {
  if (type === "promote") {
    return (
      <div className="flex items-center gap-2 border-y border-correct/30 bg-correct-light px-4 py-2">
        <span className="font-700 text-correct">↑</span>
        <span className="font-display text-xs font-600 text-correct-dark">
          Топ 10 отримають підвищення до наступної ліги
        </span>
      </div>
    );
  }
  if (type === "demote") {
    return (
      <div className="flex items-center gap-2 border-y border-wrong/30 bg-wrong-light px-4 py-2">
        <span className="font-700 text-wrong">↓</span>
        <span className="font-display text-xs font-600 text-wrong-dark">
          Останні 5 будуть знижені в лізі
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="h-px flex-1 bg-border" />
      <span className="font-display text-xs font-600 text-text-secondary">Безпечна зона</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function Row({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  const isDemotion = entry.rank >= DEMOTE_START;
  const isTop3     = entry.rank <= 3;
  const name = entry.nickname ?? `User ${entry.rank}`;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors",
        isCurrentUser && "bg-primary-light",
        isDemotion && !isCurrentUser && "bg-wrong-light/40",
      )}
    >
      <span
        className={cn(
          "flex w-7 shrink-0 items-center justify-center",
          isTop3 ? "" : "font-display text-base font-700 text-text-secondary",
        )}
      >
        {isTop3 ? MEDALS[entry.rank - 1] : `${entry.rank}.`}
      </span>

      <Avatar name={name} size="sm" level={entry.level} />

      <span
        className={cn(
          "flex-1 truncate font-display text-sm font-700",
          isCurrentUser ? "text-primary-dark" : "text-text-primary",
        )}
      >
        {name}
        {isCurrentUser && (
          <span className="ml-1 font-body text-xs font-medium text-primary"> (ти)</span>
        )}
      </span>

      <div className="flex items-center gap-1">
        <Zap className="h-4 w-4 text-reward" />
        <span
          className={cn(
            "font-display text-sm font-700 tabular-nums",
            isCurrentUser ? "text-primary-dark" : isDemotion ? "text-wrong-dark" : "text-text-primary",
          )}
        >
          {entry.points.toLocaleString("uk")}
        </span>
      </div>
    </div>
  );
}

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; season: LeaderboardSeason; entries: LeaderboardEntry[] };

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    leaderboardApi
      .get(50)
      .then((data) => {
        if (!data.entries.length) {
          setState({ status: "empty" });
        } else {
          setState({ status: "ready", season: data.season, entries: data.entries });
        }
      })
      .catch(() => setState({ status: "error" }));
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4">
        <p className="font-body text-text-secondary">Не вдалося завантажити рейтинг</p>
        <button
          type="button"
          onClick={() => {
            setState({ status: "loading" });
            leaderboardApi
              .get(50)
              .then((data) =>
                setState({ status: "ready", season: data.season, entries: data.entries }),
              )
              .catch(() => setState({ status: "error" }));
          }}
          className="rounded-lg bg-primary px-4 py-2 font-display text-sm font-700 text-white"
        >
          Спробувати ще раз
        </button>
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <p className="font-body text-text-secondary">Рейтинг поки що порожній</p>
      </div>
    );
  }

  const { season, entries } = state;
  const currentUserId = user?.id;
  const userEntry = entries.find((e) => e.user_id === currentUserId);
  const rank10Entry = entries.find((e) => e.rank === PROMOTE_COUNT);
  const xpToTop10 =
    rank10Entry && userEntry && userEntry.rank > PROMOTE_COUNT
      ? rank10Entry.points - userEntry.points + 1
      : 0;

  const promoEntries = entries.filter((e) => e.rank <= PROMOTE_COUNT);
  const safeEntries  = entries.filter((e) => e.rank > PROMOTE_COUNT && e.rank < DEMOTE_START);
  const demotEntries = entries.filter((e) => e.rank >= DEMOTE_START);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto max-w-app px-4 py-3">
          <h1 className="font-display text-base font-800 text-primary-dark">Рейтинг</h1>
        </div>
      </header>

      <div className="mx-auto max-w-app">
        <SeasonBanner season={season} />

        <div className="glass-soft mt-3 overflow-hidden rounded-2xl pb-40">
          <ZoneDivider type="promote" />

          {promoEntries.map((entry) => (
            <Row key={entry.user_id} entry={entry} isCurrentUser={entry.user_id === currentUserId} />
          ))}

          <ZoneDivider type="safe" />

          {safeEntries.map((entry) => (
            <Row key={entry.user_id} entry={entry} isCurrentUser={entry.user_id === currentUserId} />
          ))}

          {demotEntries.length > 0 && (
            <>
              <ZoneDivider type="demote" />
              {demotEntries.map((entry) => (
                <Row
                  key={entry.user_id}
                  entry={entry}
                  isCurrentUser={entry.user_id === currentUserId}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {userEntry && (
        <div className="fixed bottom-[72px] left-0 right-0 z-30 px-4">
          <div className="btn-grad-primary mx-auto max-w-app overflow-hidden rounded-2xl shadow-modal">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="font-display text-sm font-600 text-white/70">
                #{userEntry.rank}
              </span>
              <Avatar name={userEntry.nickname ?? "Ти"} size="sm" level={userEntry.level} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-700 text-white">
                  {userEntry.nickname ?? user?.email}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-sm font-700 text-white tabular-nums">
                  {userEntry.points.toLocaleString("uk")} XP
                </p>
                {xpToTop10 > 0 && (
                  <p className="font-display text-xs font-600 text-white/70">
                    до топ-10: +{xpToTop10.toLocaleString("uk")} XP
                  </p>
                )}
                {userEntry.rank <= PROMOTE_COUNT && (
                  <p className="font-display text-xs font-600 text-correct-light">
                    ↑ Зона підвищення
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
