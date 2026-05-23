"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Gem, HeartCrack, PartyPopper, Trophy, Zap } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { LessonHeader } from "@/components/layout/LessonHeader";
import { AnswerOption } from "@/components/ui/AnswerOption";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { Button } from "@/components/ui/Button";
import { lessonsApi, type CompleteLessonResult, type Question, type QuestionOption } from "@/lib/api/lessons";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";

const MAX_LIVES = 5;

type ShuffledOption = QuestionOption & { originalIndex: number };

function shuffleOptions(options: QuestionOption[]): ShuffledOption[] {
  return [...options]
    .map((o, i) => ({ ...o, originalIndex: i }))
    .sort(() => Math.random() - 0.5);
}

type Phase = "loading" | "energy_gate" | "quiz" | "completing" | "done";

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
  const [lives, setLives] = useState(MAX_LIVES);
  const [showLivesGate, setShowLivesGate] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [completeResult, setCompleteResult] = useState<CompleteLessonResult | null>(null);

  const completeCalledRef = useRef(false);
  const topicPath = `/courses/${courseId}/categories/${categorySlug}/topics/${topicSlug}`;

  useEffect(() => {
    if (user) setLives(user.lives ?? MAX_LIVES);
  }, [user]);

  useEffect(() => {
    Promise.all([lessonsApi.start(lessonId), lessonsApi.questions(lessonId)])
      .then(([, qs]) => {
        setQuestions(qs);
        if (qs.length > 0) setShuffledOptions(shuffleOptions(qs[0].options));
        setPhase("quiz");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 400) {
          setPhase("energy_gate");
        } else {
          setPhase("quiz");
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const currentQ: Question | undefined = questions[currentIdx];
  const isChecked = checkedId !== null;
  const isCorrect = isChecked && currentQ?.options.find((o) => o.id === checkedId)?.is_correct === true;
  const progress = questions.length > 0 ? Math.round((currentIdx / questions.length) * 100) : 0;

  function handleCheck() {
    if (!selectedId || !currentQ) return;
    setCheckedId(selectedId);
    const correct = currentQ.options.find((o) => o.id === selectedId)?.is_correct ?? false;
    if (correct) {
      setCorrectCount((p) => p + 1);
      setXpEarned((p) => p + (currentQ ? Math.round(50 / questions.length) : 0));
      setComboStreak((p) => {
        const next = p + 1;
        setMaxCombo((prev) => Math.max(prev, next));
        return next;
      });
    } else {
      setLives((p) => Math.max(0, p - 1));
      setComboStreak(0);
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

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;
    const passed = score >= 50;

    lessonsApi
      .complete(lessonId, { score, passed, max_combo: maxCombo })
      .then((result) => {
        setCompleteResult(result);
        updateUser({ level: result.level, lives: result.lives, gems: result.gems });
        fetchMe().catch(() => {});
        setPhase("done");
      })
      .catch(() => setPhase("done"));
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
              className="w-full bg-reward text-reward-dark hover:bg-reward-dark hover:text-white"
              onClick={() => {
                setLives(1);
                setShowLivesGate(false);
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <Gem className="h-5 w-5" /> Витратити 10 кристалів
              </span>
            </Button>
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
                {currentQ.text}
              </h2>
            </div>

            <div className="space-y-2.5">
              {shuffledOptions.map((option, i) => {
                let state: "default" | "selected" | "correct" | "wrong" = "default";
                if (isChecked) {
                  if (option.is_correct) state = "correct";
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
              explanation={currentQ?.explanation}
              xpGained={isCorrect ? Math.round(50 / questions.length) : 0}
              onContinue={handleContinue}
            />
          ) : (
            <div className="border-t border-border bg-canvas/95 px-4 pb-6 pt-3 backdrop-blur-sm">
              <Button
                size="lg"
                className="w-full"
                disabled={selectedId === null}
                onClick={handleCheck}
              >
                Перевірити
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
