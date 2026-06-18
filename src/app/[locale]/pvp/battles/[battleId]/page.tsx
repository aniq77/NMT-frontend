"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Gem, Swords, Trophy, Zap } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { AnswerOption } from "@/components/ui/AnswerOption";
import { Button } from "@/components/ui/Button";
import { MathText } from "@/components/ui/MathText";
import { ApiError } from "@/lib/api/client";
import { lessonsApi, type Question } from "@/lib/api/lessons";
import { pvpApi, type BattleDetail, type BattleResult } from "@/lib/api/pvp";
import { useAuthStore } from "@/store/auth.store";

type Phase = "loading" | "error" | "intro" | "quiz" | "submitting" | "result" | "finished";

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function BattlePage() {
  const { battleId } = useParams<{ battleId: string }>();
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();

  const [phase, setPhase] = useState<Phase>("loading");
  const [battle, setBattle] = useState<BattleDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedId, setCheckedId] = useState<string | null>(null);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [result, setResult] = useState<BattleResult | null>(null);

  const submittedRef = useRef(false);

  // ── Load battle ───────────────────────────────────────────────────────────────
  useEffect(() => {
    pvpApi
      .getBattle(battleId)
      .then((b) => {
        setBattle(b);
        if (b.status === "active" && b.lesson) {
          setQuestions(b.lesson.questions);
          setSecondsLeft(b.seconds_remaining ?? b.time_limit_seconds ?? null);
          setPhase("intro");
        } else {
          setPhase("finished");
        }
      })
      .catch((err) => {
        setPhase(err instanceof ApiError ? "error" : "error");
      });
  }, [battleId]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const submitScore = useCallback(
    async (finalCorrect: number, finalMaxCombo: number) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setPhase("submitting");
      const total = questions.length || 1;
      const score = Math.round((finalCorrect / total) * 100);
      try {
        const res = await pvpApi.submit(battleId, { score, max_combo: finalMaxCombo });
        setResult(res);
        setPhase("result");
        fetchMe().catch(() => {});
      } catch {
        // If already submitted / deadline passed, fall back to showing battle state.
        setPhase("finished");
      }
    },
    [battleId, questions.length, fetchMe],
  );

  // ── Countdown ─────────────────────────────────────────────────────────────────
  // The auto-submit on timeout fires from the timer callback (not the effect body)
  // so we never call setState synchronously during the effect.
  useEffect(() => {
    if (phase !== "quiz" || secondsLeft === null || secondsLeft <= 0) return;
    const id = setTimeout(() => {
      if (secondsLeft <= 1) {
        setSecondsLeft(0);
        submitScore(correctCount, maxCombo);
      } else {
        setSecondsLeft(secondsLeft - 1);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [phase, secondsLeft, correctCount, maxCombo, submitScore]);

  const current = questions[currentIdx];

  const handleCheck = async () => {
    if (!selectedId || !battle?.lesson || checking) return;
    setChecking(true);
    try {
      const res = await lessonsApi.answer(battle.lesson.id, {
        question_id: current.id,
        selected_option_ids: [selectedId],
      });
      setCheckedId(selectedId);
      setCorrectIds(res.correct_option_ids);
      if (res.is_correct) {
        setCorrectCount((c) => c + 1);
        setCombo((c) => {
          const next = c + 1;
          setMaxCombo((m) => Math.max(m, next));
          return next;
        });
      } else {
        setCombo(0);
      }
    } catch {
      // network hiccup — let the user retry the check
    } finally {
      setChecking(false);
    }
  };

  const handleNext = () => {
    const isLast = currentIdx >= questions.length - 1;
    if (isLast) {
      submitScore(correctCount, maxCombo);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelectedId(null);
    setCheckedId(null);
    setCorrectIds([]);
  };

  const handleForfeit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setPhase("submitting");
    try {
      const res = await pvpApi.forfeit(battleId);
      setResult(res);
      setPhase("result");
      fetchMe().catch(() => {});
    } catch {
      setPhase("finished");
    }
  };

  // ── Loading / error ─────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4">
        <p className="font-body text-text-secondary">Бій не знайдено</p>
        <Button onClick={() => router.push("/pvp")}>До дуелей</Button>
      </div>
    );
  }

  const opponent = battle?.players.find((p) => p.user_id !== user?.id);

  // ── Intro ─────────────────────────────────────────────────────────────────────
  if (phase === "intro" && battle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <Swords className="mx-auto mb-4 h-20 w-20 text-primary" />
          <h1 className="font-display text-2xl font-800 text-text-primary">Дуель!</h1>
          <p className="mt-2 font-body text-base text-text-secondary">
            проти {opponent?.nickname ?? "суперника"}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-reward-light px-3 py-1.5 font-display text-sm font-700 text-reward-dark">
              <Clock className="h-4 w-4" />
              {secondsLeft !== null ? fmtTime(secondsLeft) : "—"}
            </span>
            {battle.wager_gems > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1.5 font-display text-sm font-700 text-primary-dark">
                <Gem className="h-4 w-4" />
                {battle.wager_gems}
              </span>
            )}
          </div>
          <p className="mt-4 font-body text-sm text-text-secondary">
            {questions.length} питань. Відповідайте швидко й точно!
          </p>
          <div className="mt-6 space-y-3">
            <Button size="lg" className="w-full" onClick={() => setPhase("quiz")}>
              Почати бій
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={handleForfeit}>
              Здатися
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Submitting ─────────────────────────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        <p className="font-body text-text-secondary">Підрахунок результату…</p>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const isWin = result.outcome === "won";
    const isDraw = result.outcome === "draw";
    const isWaiting = result.outcome === "waiting_for_opponent";
    const expReward = result.rewards?.exp ?? result.rewards?.exp_reward ?? 0;
    const gemReward = result.rewards?.gems ?? result.rewards?.gems_reward ?? 0;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          {isWaiting ? (
            <>
              <Clock className="mx-auto mb-4 h-20 w-20 text-reward" />
              <h1 className="font-display text-2xl font-800 text-text-primary">Очікуємо суперника</h1>
              <p className="mt-2 font-body text-base text-text-secondary">
                Ваш результат збережено. Переможця буде визначено, коли суперник завершить бій.
              </p>
            </>
          ) : (
            <>
              <Trophy
                className={`mx-auto mb-4 h-20 w-20 ${isWin ? "text-reward" : isDraw ? "text-text-secondary" : "text-wrong"}`}
              />
              <h1 className="font-display text-2xl font-800 text-text-primary">
                {isWin ? "Перемога!" : isDraw ? "Нічия" : "Поразка"}
              </h1>
              {(expReward > 0 || gemReward > 0) && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  {expReward > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-reward-light px-3 py-1.5 font-display text-sm font-700 text-reward-dark">
                      <Zap className="h-4 w-4" /> +{expReward} XP
                    </span>
                  )}
                  {gemReward > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1.5 font-display text-sm font-700 text-primary-dark">
                      <Gem className="h-4 w-4" /> +{gemReward}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
          <div className="mt-6 space-y-3">
            {isWaiting && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  submittedRef.current = true;
                  router.push("/pvp");
                }}
              >
                До списку боїв
              </Button>
            )}
            {!isWaiting && (
              <Button size="lg" className="w-full" onClick={() => router.push("/pvp")}>
                До дуелей
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Finished / not playable ─────────────────────────────────────────────────────
  if (phase === "finished") {
    const won = battle?.winner_user_id === user?.id;
    const decided = battle?.status === "finished" && battle.winner_user_id;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <Swords className="mx-auto mb-4 h-16 w-16 text-text-secondary" />
          <h1 className="font-display text-xl font-800 text-text-primary">
            {decided ? (won ? "Ви перемогли" : "Бій завершено") : "Бій недоступний"}
          </h1>
          <p className="mt-2 font-body text-sm text-text-secondary">
            Цей бій уже завершено або не може бути зіграний.
          </p>
          <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/pvp")}>
            До дуелей
          </Button>
        </div>
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  if (phase === "quiz" && current) {
    const answered = checkedId !== null;
    const options = current.options;

    return (
      <div className="flex min-h-screen flex-col bg-canvas">
        <header className="sticky top-0 z-40 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-app items-center justify-between">
            <span className="font-display text-sm font-700 text-text-primary">
              {currentIdx + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-2">
              {combo >= 2 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-reward-light px-2 py-0.5 font-display text-xs font-700 text-reward-dark">
                  🔥 {combo}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-wrong-light px-2 py-0.5 font-display text-xs font-700 text-wrong-dark">
                <Clock className="h-3.5 w-3.5" />
                {secondsLeft !== null ? fmtTime(secondsLeft) : "—"}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-app flex-1 px-4 py-6">
          <div className="mb-6 font-display text-lg font-700 text-text-primary">
            <MathText text={current.text} />
          </div>
          <div className="space-y-3">
            {options.map((opt, i) => {
              let optState: "default" | "selected" | "correct" | "wrong" = "default";
              if (answered) {
                if (correctIds.includes(opt.id)) optState = "correct";
                else if (opt.id === checkedId) optState = "wrong";
              } else if (opt.id === selectedId) {
                optState = "selected";
              }
              return (
                <AnswerOption
                  key={opt.id}
                  index={i}
                  content={opt.text}
                  state={optState}
                  disabled={answered}
                  onClick={() => !answered && setSelectedId(opt.id)}
                />
              );
            })}
          </div>
        </main>

        <footer className="sticky bottom-0 border-t border-border bg-surface px-4 py-4">
          <div className="mx-auto max-w-app">
            {answered ? (
              <Button size="lg" className="w-full" onClick={handleNext}>
                {currentIdx >= questions.length - 1 ? "Завершити бій" : "Далі"}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full"
                disabled={!selectedId}
                loading={checking}
                onClick={handleCheck}
              >
                Перевірити
              </Button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  return null;
}
