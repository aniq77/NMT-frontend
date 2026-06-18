"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Gem, Swords, Trophy, Users } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api/client";
import { pvpApi, type BattleStatus, type BattleSummary } from "@/lib/api/pvp";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Легко",
  medium: "Середньо",
  hard: "Складно",
  boss: "Бос",
};

const STATUS_META: Record<BattleStatus, { label: string; cls: string }> = {
  waiting: { label: "Очікування", cls: "bg-reward-light text-reward-dark" },
  active: { label: "Активний", cls: "bg-correct-light text-correct-dark" },
  finished: { label: "Завершено", cls: "bg-surface-alt text-text-secondary" },
  cancelled: { label: "Скасовано", cls: "bg-wrong-light text-wrong-dark" },
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

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3">
          <h1 className="font-display text-base font-800 text-primary-dark">Дуелі</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setAcceptError(null);
              setAcceptOpen(true);
            }}
          >
            Прийняти виклик
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-app space-y-4 px-4 py-6">
        <button
          type="button"
          onClick={() => router.push("/friends")}
          className="flex w-full items-center gap-3 rounded-xl bg-primary p-4 text-left text-white shadow-button transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Users className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-700">Викликати друга</p>
            <p className="font-body text-xs opacity-80">Оберіть друга та надішліть виклик на дуель</p>
          </div>
          <ChevronRight className="h-5 w-5 opacity-80" />
        </button>

        {state.status === "loading" && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="font-body text-text-secondary">Не вдалося завантажити бої</p>
            <Button onClick={reload}>Спробувати ще раз</Button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <h2 className="font-display text-sm font-700 uppercase tracking-widest text-text-secondary">
              Мої бої
            </h2>
            {state.battles.length === 0 ? (
              <p className="py-8 text-center font-body text-sm text-text-secondary">
                Поки що немає боїв. Викличте друга на дуель!
              </p>
            ) : (
              <div className="space-y-2">
                {state.battles.map((b) => {
                  const meta = STATUS_META[b.status];
                  const won = b.status === "finished" && b.winner_user_id === user?.id;
                  const lost =
                    b.status === "finished" && b.winner_user_id && b.winner_user_id !== user?.id;
                  const clickable = b.status === "active" || b.status === "waiting";
                  return (
                    <button
                      key={b.id}
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && router.push(`/pvp/battles/${b.id}`)}
                      className={cn(
                        "glass flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all",
                        clickable ? "hover:-translate-y-0.5" : "cursor-default",
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                        <Swords className="h-5 w-5 text-primary-dark" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-700 text-text-primary">
                          проти {b.opponent_nickname ?? "суперника"}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="font-body text-xs text-text-secondary">
                            {DIFFICULTY_LABEL[b.difficulty] ?? b.difficulty}
                          </span>
                          {b.wager_gems > 0 && (
                            <span className="inline-flex items-center gap-0.5 font-display text-xs font-700 text-primary-dark">
                              <Gem className="h-3 w-3" />
                              {b.wager_gems}
                            </span>
                          )}
                        </div>
                      </div>
                      {won && (
                        <span className="inline-flex items-center gap-1 font-display text-xs font-700 text-correct-dark">
                          <Trophy className="h-4 w-4" /> Перемога
                        </span>
                      )}
                      {lost && (
                        <span className="font-display text-xs font-700 text-wrong-dark">Поразка</span>
                      )}
                      {!won && !lost && (
                        <span className={cn("rounded-full px-2 py-0.5 font-display text-xs font-700", meta.cls)}>
                          {meta.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

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
    </div>
  );
}
