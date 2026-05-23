"use client";
import { useState, useEffect, useMemo } from "react";
import { Award, Gem, Medal, Shield, Trophy, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

type LeagueId = "bronze" | "silver" | "gold" | "sapphire" | "diamond";

const LEAGUE_CONFIG: Record<
  LeagueId,
  { name: string; icon: React.ReactNode; banner: string; text: string; sub: string }
> = {
  bronze:   { name: "Бронзова ліга",   icon: <Shield className="h-16 w-16 text-amber-700" />,  banner: "bg-amber-50 border-amber-200",       text: "text-amber-800",     sub: "text-amber-600" },
  silver:   { name: "Срібна ліга",     icon: <Medal  className="h-16 w-16 text-slate-400" />,  banner: "bg-slate-50 border-slate-200",        text: "text-slate-700",     sub: "text-slate-500" },
  gold:     { name: "Золота ліга",     icon: <Trophy className="h-16 w-16 text-yellow-500" />, banner: "bg-reward-light border-reward",       text: "text-reward-dark",   sub: "text-reward-dark/70" },
  sapphire: { name: "Сапфірова ліга",  icon: <Gem    className="h-16 w-16 text-blue-500" />,   banner: "bg-blue-50 border-blue-200",          text: "text-blue-700",      sub: "text-blue-500" },
  diamond:  { name: "Діамантова ліга", icon: <Gem    className="h-16 w-16 text-primary" />,    banner: "bg-primary-light border-border-strong", text: "text-primary-dark", sub: "text-primary" },
};

const MEDALS: React.ReactNode[] = [
  <Trophy key="gold"   className="h-7 w-7 text-yellow-500" />,
  <Medal  key="silver" className="h-7 w-7 text-slate-400" />,
  <Award  key="bronze" className="h-7 w-7 text-amber-600" />,
];

const PROMOTE_COUNT = 10;
const DEMOTE_START  = 16;
const CURRENT_LEAGUE: LeagueId = "gold";
const CURRENT_USER = "yurii.arutiunov";

type Entry = { rank: number; username: string; xp: number; level: number };

const WEEKLY_ENTRIES: Entry[] = [
  { rank: 1,  username: "МатКороль",        xp: 2840, level: 12 },
  { rank: 2,  username: "АлгеброЗірка",     xp: 2210, level: 10 },
  { rank: 3,  username: "ТригоноМетр",      xp: 1890, level: 9  },
  { rank: 4,  username: "ВекторЧемпіон",    xp: 1720, level: 9  },
  { rank: 5,  username: "ФункціяМастер",    xp: 1580, level: 8  },
  { rank: 6,  username: "ІнтегралКрал",     xp: 1380, level: 8  },
  { rank: 7,  username: CURRENT_USER,        xp: 1250, level: 7  },
  { rank: 8,  username: "КвадратРівняння",  xp: 1140, level: 7  },
  { rank: 9,  username: "МатЗнавець",       xp: 980,  level: 6  },
  { rank: 10, username: "ПіфагорФан",       xp: 850,  level: 6  },
  { rank: 11, username: "ГеометрМайстер",   xp: 720,  level: 5  },
  { rank: 12, username: "РівняннєЛюб",      xp: 610,  level: 5  },
  { rank: 13, username: "НМТБоєць",         xp: 490,  level: 4  },
  { rank: 14, username: "МатЕнтузіаст",     xp: 380,  level: 4  },
  { rank: 15, username: "ЧислоКрал",        xp: 290,  level: 3  },
  { rank: 16, username: "МатНовачок",       xp: 200,  level: 3  },
  { rank: 17, username: "УчнівМатема",      xp: 150,  level: 2  },
  { rank: 18, username: "АлгеброПочат",     xp: 110,  level: 2  },
  { rank: 19, username: "МатСтудент",       xp:  70,  level: 2  },
  { rank: 20, username: "ПочатківецьМат",   xp:  40,  level: 1  },
];

const MONTHLY_ENTRIES: Entry[] = WEEKLY_ENTRIES.map((e) => ({
  ...e,
  xp: Math.round(e.xp * 4.2 + Math.random() * 200),
})).sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 }));

function getSeasonEnd(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysToSunday = day === 0 ? 7 : 7 - day;
  const end = new Date(now);
  end.setDate(now.getDate() + daysToSunday);
  end.setHours(23, 59, 59, 0);
  return end;
}

function useCountdown(end: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, end.getTime() - now.getTime());
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

function Row({ entry, isCurrentUser }: { entry: Entry; isCurrentUser: boolean }) {
  const isDemotion = entry.rank >= DEMOTE_START;
  const isTop3     = entry.rank <= 3;

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

      <Avatar name={entry.username} size="sm" level={entry.level} />

      <span
        className={cn(
          "flex-1 truncate font-display text-sm font-700",
          isCurrentUser ? "text-primary-dark" : "text-text-primary",
        )}
      >
        {entry.username}
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
          {entry.xp.toLocaleString("uk")}
        </span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");
  const league = LEAGUE_CONFIG[CURRENT_LEAGUE];
  const seasonEnd = useMemo(getSeasonEnd, []);
  const { days, hours, minutes, seconds } = useCountdown(seasonEnd);

  const entries = tab === "weekly" ? WEEKLY_ENTRIES : MONTHLY_ENTRIES;
  const userEntry = entries.find((e) => e.username === CURRENT_USER)!;
  const rank10Entry = entries.find((e) => e.rank === PROMOTE_COUNT);
  const xpToTop10 = rank10Entry && userEntry.rank > PROMOTE_COUNT
    ? rank10Entry.xp - userEntry.xp + 1
    : 0;

  const promoEntries = entries.filter((e) => e.rank <= PROMOTE_COUNT);
  const safeEntries  = entries.filter((e) => e.rank > PROMOTE_COUNT && e.rank < DEMOTE_START);
  const demotEntries = entries.filter((e) => e.rank >= DEMOTE_START);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto max-w-app px-4 py-3">
          <h1 className="font-display text-base font-700 text-text-primary">Рейтинг</h1>
        </div>
      </header>

      <div className="mx-auto max-w-app">
        {/* League banner */}
        <div className={cn("border-b px-4 pb-5 pt-4", league.banner)}>
          <div className="flex flex-col items-center gap-2 text-center">
            {league.icon}
            <h2 className={cn("font-display text-xl font-800", league.text)}>{league.name}</h2>
            <p className={cn("font-body text-sm", league.sub)}>Сезон завершується через</p>
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

        {/* Tabs */}
        <div className="flex border-b border-border bg-surface">
          {(["weekly", "monthly"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-3 font-display text-sm font-700 transition-colors",
                tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {t === "weekly" ? "Тижневий" : "Місячний"}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-surface pb-40">
          <ZoneDivider type="promote" />

          {promoEntries.map((entry) => (
            <Row key={entry.rank} entry={entry} isCurrentUser={entry.username === CURRENT_USER} />
          ))}

          <ZoneDivider type="safe" />

          {safeEntries.map((entry) => (
            <Row key={entry.rank} entry={entry} isCurrentUser={entry.username === CURRENT_USER} />
          ))}

          <ZoneDivider type="demote" />

          {demotEntries.map((entry) => (
            <Row key={entry.rank} entry={entry} isCurrentUser={entry.username === CURRENT_USER} />
          ))}
        </div>
      </div>

      {/* Sticky user position card (above bottom nav) */}
      <div className="fixed bottom-[72px] left-0 right-0 z-30 px-4">
        <div className="mx-auto max-w-app overflow-hidden rounded-xl bg-primary shadow-modal">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="font-display text-sm font-600 text-white/70">
              #{userEntry.rank}
            </span>
            <Avatar name={userEntry.username} size="sm" level={userEntry.level} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-700 text-white">
                {userEntry.username}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-sm font-700 text-white tabular-nums">
                {userEntry.xp.toLocaleString("uk")} XP
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
    </div>
  );
}
