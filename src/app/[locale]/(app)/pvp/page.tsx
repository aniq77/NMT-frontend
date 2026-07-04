"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { GameScreen } from "@/components/layout/GameScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api/client";
import { pvpApi, type BattleSummary } from "@/lib/api/pvp";
import { useAuthStore } from "@/store/auth.store";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Легко",
  medium: "Середньо",
  hard: "Складно",
  boss: "Бос",
};

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; battles: BattleSummary[] };

export default function PvPPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [state, setState] = useState<PageState>({ status: "loading" });

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [code, setCode] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const fetchBattles = useCallback(() => {
    pvpApi
      .listBattles()
      .then((battles) => setState({ status: "ready", battles }))
      .catch(() => setState({ status: "error" }));
  }, []);

  const reload = () => {
    setState({ status: "loading" });
    fetchBattles();
  };

  useEffect(fetchBattles, [fetchBattles]);

  const handleAccept = async () => {
    const id = code.trim();
    if (!id) return;
    setAccepting(true);
    setAcceptError(null);
    try {
      const battle = await pvpApi.acceptChallenge(id);
      // gem wager may have been deducted on accept
      const me = battle.players.find((p) => p.user_id === user?.id);
      if (me && battle.wager_gems > 0 && user) {
        updateUser({ gems: user.gems - battle.wager_gems });
      }
      setAcceptOpen(false);
      setCode("");
      router.push(`/pvp/battles/${battle.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setAcceptError("Виклик не знайдено");
      } else if (err instanceof ApiError && err.status === 403) {
        setAcceptError("Цей виклик адресовано не вам");
      } else if (err instanceof ApiError && err.status === 400) {
        setAcceptError("Виклик прострочено або недостатньо кристалів");
      } else {
        setAcceptError("Не вдалося прийняти виклик");
      }
    } finally {
      setAccepting(false);
    }
  };

  const battles = state.status === "ready" ? state.battles : [];
  const finished = battles.filter((b) => b.status === "finished");
  const wins = finished.filter((b) => b.winner_user_id === user?.id).length;
  const losses = finished.filter(
    (b) => b.winner_user_id && b.winner_user_id !== user?.id,
  ).length;
  const winrate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const active = battles.filter((b) => b.status === "active" || b.status === "waiting");

  const opponentLetter = (b: BattleSummary) =>
    (b.opponent_nickname ?? "С").charAt(0).toUpperCase();
  const subline = (b: BattleSummary) =>
    `${DIFFICULTY_LABEL[b.difficulty] ?? b.difficulty}${b.wager_gems > 0 ? ` · 💎 ${b.wager_gems}` : ""}`;

  return (
    <GameScreen>
      <section className="view active">
        <div className="path-head">
          <button className="back" onClick={() => router.push("/home")} aria-label="Назад">
            ←
          </button>
          <div>
            <h2>Дуелі</h2>
            <div className="ps">Кидай виклик і доводь, хто кращий</div>
          </div>
        </div>

        <div className="duel-hero">
          <div className="dh-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 3.5 21 3l-.5 6.5-9 9" />
              <path d="M3 16l5 5" />
              <path d="M9.5 3.5 3 3l.5 6.5 9 9" />
              <path d="M21 16l-5 5" />
            </svg>
          </div>
          <h3>Знайти суперника</h3>
          <p>5 запитань · хто швидше та точніше — той переможе</p>
          <button className="dh-btn" onClick={() => router.push("/friends")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 3 14 9-14 9z" />
            </svg>
            Викликати друга
          </button>
          <div style={{ marginTop: 10 }}>
            <button
              className="result-link"
              onClick={() => {
                setAcceptError(null);
                setAcceptOpen(true);
              }}
            >
              Прийняти виклик за кодом
            </button>
          </div>
        </div>

        <div className="duel-stat">
          <div className="ds win">
            <b>{wins}</b>
            <span>ПЕРЕМОГ</span>
          </div>
          <div className="ds lose">
            <b>{losses}</b>
            <span>ПОРАЗОК</span>
          </div>
          <div className="ds">
            <b>{winrate}%</b>
            <span>ВІНРЕЙТ</span>
          </div>
        </div>

        {state.status === "loading" && <div className="league-empty">Завантаження…</div>}
        {state.status === "error" && (
          <div className="league-empty">
            Не вдалося завантажити бої.{" "}
            <button className="result-link" onClick={reload} style={{ textDecoration: "underline" }}>
              Спробувати ще раз
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            {active.length > 0 && (
              <>
                <div className="shop-cat" style={{ marginBottom: 14 }}>
                  Активні дуелі
                </div>
                <div className="duel-list" style={{ marginBottom: 8 }}>
                  {active.map((b) => (
                    <div className="duel-row" key={b.id}>
                      <div className="dr-av">{opponentLetter(b)}</div>
                      <div className="dr-info">
                        <b>{b.opponent_nickname ?? "суперник"}</b>
                        <span>{subline(b)}</span>
                      </div>
                      {b.status === "active" ? (
                        <button
                          className="dr-state turn"
                          onClick={() => router.push(`/pvp/battles/${b.id}`)}
                        >
                          Ходити
                        </button>
                      ) : (
                        <span className="dr-state wait">Очікування</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {finished.length > 0 && (
              <>
                <div className="shop-cat" style={{ marginBottom: 14 }}>
                  Останні результати
                </div>
                <div className="duel-list">
                  {finished.map((b) => {
                    const won = b.winner_user_id === user?.id;
                    const lost = b.winner_user_id && b.winner_user_id !== user?.id;
                    return (
                      <div className="duel-row" key={b.id}>
                        <div className="dr-av">{opponentLetter(b)}</div>
                        <div className="dr-info">
                          <b>{b.opponent_nickname ?? "суперник"}</b>
                          <span>{subline(b)}</span>
                        </div>
                        {won ? (
                          <span className="dr-state won">Перемога</span>
                        ) : lost ? (
                          <span className="dr-state lost">Поразка</span>
                        ) : (
                          <span className="dr-state wait">Нічия</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {battles.length === 0 && (
              <div className="league-empty">Поки що немає боїв. Викличте друга на дуель!</div>
            )}
          </>
        )}
      </section>

      <Modal
        open={acceptOpen}
        onClose={accepting ? undefined : () => setAcceptOpen(false)}
        title="Прийняти виклик"
        size="sm"
      >
        <div className="space-y-4">
          <p className="font-body text-sm text-text-secondary">
            Вставте код виклику, який надіслав суперник. Ставку буде списано одразу після прийняття.
          </p>
          <Input
            placeholder="Код виклику"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setAcceptError(null);
            }}
          />
          {acceptError && <p className="font-body text-sm text-wrong-dark">{acceptError}</p>}
          <Button className="w-full" loading={accepting} disabled={!code.trim()} onClick={handleAccept}>
            Почати бій
          </Button>
        </div>
      </Modal>
    </GameScreen>
  );
}
