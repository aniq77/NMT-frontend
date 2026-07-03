"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { leaderboardApi, type LeaderboardEntry, type LeaderboardSeason } from "@/lib/api/leaderboard";

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty" }
  | { status: "ready"; season: LeaderboardSeason; entries: LeaderboardEntry[] };

function Row({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  const name = entry.nickname ?? `Мандрівник ${entry.rank}`;
  const topCls = entry.rank <= 3 ? ` top${entry.rank}` : "";
  return (
    <div className={`lrow${topCls}${isMe ? " me" : ""}`}>
      <div className="rk">{entry.rank}</div>
      <div className="lav">{name.charAt(0).toUpperCase()}</div>
      <div className="ln">
        {name}
        {isMe && " (Ти)"}
        <small>Рівень {entry.level}</small>
      </div>
      <div className="lxpb">{entry.points.toLocaleString("uk")} XP</div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [state, setState] = useState<PageState>({ status: "loading" });

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

  const retry = () => {
    setState({ status: "loading" });
    fetchBoard();
  };

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return (
    <section className="view active">
      <h2 className="sec-title">
        Рейтинг <small>{state.status === "ready" ? state.season.title : "Цього тижня"}</small>
      </h2>
      <p className="sec-sub">
        Найкращі мандрівники нічного світу НМТ. Проходь уроки, збирай XP — і піднімайся вище.
      </p>

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
    </section>
  );
}
