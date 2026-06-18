"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Gem, HeartCrack, Lock, PartyPopper, RefreshCw, Trophy, Zap } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { LessonHeader } from "@/components/layout/LessonHeader";
import { AnswerOption } from "@/components/ui/AnswerOption";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { Button } from "@/components/ui/Button";
import {
  lessonsApi,
  type AnswerPayload,
  type CompleteLessonResult,
  type Question,
  type QuestionOption,
  type QuestionResult,
} from "@/lib/api/lessons";
import { MathText } from "@/components/ui/MathText";
import { ApiError } from "@/lib/api/client";
import { shopApi } from "@/lib/api/shop";
import { useAuthStore } from "@/store/auth.store";

const MAX_LIVES = 5;

type ShuffledOption = QuestionOption & { originalIndex: number };

function shuffleOptions(options: QuestionOption[]): ShuffledOption[] {
  return [...options]
    .map((o, i) => ({ ...o, originalIndex: i }))
    .sort(() => Math.random() - 0.5);
}

type Phase = "loading" | "energy_gate" | "locked" | "load_error" | "quiz" | "completing" | "done";

export default function LessonPageClient() {
  const params = useParams<{
    courseId: string;
    categorySlug: string;
    topicSlug: string;
    lessonId: string;
  }>();
  const { courseId, categorySlug, topicSlug, lessonId } = params;
  const router = useRouter();
  const { user, updateUser, fetchMe } = useAuthStore();

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedId, setCheckedId] = useState<string | null>(null);
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<AnswerPayload[]>([]);
  const [lives, setLives] = useState(MAX_LIVES);
  const [showLivesGate, setShowLivesGate] = useState(false);
  const [restoringLife, setRestoringLife] = useState(false);
  const [lifeRestoreError, setLifeRestoreError] = useState<string>("");
  const [correctCount, setCorrectCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [completeResult, setCompleteResult] = useState<CompleteLessonResult | null>(null);
  const [completionSaved, setCompletionSaved] = useState(false);
  const [loadError, setLoadError] = useState<string>("");

  const completeCalledRef = useRef(false);
  const topicPath = `/courses/${courseId}/categories/${categorySlug}`;

  useEffect(() => {
    if (user) setLives(user.lives ?? MAX_LIVES);
  }, [user]);

  const loadLesson = useCallback(() => {
    setPhase("loading");
    setLoadError("");
    Promise.all([lessonsApi.start(lessonId), lessonsApi.questions(lessonId)])
      .then(([, qs]) => {
        if (!qs || qs.length === 0) {
          // Start succeeded but the bank returned no questions — never show an
          // empty, unplayable quiz. Surface it so the user can retry / go back.
          setLoadError("Завдання для цього уроку не завантажились. Спробуйте ще раз.");
          setPhase("load_error");
          return;
        }
        setQuestions(qs);
        setShuffledOptions(shuffleOptions(qs[0].options));
        setPhase("quiz");
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 400) {
            setPhase("energy_gate");
            return;
          }
          if (err.status === 403) {
            setPhase("locked");
            return;
          }
          const detail =
            typeof err.data?.detail === "string" ? err.data.detail : "";
          setLoadError(detail || `Помилка завантаження (код ${err.status}).`);
          setPhase("load_error");
          return;
        }
        setLoadError("Не вдалося з'єднатися із сервером. Перевірте інтернет і спробуйте ще раз.");
        setPhase("load_error");
      });
  }, [lessonId]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  const currentQ: Question | undefined = questions[currentIdx];
  const isChecked = result !== null;
  const isCorrect = result?.is_correct === true;
  const progress = questions.length > 0 ? Math.round((currentIdx / questions.length) * 100) : 0;

  async function handleCheck() {
    if (!selectedId || !currentQ || submitting) return;
    setSubmitting(true);

    const payload: AnswerPayload = {
      question_id: currentQ.id,
      selected_option_ids: [selectedId],
    };

    try {
      const res = await lessonsApi.answer(lessonId, payload);
      setResult(res);
      setCheckedId(selectedId);
      setAnswers((prev) => [...prev, payload]);

      if (res.is_correct) {
        setCorrectCount((p) => p + 1);
        setXpEarned((p) => p + (questions.length > 0 ? Math.round(50 / questions.length) : 0));
        setComboStreak((p) => {
          const next = p + 1;
          setMaxCombo((prev) => Math.max(prev, next));
          return next;
        });
      } else {
        setLives((p) => Math.max(0, p - 1));
        setComboStreak(0);
      }
    } catch {
      // Network/validation error — leave the question unanswered so the user can retry.
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (lives === 0 && !isCorrect) {
      setShowLivesGate(true);
      return;
    }

    const nextIdx = currentIdx + 1;
    setSelectedId(null);
    setCheckedId(null);
    setResult(null);

    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      setShuffledOptions(shuffleOptions(questions[nextIdx].options));
    } else {
      finishLesson();
    }
  }

  function finishLesson() {
    if (completeCalledRef.current) return;
    completeCalledRef.current = true;
    setPhase("completing");

    lessonsApi
      .complete(lessonId, { answers })
      .then((res) => {
        setCompleteResult(res);
        setCompletionSaved(true);
        updateUser({ level: res.level, lives: res.lives, gems: res.gems });
        fetchMe().catch(() => {});
        setPhase("done");
      })
      .catch(() => {
        setCompletionSaved(false);
        setPhase("done");
      });
  }

  function retryFinishLesson() {
    completeCalledRef.current = false;
    finishLesson();
  }

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  // ── Energy gate ───────────────────────────────────────────────────────────────
  if (phase === "energy_gate") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <Zap className="mx-auto mb-4 h-20 w-20 text-reward" />
          <h1 className="font-display text-2xl font-800 text-text-primary">Немає енергії!</h1>
          <p className="mt-2 font-body text-base text-text-secondary">
            Зачекайте відновлення енергії або поверніться пізніше
          </p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-reward-light px-5 py-2">
              <Zap className="h-4 w-4 text-reward-dark" />
              <span className="font-display text-sm font-700 text-reward-dark">
                Енергія: {user.energy}
              </span>
            </div>
          )}
          <Button variant="ghost" size="lg" className="mt-8 w-full" onClick={() => router.push(topicPath)}>
            ← Назад до острова
          </Button>
        </div>
      </div>
    );
  }

  // ── Locked ────────────────────────────────────────────────────────────────────
  if (phase === "locked") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <Lock className="mx-auto mb-4 h-20 w-20 text-text-secondary" />
          <h1 className="font-display text-2xl font-800 text-text-primary">Урок ще закритий</h1>
          <p className="mt-2 font-body text-base text-text-secondary">
            Спочатку пройди попередню тему хоча б один раз, щоб відкрити цей урок.
          </p>
          <Button size="lg" className="mt-8 w-full" onClick={() => router.push(topicPath)}>
            ← Назад до острова
          </Button>
        </div>
      </div>
    );
  }

  // ── Load error ────────────────────────────────────────────────────────────────
  if (phase === "load_error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <RefreshCw className="mx-auto mb-4 h-20 w-20 text-wrong" />
          <h1 className="font-display text-2xl font-800 text-text-primary">Не вдалося завантажити урок</h1>
          <p className="mt-2 font-body text-base text-text-secondary">{loadError}</p>
          <div className="mt-8 space-y-3">
            <Button size="lg" className="w-full" onClick={loadLesson}>
              Спробувати ще раз
            </Button>
            <Button variant="ghost" size="md" className="w-full" onClick={() => router.push(topicPath)}>
              ← Назад до острова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Lives gate ────────────────────────────────────────────────────────────────
  if (showLivesGate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <HeartCrack className="mx-auto mb-4 h-20 w-20 text-wrong" />
          <h1 className="font-display text-2xl font-800 text-text-primary">Серця закінчились!</h1>
          <p className="mt-2 font-body text-base text-text-secondary">
            Зачекайте відновлення або витратьте кристали
          </p>
          <div className="mt-6 space-y-3">
            <Button
              size="lg"
              loading={restoringLife}
              className="w-full bg-reward text-reward-dark hover:bg-reward-dark hover:text-white"
              onClick={async () => {
                setLifeRestoreError("");
                setRestoringLife(true);
                try {
                  const items = await shopApi.list();
                  const item = items.find((i) => i.item_type === "life_restore");
                  if (!item) {
                    setLifeRestoreError("Відновлення наразі недоступне");
                    return;
                  }
                  const res = await shopApi.purchase(item.id);
                  updateUser({ gems: res.gems, lives: res.lives, energy: res.energy });
                  setLives(res.lives);
                  setShowLivesGate(false);
                } catch (err) {
                  setLifeRestoreError(
                    err instanceof ApiError && err.status === 400
                      ? "Недостатньо кристалів"
                      : "Не вдалося відновити життя",
                  );
                } finally {
                  setRestoringLife(false);
                }
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <Gem className="h-5 w-5" /> Відновити життя за кристали
              </span>
            </Button>
            {lifeRestoreError && (
              <p className="font-body text-sm text-wrong-dark">{lifeRestoreError}</p>
            )}
            <Button variant="ghost" size="lg" className="w-full" onClick={() => router.push(topicPath)}>
              Назад до острова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Completion ────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;

    if (!completionSaved) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
          <div className="mx-auto w-full max-w-app text-center">
            <HeartCrack className="mx-auto mb-4 h-20 w-20 text-wrong" />
            <h1 className="font-display text-xl font-800 text-text-primary">Не вдалося зберегти</h1>
            <p className="mt-2 font-body text-base text-text-secondary">
              Прогрес не збережено через проблему з мережею. Спробуйте ще раз.
            </p>
            <div className="mt-8 space-y-3">
              <Button size="lg" className="w-full" onClick={retryFinishLesson}>
                Спробувати ще раз
              </Button>
              <Button variant="ghost" size="md" className="w-full" onClick={() => router.push(topicPath)}>
                Вийти без збереження
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <PartyPopper className="mx-auto mb-6 h-20 w-20 text-primary" />
          <h1 className="font-display text-xl font-800 text-text-primary">Урок завершено!</h1>
          <p className="mt-2 font-body text-base text-text-secondary">
            Правильних відповідей: {correctCount} / {questions.length} ({score}%)
          </p>

          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-reward-light px-6 py-3">
            <Zap className="h-5 w-5 text-reward-dark" />
            <span className="font-display text-lg font-700 text-reward-dark">
              +{completeResult?.exp ?? xpEarned} XP
            </span>
          </div>

          {completeResult?.exp_boost_active && (
            <p className="mt-2 font-display text-xs font-600 text-reward">⚡ Множник XP активний!</p>
          )}

          {(completeResult?.unlocked_achievements ?? []).length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="font-display text-xs font-600 uppercase tracking-widest text-text-secondary">
                Нові досягнення
              </p>
              {completeResult!.unlocked_achievements.map((a) => (
                <div
                  key={a.code}
                  className="flex items-center gap-3 rounded-xl border border-reward/30 bg-reward-light px-4 py-2.5"
                >
                  <Trophy className="h-5 w-5 shrink-0 text-reward-dark" />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-display text-sm font-700 text-reward-dark">{a.title}</p>
                    <p className="font-display text-xs font-600 text-reward-dark/70">{a.tier}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Button size="lg" className="w-full" onClick={() => router.push(topicPath)}>
              Продовжити
            </Button>
            <Button variant="ghost" size="md" className="w-full" onClick={() => router.push("/home")}>
              На головну
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <LessonHeader
        progress={progress}
        onClose={() => router.push(topicPath)}
        xpEarned={xpEarned}
        lives={lives}
      />

      <div className="mx-auto w-full max-w-app flex-1 space-y-4 px-4 py-5 pb-40">
        {currentQ && (
          <>
            <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
              <p className="font-display text-xs font-600 uppercase tracking-widest text-text-secondary">
                Запитання {currentIdx + 1} / {questions.length}
              </p>
              <h2 className="mt-2 font-display text-lg font-700 text-text-primary">
                <MathText text={currentQ.text} />
              </h2>
            </div>

            <div className="space-y-2.5">
              {shuffledOptions.map((option, i) => {
                let state: "default" | "selected" | "correct" | "wrong" = "default";
                if (isChecked) {
                  if (result?.correct_option_ids.includes(option.id)) state = "correct";
                  else if (option.id === checkedId) state = "wrong";
                } else if (option.id === selectedId) {
                  state = "selected";
                }
                return (
                  <AnswerOption
                    key={option.id}
                    index={i}
                    content={option.text}
                    state={state}
                    disabled={isChecked}
                    onClick={() => !isChecked && setSelectedId(option.id)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="mx-auto max-w-app">
          {isChecked ? (
            <FeedbackPanel
              type={isCorrect ? "correct" : "wrong"}
              explanation={result?.explanation}
              xpGained={isCorrect ? Math.round(50 / questions.length) : 0}
              onContinue={handleContinue}
            />
          ) : (
            <div className="border-t border-border bg-canvas/95 px-4 pb-6 pt-3 backdrop-blur-sm">
              <Button
                size="lg"
                className="w-full"
                disabled={selectedId === null || submitting}
                onClick={handleCheck}
              >
                {submitting ? "Перевіряємо..." : "Перевірити"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
