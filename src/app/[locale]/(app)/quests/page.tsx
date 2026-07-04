"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { GameScreen } from "@/components/layout/GameScreen";
import {
  questsApi,
  type QuestGoalType,
  type UserChainProgress,
  type UserQuestProgress,
} from "@/lib/api/quests";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";

const GOAL_EMOJI: Record<QuestGoalType, string> = {
  lessons_completed: "🎯",
  exp_earned: "⚡",
  gems_earned: "💎",
};

function computeCountdown(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  let s = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  s %= 3600;
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

function QuestTimer() {
  const [txt, setTxt] = useState(() => computeCountdown());
  useEffect(() => {
    const id = setInterval(() => setTxt(computeCountdown()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="quest-timer">
      <div className="qt-ic">⏳</div>
      <div>
        <b>Нові завдання через {txt}</b>
        <span>Оновлюються щодня опівночі</span>
      </div>
    </div>
  );
}

function rewardLine(exp: number, gems: number): string {
  const parts: string[] = [];
  if (exp > 0) parts.push(`⚡ +${exp} XP`);
  if (gems > 0) parts.push(`💎 +${gems}`);
  return parts.join(" · ") || "Нагорода";
}

function QuestCard({
  quest,
  onClaim,
  claiming,
}: {
  quest: UserQuestProgress;
  onClaim: (id: string) => void;
  claiming: boolean;
}) {
  const target = quest.quest.target_value;
  const progress = Math.min(quest.progress, target);
  const pct = target > 0 ? Math.round((progress / target) * 100) : 0;
  const isClaimed = quest.status === "claimed";
  const canClaim = quest.is_complete && !isClaimed;

  return (
    <div className={`quest${isClaimed || quest.is_complete ? " done" : ""}`}>
      <div className="q-ic">{GOAL_EMOJI[quest.quest.goal_type] ?? "🎯"}</div>
      <div className="q-body">
        <div className="q-title">{quest.quest.title}</div>
        <div className="q-reward-line">{rewardLine(quest.quest.reward_exp, quest.quest.reward_gems)}</div>
        <div className="q-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="q-prog">
          {progress} / {target}
          {isClaimed ? " · отримано" : quest.is_complete ? " · виконано" : ""}
        </div>
      </div>
      {isClaimed ? (
        <button className="q-claim" disabled>
          ✓
        </button>
      ) : canClaim ? (
        <button className="q-claim" disabled={claiming} onClick={() => onClaim(quest.id)}>
          Забрати
        </button>
      ) : (
        <button className="q-claim locked" disabled>
          {progress} / {target}
        </button>
      )}
    </div>
  );
}

function ChainCard({
  chain,
  onClaim,
  claiming,
}: {
  chain: UserChainProgress;
  onClaim: (chainId: string) => void;
  claiming: boolean;
}) {
  const isCompleted = chain.status === "completed";
  const currentStep = chain.steps.find((s) => s.order === chain.current_order);
  const target = chain.current_target ?? currentStep?.quest.target_value ?? 0;
  const progress = Math.min(chain.step_progress, target);
  const pct = target > 0 ? Math.round((progress / target) * 100) : isCompleted ? 100 : 0;
  const stepReady = !isCompleted && target > 0 && chain.step_progress >= target;

  return (
    <div className={`quest${isCompleted || stepReady ? " done" : ""}`}>
      <div className="q-ic">🔗</div>
      <div className="q-body">
        <div className="q-title">{chain.title}</div>
        <div className="q-reward-line">
          {isCompleted
            ? "Ланцюжок завершено"
            : rewardLine(currentStep?.quest.reward_exp ?? 0, currentStep?.quest.reward_gems ?? 0)}
        </div>
        <div className="q-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="q-prog">
          {isCompleted
            ? `${chain.steps.length} / ${chain.steps.length} кроків`
            : `Крок ${chain.current_order} · ${progress} / ${target}`}
        </div>
      </div>
      {isCompleted ? (
        <button className="q-claim" disabled>
          ✓
        </button>
      ) : stepReady ? (
        <button className="q-claim" disabled={claiming} onClick={() => onClaim(chain.chain_id)}>
          Забрати
        </button>
      ) : (
        <button className="q-claim locked" disabled>
          {progress} / {target}
        </button>
      )}
    </div>
  );
}

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      daily: UserQuestProgress[];
      weekly: UserQuestProgress[];
      chains: UserChainProgress[];
    };

export default function QuestsPage() {
  const { updateUser } = useAuthStore();
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    Promise.all([
      questsApi.list().catch(() => [] as UserQuestProgress[]),
      questsApi.weekly().catch(() => [] as UserQuestProgress[]),
      questsApi.chains().catch(() => [] as UserChainProgress[]),
    ])
      .then(([daily, weekly, chains]) => setState({ status: "ready", daily, weekly, chains }))
      .catch(() => setState({ status: "error" }));
  }, []);

  const reload = () => {
    setState({ status: "loading" });
    fetchAll();
  };

  useEffect(fetchAll, [fetchAll]);

  const markClaimed = (id: string) =>
    setState((prev) =>
      prev.status === "ready"
        ? {
            ...prev,
            daily: prev.daily.map((q) =>
              q.id === id ? { ...q, status: "claimed", claimed_at: new Date().toISOString() } : q,
            ),
            weekly: prev.weekly.map((q) =>
              q.id === id ? { ...q, status: "claimed", claimed_at: new Date().toISOString() } : q,
            ),
          }
        : prev,
    );

  const handleClaimQuest = async (id: string) => {
    setClaimingId(id);
    try {
      const res = await questsApi.claim(id);
      updateUser({ gems: res.gems, exp: res.exp });
      const parts = [
        res.reward_gems > 0 ? `+${res.reward_gems} 💎` : null,
        res.reward_exp > 0 ? `+${res.reward_exp} XP` : null,
      ].filter(Boolean);
      toast.success(parts.length ? `Нагороду отримано · ${parts.join(" · ")}` : "Нагороду отримано");
      markClaimed(id);
    } catch {
      reload();
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimChain = async (chainId: string) => {
    setClaimingId(chainId);
    try {
      const res = await questsApi.claimChain(chainId);
      updateUser({ gems: res.gems, exp: res.exp });
      const parts = [
        res.reward_gems > 0 ? `+${res.reward_gems} 💎` : null,
        res.reward_exp > 0 ? `+${res.reward_exp} XP` : null,
      ].filter(Boolean);
      const head = res.chain_completed ? "Ланцюжок завершено" : "Крок отримано";
      toast.success(parts.length ? `${head} · ${parts.join(" · ")}` : head);
      // chain step advances server-side — refetch to reflect new current step
      questsApi
        .chains()
        .then((chains) =>
          setState((prev) => (prev.status === "ready" ? { ...prev, chains } : prev)),
        )
        .catch(() => {});
    } catch {
      reload();
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <GameScreen>
      <section className="view active">
        <div className="path-head">
          <button className="back" onClick={() => router.push("/home")} aria-label="Назад">
            ←
          </button>
          <div>
            <h2>Завдання</h2>
            <div className="ps">Щоденні квести · виконуй та отримуй нагороди</div>
          </div>
        </div>

        {state.status === "loading" && <div className="league-empty">Завантаження…</div>}
        {state.status === "error" && (
          <div className="league-empty">
            Не вдалося завантажити завдання.{" "}
            <button className="result-link" onClick={reload} style={{ textDecoration: "underline" }}>
              Спробувати ще раз
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <QuestTimer />

            {state.daily.length === 0 &&
              state.weekly.length === 0 &&
              state.chains.length === 0 && (
                <div className="league-empty">Наразі немає активних завдань</div>
              )}

            {state.daily.length > 0 && (
              <>
                <div className="shop-cat">Щоденні</div>
                <div className="quest-list">
                  {state.daily.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onClaim={handleClaimQuest}
                      claiming={claimingId === quest.id}
                    />
                  ))}
                </div>
              </>
            )}

            {state.weekly.length > 0 && (
              <>
                <div className="shop-cat">Щотижневі</div>
                <div className="quest-list">
                  {state.weekly.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onClaim={handleClaimQuest}
                      claiming={claimingId === quest.id}
                    />
                  ))}
                </div>
              </>
            )}

            {state.chains.length > 0 && (
              <>
                <div className="shop-cat">Ланцюжки</div>
                <div className="quest-list">
                  {state.chains.map((chain) => (
                    <ChainCard
                      key={chain.chain_id}
                      chain={chain}
                      onClaim={handleClaimChain}
                      claiming={claimingId === chain.chain_id}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </GameScreen>
  );
}
