"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { leaderboardApi, type LeaderboardEntry, type LeaderboardSeason } from "@/lib/api/leaderboard";
import { friendsApi } from "@/lib/api/friends";

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; season: LeaderboardSeason; entries: LeaderboardEntry[] };

type FriendsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; entries: LeaderboardEntry[] };

type Scope = "global" | "local";

const AVATARS = ["🦉", "🐉", "🦌", "🐢", "🦊", "🐼", "🦁", "🐺", "🦅", "🐨"];

function leagueTitle(level: number): string {
  if (level >= 13) return "Майстер";
  if (level >= 10) return "Слідопит";
  if (level >= 6) return "Дослідник";
  if (level >= 3) return "Мандрівник";
  return "Шукач";
}

function Row({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const name = entry.nickname ?? `Мандрівник ${entry.rank}`;
  const topCls = entry.rank <= 3 ? ` top${entry.rank}` : "";
  return (
    <div className={`lrow${topCls}${isMe ? " me" : ""}`}>
      <div className="rk">{entry.rank}</div>
      <div className="lav">{AVATARS[(entry.rank - 1) % AVATARS.length]}</div>
      <div className="ln">
        {isMe ? `@${name} (Ти)` : name}
        <small>
          {leagueTitle(entry.level)} · Рівень {entry.level}
        </small>
      </div>
      <div className="lxpb">{entry.points.toLocaleString("uk")} XP</div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [scope, setScope] = useState<Scope>("global");
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [friends, setFriends] = useState<FriendsState>({ status: "loading" });

  const fetchBoard = useCallback(() => {
    leaderboardApi
      .get(50)
      .then((data) =>
        setState(
          data.entries.length
            ? { status: "ready", season: data.season, entries: data.entries }
            : { status: "empty" },
        ),
      )
      .catch(() => setState({ status: "error" }));
  }, []);

  const fetchFriends = useCallback(() => {
    friendsApi
      .list()
      .then((list) => {
        const me = user
          ? [
              {
                user_id: user.id,
                nickname: user.nickname,
                level: user.level,
                points: user.exp,
              },
            ]
          : [];
        const rows = [
          ...list.map((f) => ({
            user_id: f.friend.id,
            nickname: f.friend.nickname,
            level: f.friend.level,
            points: f.friend.exp,
          })),
          ...me,
        ];
        if (!list.length) {
          setFriends({ status: "empty" });
          return;
        }
        const entries: LeaderboardEntry[] = rows
          .sort((a, b) => b.points - a.points)
          .map((r, i) => ({ ...r, rank: i + 1 }));
        setFriends({ status: "ready", entries });
      })
      .catch(() => setFriends({ status: "error" }));
  }, [user]);

  const retry = () => {
    setState({ status: "loading" });
    fetchBoard();
  };

  useEffect(() => {
    fetchBoard();
    fetchFriends();
  }, [fetchBoard, fetchFriends]);

  return (
    <section className="view active">
      <h2 className="sec-title">
        Рейтинг <small>{state.status === "ready" ? state.season.title : "Цього тижня"}</small>
      </h2>
      <p className="sec-sub">
        Найкращі мандрівники нічного світу НМТ. Проходь уроки, збирай XP — і піднімайся вище.
      </p>

      <div className="league-tabs">
        <button
          className={`league-tab${scope === "global" ? " active" : ""}`}
          onClick={() => setScope("global")}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5" />
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Глобальна
        </button>
        <button
          className={`league-tab${scope === "local" ? " active" : ""}`}
          onClick={() => setScope("local")}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="16" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="M3 19 C3 15 6 14 8 14 C10 14 13 15 13 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M11 19 C11 15.5 14 14 16 14 C18 14 21 15 21 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Друзі
        </button>
      </div>

      <div className={`league-panel${scope === "global" ? " active" : ""}`}>
        {state.status === "loading" && <div className="league-empty">Завантаження рейтингу…</div>}
        {state.status === "empty" && <div className="league-empty">Рейтинг поки що порожній 🌙</div>}
        {state.status === "error" && (
          <div className="league-empty">
            Не вдалося завантажити рейтинг.{" "}
            <button className="result-link" onClick={retry} style={{ textDecoration: "underline" }}>
              Спробувати ще раз
            </button>
          </div>
        )}
        {state.status === "ready" && (
          <div className="lead">
            {state.entries.map((entry) => (
              <Row key={entry.user_id} entry={entry} isMe={entry.user_id === user?.id} />
            ))}
          </div>
        )}
      </div>

      <div className={`league-panel${scope === "local" ? " active" : ""}`}>
        {friends.status === "loading" && <div className="league-empty">Завантаження…</div>}
        {friends.status === "error" && (
          <div className="league-empty">Не вдалося завантажити список друзів.</div>
        )}
        {friends.status === "empty" && (
          <div className="league-empty">Запроси більше друзів, щоб змагатися разом 🎯</div>
        )}
        {friends.status === "ready" && (
          <div className="lead">
            {friends.entries.map((entry) => (
              <Row key={entry.user_id} entry={entry} isMe={entry.user_id === user?.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
