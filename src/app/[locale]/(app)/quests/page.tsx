"use client";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  Gem,
  Gift,
  ListChecks,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  questsApi,
  type QuestGoalType,
  type UserChainProgress,
  type UserQuestProgress,
} from "@/lib/api/quests";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { cn } from "@/lib/utils";

type IconComp = React.ComponentType<{ className?: string }>;

const GOAL_ICON: Record<QuestGoalType, IconComp> = {
  lessons_completed: BookOpen,
  exp_earned: Zap,
  gems_earned: Gem,
};

function RewardPills({ gems, exp }: { gems: number; exp: number }) {
  return (
    <div className="flex items-center gap-2">
      {gems > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5">
          <Gem className="h-3.5 w-3.5 text-primary-dark" />
          <span className="font-display text-xs font-700 text-primary-dark">{gems}</span>
        </span>
      )}
      {exp > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-reward-light px-2 py-0.5">
          <Zap className="h-3.5 w-3.5 text-reward-dark" />
          <span className="font-display text-xs font-700 text-reward-dark">{exp}</span>
        </span>
      )}
    </div>
  );
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
  const Icon = GOAL_ICON[quest.quest.goal_type] ?? Target;
  const target = quest.quest.target_value;
  const progress = Math.min(quest.progress, target);
  const isClaimed = quest.status === "claimed";
  const canClaim = quest.is_complete && !isClaimed;

  return (
    <div
      className={cn(
        "rounded-2xl p-4 transition-colors",
        isClaimed ? "border border-correct/40 bg-correct-light/40 shadow-soft" : "glass lift",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isClaimed ? "bg-correct-light" : "bg-primary-light",
          )}
        >
          {isClaimed ? (
            <Check className="h-5 w-5 text-correct-dark" />
          ) : (
            <Icon className="h-5 w-5 text-primary-dark" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-700 text-text-primary">{quest.quest.title}</h3>
          {quest.quest.description && (
            <p className="mt-0.5 font-body text-xs text-text-secondary">{quest.quest.description}</p>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-display text-xs font-600 text-text-secondary">Прогрес</span>
          <span className="font-display text-xs font-700 tabular-nums text-text-primary">
            {progress} / {target}
          </span>
        </div>
        <ProgressBar
          value={progress}
          max={target}
          size="sm"
          color={quest.is_complete ? "correct" : "primary"}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <RewardPills gems={quest.quest.reward_gems} exp={quest.quest.reward_exp} />
        {isClaimed ? (
          <span className="font-display text-xs font-700 text-correct-dark">Отримано</span>
        ) : (
          <Button
            size="sm"
            disabled={!canClaim}
            loading={claiming}
            onClick={() => onClaim(quest.id)}
            className="shrink-0"
          >
            <span className="flex items-center gap-1">
              <Gift className="h-4 w-4" /> Забрати
            </span>
          </Button>
        )}
      </div>
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
  const stepReady = !isCompleted && target > 0 && chain.step_progress >= target;

  return (
    <div
      className={cn(
        "rounded-2xl p-4 transition-colors",
        isCompleted ? "border border-correct/40 bg-correct-light/40 shadow-soft" : "glass lift",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isCompleted ? "bg-correct-light" : "bg-primary-light",
          )}
        >
          {isCompleted ? (
            <Check className="h-5 w-5 text-correct-dark" />
          ) : (
            <ListChecks className="h-5 w-5 text-primary-dark" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-700 text-text-primary">{chain.title}</h3>
          {chain.description && (
            <p className="mt-0.5 font-body text-xs text-text-secondary">{chain.description}</p>
          )}
        </div>
      </div>

      {/* Step pips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {chain.steps.map((step) => {
          const done = isCompleted || step.order < chain.current_order;
          const active = !isCompleted && step.order === chain.current_order;
          return (
            <span
              key={step.order}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full font-display text-[11px] font-700",
                done
                  ? "bg-correct text-white"
                  : active
                    ? "bg-primary text-white"
                    : "bg-border/60 text-text-secondary",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : step.order}
            </span>
          );
        })}
      </div>

      {isCompleted ? (
        <p className="mt-3 font-display text-xs font-700 text-correct-dark">Ланцюжок завершено</p>
      ) : (
        <>
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-display text-xs font-600 text-text-secondary">
                {currentStep?.quest.title ?? `Крок ${chain.current_order}`}
              </span>
              <span className="font-display text-xs font-700 tabular-nums text-text-primary">
                {progress} / {target}
              </span>
            </div>
            <ProgressBar
              value={progress}
              max={target || 1}
              size="sm"
              color={stepReady ? "correct" : "primary"}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <RewardPills
              gems={currentStep?.quest.reward_gems ?? 0}
              exp={currentStep?.quest.reward_exp ?? 0}
            />
            <Button
              size="sm"
              disabled={!stepReady}
              loading={claiming}
              onClick={() => onClaim(chain.chain_id)}
              className="shrink-0"
            >
              <span className="flex items-center gap-1">
                <Gift className="h-4 w-4" /> Забрати крок
              </span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function SectionHeader({ Icon, title }: { Icon: IconComp; title: string }) {
  return (
    <div className="flex items-center gap-2 px-1 pt-2">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="font-display text-sm font-800 text-text-primary">{title}</h2>
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
        <p className="font-body text-text-secondary">Не вдалося завантажити завдання</p>
        <Button onClick={reload}>Спробувати ще раз</Button>
      </div>
    );
  }

  const { daily, weekly, chains } = state;
  const isEmpty = daily.length === 0 && weekly.length === 0 && chains.length === 0;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3">
          <h1 className="font-display text-base font-800 text-primary-dark">Завдання</h1>
          <Target className="h-5 w-5 text-primary" />
        </div>
      </header>

      <main className="stagger mx-auto max-w-app space-y-3 px-4 py-6">
        {isEmpty && (
          <p className="py-12 text-center font-body text-sm text-text-secondary">
            Наразі немає активних завдань
          </p>
        )}

        {daily.length > 0 && (
          <>
            <SectionHeader Icon={Target} title="Щоденні" />
            {daily.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaim={handleClaimQuest}
                claiming={claimingId === quest.id}
              />
            ))}
          </>
        )}

        {weekly.length > 0 && (
          <>
            <SectionHeader Icon={CalendarDays} title="Щотижневі" />
            {weekly.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaim={handleClaimQuest}
                claiming={claimingId === quest.id}
              />
            ))}
          </>
        )}

        {chains.length > 0 && (
          <>
            <SectionHeader Icon={ListChecks} title="Ланцюжки" />
            {chains.map((chain) => (
              <ChainCard
                key={chain.chain_id}
                chain={chain}
                onClaim={handleClaimChain}
                claiming={claimingId === chain.chain_id}
              />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
