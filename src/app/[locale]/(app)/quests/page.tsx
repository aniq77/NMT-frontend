"use client";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Check, Gem, Gift, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { questsApi, type QuestGoalType, type UserQuestProgress } from "@/lib/api/quests";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

type IconComp = React.ComponentType<{ className?: string }>;

const GOAL_ICON: Record<QuestGoalType, IconComp> = {
  lessons_completed: BookOpen,
  exp_earned: Zap,
  gems_earned: Gem,
};

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; quests: UserQuestProgress[] };

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
        isClaimed ? "border border-correct/40 bg-correct-light/40 shadow-soft" : "glass",
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
        <div className="flex items-center gap-2">
          {quest.quest.reward_gems > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5">
              <Gem className="h-3.5 w-3.5 text-primary-dark" />
              <span className="font-display text-xs font-700 text-primary-dark">
                {quest.quest.reward_gems}
              </span>
            </span>
          )}
          {quest.quest.reward_exp > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-reward-light px-2 py-0.5">
              <Zap className="h-3.5 w-3.5 text-reward-dark" />
              <span className="font-display text-xs font-700 text-reward-dark">
                {quest.quest.reward_exp}
              </span>
            </span>
          )}
        </div>
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

export default function QuestsPage() {
  const { updateUser } = useAuthStore();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchQuests = useCallback(() => {
    questsApi
      .list()
      .then((quests) => setState({ status: "ready", quests }))
      .catch(() => setState({ status: "error" }));
  }, []);

  const reload = () => {
    setState({ status: "loading" });
    fetchQuests();
  };

  useEffect(fetchQuests, [fetchQuests]);

  const handleClaim = async (id: string) => {
    setClaimingId(id);
    try {
      const res = await questsApi.claim(id);
      updateUser({ gems: res.gems, exp: res.exp });
      setState((prev) =>
        prev.status === "ready"
          ? {
              status: "ready",
              quests: prev.quests.map((q) =>
                q.id === id ? { ...q, status: "claimed", claimed_at: new Date().toISOString() } : q,
              ),
            }
          : prev,
      );
    } catch {
      // refresh from server on failure to stay consistent
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

  const claimedCount = state.quests.filter((q) => q.status === "claimed").length;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3">
          <h1 className="font-display text-base font-800 text-primary-dark">Щоденні завдання</h1>
          <span className="font-display text-xs font-600 text-text-secondary">
            {claimedCount} / {state.quests.length}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-app space-y-3 px-4 py-6">
        {state.quests.length === 0 ? (
          <p className="py-12 text-center font-body text-sm text-text-secondary">
            На сьогодні завдань немає
          </p>
        ) : (
          state.quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onClaim={handleClaim}
              claiming={claimingId === quest.id}
            />
          ))
        )}
      </main>
    </div>
  );
}
