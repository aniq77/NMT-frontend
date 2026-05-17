"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Gem, Heart, HeartCrack, PartyPopper, Star, Triangle, Zap } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { withToken } from "@/lib/dev";
import { LessonHeader } from "@/components/layout/LessonHeader";
import { TheoryBlock, Formula } from "@/components/ui/TheoryBlock";
import { AlgorithmBlock } from "@/components/ui/AlgorithmBlock";
import { AnswerOption } from "@/components/ui/AnswerOption";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { Button } from "@/components/ui/Button";

const USER_XP             = 1220;
const USER_XP_TO_NEXT     = 1250;
const USER_LEVEL          = 7;
const MAX_LIVES           = 5;
const GEMS_PER_REFILL     = 10;
const GATE_REFILL_MINS    = 20;

type Question = {
  text: string;
  answers: string[];
  correct: number;
  explanation: string;
};

const QUESTIONS: Question[] = [
  {
    text: "Яке з рівнянь є квадратним?",
    answers: ["3x + 7 = 0", "x³ − 2x + 1 = 0", "2x² − 5x + 3 = 0", "x / 3 = 4"],
    correct: 2,
    explanation: "Квадратне рівняння містить x² як старший степінь при ненульовому коефіцієнті.",
  },
  {
    text: "Знайди дискримінант рівняння x² − 4x + 3 = 0",
    answers: ["28", "−4", "4", "16"],
    correct: 2,
    explanation: "a = 1, b = −4, c = 3; D = (−4)² − 4·1·3 = 16 − 12 = 4",
  },
  {
    text: "Скільки коренів має рівняння x² + 2x + 5 = 0?",
    answers: ["Два корені", "Один корінь", "Немає коренів", "Нескінченно"],
    correct: 2,
    explanation: "D = 4 − 20 = −16 < 0, тому дійсних коренів немає.",
  },
];

const ALGORITHM_STEPS = [
  {
    title: "Визнач коефіцієнти",
    description: "Запиши рівняння у стандартній формі ax² + bx + c = 0 та знайди a, b, c",
  },
  {
    title: "Обчисли дискримінант",
    formula: "D = b² − 4ac",
  },
  {
    title: "Проаналізуй знак D",
    description: "D > 0: два корені;  D = 0: один корінь;  D < 0: немає коренів",
  },
  {
    title: "Знайди корені",
    formula: "x₁,₂ = (−b ± √D) / 2a",
  },
];

const TOTAL_STEPS = 2 + QUESTIONS.length;

type Step = "theory" | "algorithm" | { type: "question"; idx: number } | "complete";

function getProgress(step: Step): number {
  if (step === "theory")    return 0;
  if (step === "algorithm") return Math.round((1 / TOTAL_STEPS) * 100);
  if (step === "complete")  return 100;
  if (typeof step === "object") {
    return Math.round(((2 + step.idx) / TOTAL_STEPS) * 100);
  }
  return 0;
}

function useGateCountdown(active: boolean, targetMs: number) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!active) return;
    const update = () => setRemaining(Math.max(0, targetMs - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [active, targetMs]);
  return {
    mins: Math.floor(remaining / 60_000),
    secs: Math.floor((remaining % 60_000) / 1_000),
  };
}

export default function LessonPage() {
  const params  = useParams<{ courseId: string }>();
  const router  = useRouter();

  const [step,          setStep]          = useState<Step>("theory");
  const [selected,      setSelected]      = useState<number | null>(null);
  const [checked,       setChecked]       = useState<number | null>(null);
  const [xpEarned,      setXpEarned]      = useState(0);
  const [lives,         setLives]         = useState(MAX_LIVES);
  const [showLivesGate, setShowLivesGate] = useState(false);
  const [showLevelUp,   setShowLevelUp]   = useState(false);

  const gateRefillTarget = useRef(Date.now() + GATE_REFILL_MINS * 60_000);
  const { mins: gateMins, secs: gateSecs } = useGateCountdown(showLivesGate, gateRefillTarget.current);

  const isQuestion = typeof step === "object" && step.type === "question";
  const currentQ   = isQuestion ? QUESTIONS[(step as { type: "question"; idx: number }).idx] : null;
  const isChecked  = checked !== null;
  const isCorrect  = isChecked && currentQ !== null && checked === currentQ.correct;

  const progress = getProgress(step);

  function handleClose() {
    router.push(withToken(`/courses/${params.courseId}`));
  }

  function handleNext() {
    if (lives === 0 && isChecked && !isCorrect) {
      setShowLivesGate(true);
      return;
    }
    setSelected(null);
    setChecked(null);
    if (step === "theory")    { setStep("algorithm"); return; }
    if (step === "algorithm") { setStep({ type: "question", idx: 0 }); return; }
    if (isQuestion) {
      const idx = (step as { type: "question"; idx: number }).idx;
      if (idx + 1 < QUESTIONS.length) {
        setStep({ type: "question", idx: idx + 1 });
      } else {
        if (USER_XP + xpEarned >= USER_XP_TO_NEXT) {
          setShowLevelUp(true);
        } else {
          setStep("complete");
        }
      }
    }
  }

  function handleCheck() {
    if (selected === null || !currentQ) return;
    setChecked(selected);
    if (selected === currentQ.correct) {
      setXpEarned((prev) => prev + 10);
    } else {
      setLives((prev) => Math.max(0, prev - 1));
    }
  }

  function handleSpendGems() {
    setLives(1);
    setShowLivesGate(false);
  }

  // Lives exhausted gate
  if (showLivesGate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <div className="mb-4 flex justify-center">
            <HeartCrack className="h-20 w-20 text-wrong" />
          </div>
          <h1 className="font-display text-2xl font-800 text-text-primary">Серця закінчились!</h1>
          <p className="mt-2 font-body text-base text-text-secondary">
            Зачекайте відновлення або витратьте кристали
          </p>

          <div className="mt-6 rounded-xl border border-wrong/30 bg-wrong-light px-6 py-4">
            <p className="font-display text-sm font-600 text-wrong-dark">Наступне серце через</p>
            <p className="mt-1 font-display text-3xl font-800 text-wrong tabular-nums">
              {gateMins}:{String(gateSecs).padStart(2, "0")}
            </p>
            <div className="mt-3 flex justify-center gap-1">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <Heart key={i} className="h-6 w-6 text-border" />
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              size="lg"
              className="w-full bg-reward text-reward-dark hover:bg-reward-dark hover:text-white"
              onClick={handleSpendGems}
            >
              <span className="flex items-center justify-center gap-2">
                <Gem className="h-5 w-5" /> Витратити {GEMS_PER_REFILL} кристалів
              </span>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => router.push(withToken("/home"))}
            >
              На головну
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Level-up celebration
  if (showLevelUp) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <div className="flex animate-bounce justify-center">
            <Star className="h-20 w-20 fill-white text-white" />
          </div>
          <p className="mt-6 font-display text-base font-600 text-white/70">Вітаємо!</p>
          <h1 className="mt-1 font-display text-3xl font-800 text-white">Новий рівень!</h1>

          <div className="mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 shadow-modal">
            <span className="font-display text-4xl font-800 text-white">
              {USER_LEVEL + 1}
            </span>
          </div>

          <p className="mt-4 font-body text-sm text-white/70">
            Рівень {USER_LEVEL + 1} розблоковано — продовжуй у тому ж дусі!
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-white/15 px-6 py-2">
            <Zap className="h-5 w-5 text-white" />
            <span className="font-display text-lg font-700 text-white">+{xpEarned} XP</span>
          </div>

          <Button
            size="lg"
            className="mt-10 w-full border-2 border-white/20 bg-white text-primary hover:bg-white/90"
            onClick={() => { setShowLevelUp(false); setStep("complete"); }}
          >
            <span className="flex items-center justify-center gap-2">
              Отримати нагороду <Star className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    );
  }

  // Completion screen
  if (step === "complete") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <div className="mb-6 flex justify-center">
            <PartyPopper className="h-20 w-20 text-primary" />
          </div>
          <h1 className="font-display text-xl font-800 text-text-primary">Урок завершено!</h1>
          <p className="mt-2 font-body text-base text-text-secondary">
            Чудова робота! Ти молодець!
          </p>
          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-reward-light px-6 py-3">
            <Zap className="h-5 w-5 text-reward-dark" />
            <span className="font-display text-lg font-700 text-reward-dark">+{xpEarned} XP</span>
          </div>
          <div className="mt-8 space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push(withToken(`/courses/${params.courseId}`))}
            >
              Продовжити
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="w-full"
              onClick={() => router.push(withToken("/home"))}
            >
              На головну
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <LessonHeader progress={progress} onClose={handleClose} xpEarned={xpEarned} lives={lives} />

      <div className="mx-auto w-full max-w-app flex-1 space-y-4 px-4 py-5 pb-40">
        {step === "theory" && (
          <>
            <TheoryBlock icon={<Triangle className="h-6 w-6 text-white/90" />} title="Квадратне рівняння">
              <p>
                <strong className="font-600 text-text-primary">Квадратне рівняння</strong> — це рівняння
                виду <span className="font-mono font-600 text-primary">ax² + bx + c = 0</span>, де{" "}
                <span className="font-mono font-600 text-primary">a ≠ 0</span>.
              </p>
              <p>
                Щоб знайти корені, використовуємо{" "}
                <strong className="font-600 text-primary">дискримінант</strong> — спеціальне число,
                яке показує скільки розв'язків має рівняння.
              </p>
              <Formula>D = b² − 4ac</Formula>
              <div className="space-y-1.5 rounded-lg bg-surface-alt p-3">
                <p className="font-body text-sm">
                  <span className="font-600 text-correct-dark">D &gt; 0</span> — два різних корені
                </p>
                <p className="font-body text-sm">
                  <span className="font-600 text-reward-dark">D = 0</span> — один корінь (кратний)
                </p>
                <p className="font-body text-sm">
                  <span className="font-600 text-wrong-dark">D &lt; 0</span> — немає дійсних коренів
                </p>
              </div>
            </TheoryBlock>
          </>
        )}

        {step === "algorithm" && (
          <AlgorithmBlock steps={ALGORITHM_STEPS} />
        )}

        {isQuestion && currentQ && (
          <>
            <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
              <p className="font-display text-xs font-600 uppercase tracking-widest text-text-secondary">
                Запитання {(step as { type: "question"; idx: number }).idx + 1} / {QUESTIONS.length}
              </p>
              <h2 className="mt-2 font-display text-lg font-700 text-text-primary">
                {currentQ.text}
              </h2>
            </div>

            <div className="space-y-2.5">
              {currentQ.answers.map((answer, i) => {
                let state: "default" | "selected" | "correct" | "wrong" = "default";
                if (isChecked) {
                  if (i === currentQ.correct) state = "correct";
                  else if (i === checked)     state = "wrong";
                } else if (i === selected) {
                  state = "selected";
                }
                return (
                  <AnswerOption
                    key={i}
                    index={i}
                    content={answer}
                    state={state}
                    disabled={isChecked}
                    onClick={() => !isChecked && setSelected(i)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="mx-auto max-w-app">
          {isQuestion && isChecked ? (
            <FeedbackPanel
              type={isCorrect ? "correct" : "wrong"}
              explanation={currentQ!.explanation}
              xpGained={isCorrect ? 10 : 0}
              onContinue={handleNext}
            />
          ) : (
            <div className="border-t border-border bg-canvas/95 px-4 pb-6 pt-3 backdrop-blur-sm">
              {isQuestion ? (
                <Button
                  size="lg"
                  className="w-full"
                  disabled={selected === null}
                  onClick={handleCheck}
                >
                  Перевірити
                </Button>
              ) : (
                <Button size="lg" className="w-full" onClick={handleNext}>
                  Далі →
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
