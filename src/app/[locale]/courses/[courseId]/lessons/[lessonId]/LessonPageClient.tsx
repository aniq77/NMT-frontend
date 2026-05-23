"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  BarChart2,
  Box,
  Gem,
  Heart,
  HeartCrack,
  PartyPopper,
  Star,
  Trophy,
  Triangle,
  Zap,
} from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { withToken } from "@/lib/dev";
import { LessonHeader } from "@/components/layout/LessonHeader";
import { TheoryBlock, Formula } from "@/components/ui/TheoryBlock";
import { AlgorithmBlock } from "@/components/ui/AlgorithmBlock";
import { AnswerOption } from "@/components/ui/AnswerOption";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { GraphChallenge } from "@/components/ui/GraphChallenge";
import { SphereViewerStep } from "@/components/ui/SphereViewerStep";
import { ConeViewerStep } from "@/components/ui/ConeViewerStep";
import { Button } from "@/components/ui/Button";
import { LESSON_CONFIGS } from "@/lib/mockLessons";
import { lessonsApi } from "@/lib/api/lessons";
import type { CompleteLessonResult } from "@/lib/api/lessons";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";

const MAX_LIVES        = 5;
const GEMS_PER_REFILL  = 10;
const GATE_REFILL_MINS = 20;

type Step =
  | "theory"
  | "viewer3d"
  | "algorithm"
  | "graph"
  | { type: "question"; idx: number }
  | "complete";

function getTotalSteps(hasSphere: boolean, hasGraph: boolean, qCount: number) {
  return 2 + (hasSphere ? 1 : 0) + (hasGraph ? 1 : 0) + qCount;
}

function getProgress(step: Step, has3d: boolean, hasGraph: boolean, qCount: number): number {
  if (step === "complete") return 100;
  const total = getTotalSteps(has3d, hasGraph, qCount);

  let idx = 0;
  if (step === "theory")          idx = 0;
  else if (step === "viewer3d")   idx = 1;
  else if (step === "algorithm")  idx = has3d ? 2 : 1;
  else if (step === "graph")      idx = (has3d ? 2 : 1) + 1;
  else if (typeof step === "object") {
    idx = (has3d ? 2 : 1) + (hasGraph ? 1 : 0) + 1 + step.idx;
  }

  return Math.round((idx / total) * 100);
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

export default function LessonPageClient() {
  const params   = useParams<{ courseId: string; lessonId: string }>();
  const router   = useRouter();
  const courseId = params.courseId;
  const lessonId = params.lessonId;

  const { user, updateUser, fetchMe } = useAuthStore();

  const config   = LESSON_CONFIGS[lessonId];
  const has3d    = Boolean(config?.viewer3d);
  const hasGraph = Boolean(config?.graphChallenge);
  const questions = config?.questions ?? [];
  const gc        = config?.graphChallenge;

  const [isStarting,     setIsStarting]     = useState(true);
  const [showEnergyGate, setShowEnergyGate] = useState(false);
  const [step,           setStep]           = useState<Step>("theory");
  const [selected,       setSelected]       = useState<number | null>(null);
  const [checked,        setChecked]        = useState<number | null>(null);
  const [xpEarned,       setXpEarned]       = useState(0);
  const [lives,          setLives]          = useState(user?.lives ?? MAX_LIVES);
  const [showLivesGate,  setShowLivesGate]  = useState(false);
  const [showLevelUp,    setShowLevelUp]    = useState(false);
  const [graphC,         setGraphC]         = useState(gc?.initialC ?? 0);
  const [graphChecked,   setGraphChecked]   = useState(false);
  const [graphCorrect,   setGraphCorrect]   = useState(false);
  const [, setComboStreak]                  = useState(0);
  const [maxCombo,       setMaxCombo]       = useState(0);
  const [completeResult, setCompleteResult] = useState<CompleteLessonResult | null>(null);

  const [gateTarget]    = useState(() => Date.now() + GATE_REFILL_MINS * 60_000);
  const completeCalledRef = useRef(false);
  const { mins: gateMins, secs: gateSecs } = useGateCountdown(showLivesGate, gateTarget);

  const isQuestion = typeof step === "object" && step.type === "question";
  const currentQ   = isQuestion ? questions[(step as { type: "question"; idx: number }).idx] : null;
  const isChecked  = checked !== null;
  const isCorrect  = isChecked && currentQ !== null && checked === currentQ.correct;

  // ── Start lesson ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const backendId = config?.backendId ?? lessonId;
    lessonsApi.start(backendId)
      .then(() => setIsStarting(false))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 400) {
          setShowEnergyGate(true);
        }
        setIsStarting(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // ── Complete lesson ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "complete" || completeCalledRef.current) return;
    completeCalledRef.current = true;

    // Persist to localStorage for course-map progress
    try {
      const stored = localStorage.getItem("completedLessons");
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(lessonId)) {
        localStorage.setItem("completedLessons", JSON.stringify([...list, lessonId]));
      }
    } catch {}

    const totalXp = questions.reduce((s, q) => s + q.xp, 0) + (gc?.xp ?? 0);
    const score   = totalXp > 0 ? Math.round((xpEarned / totalXp) * 100) : 100;
    const backendId = config?.backendId ?? lessonId;

    lessonsApi.complete(backendId, { score, passed: true, max_combo: maxCombo })
      .then((result) => {
        setCompleteResult(result);
        updateUser({ level: result.level, lives: result.lives, gems: result.gems });
        if (result.level > (user?.level ?? 0)) {
          setShowLevelUp(true);
        }
        fetchMe().catch(() => {});
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function advanceStep() {
    if (step === "theory")    { setStep(has3d ? "viewer3d" : "algorithm"); return; }
    if (step === "viewer3d")  { setStep("algorithm"); return; }
    if (step === "algorithm") { setStep(hasGraph ? "graph" : { type: "question", idx: 0 }); return; }
    if (step === "graph")     { setStep({ type: "question", idx: 0 }); return; }
    if (isQuestion) {
      const idx = (step as { type: "question"; idx: number }).idx;
      if (idx + 1 < questions.length) {
        setStep({ type: "question", idx: idx + 1 });
      } else {
        setStep("complete");
      }
    }
  }

  function handleNext() {
    const lastWrong = (isChecked && !isCorrect) || (graphChecked && !graphCorrect);
    if (lives === 0 && lastWrong) { setShowLivesGate(true); return; }
    setSelected(null);
    setChecked(null);
    setGraphChecked(false);
    setGraphCorrect(false);
    advanceStep();
  }

  function handleCheck() {
    if (selected === null || !currentQ) return;
    setChecked(selected);
    if (selected === currentQ.correct) {
      setXpEarned((p) => p + currentQ.xp);
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

  function handleGraphCheck() {
    if (!gc) return;
    let correct = false;
    if (gc.targetCondition === "two-roots") correct = graphC < -0.06;
    if (gc.targetCondition === "one-root")  correct = Math.abs(graphC) <= 0.06;
    if (gc.targetCondition === "no-roots")  correct = graphC > 0.06;
    setGraphChecked(true);
    setGraphCorrect(correct);
    if (correct) {
      setXpEarned((p) => p + gc.xp);
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

  const progress = getProgress(step, has3d, hasGraph, questions.length);
  const displayXp = completeResult?.exp ?? xpEarned;
  const displayLevel = completeResult?.level ?? (user?.level ?? 0);

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isStarting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  // ── Unknown lesson ────────────────────────────────────────────────────────────
  if (!config) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <p className="font-display text-lg font-700 text-text-primary">Урок не знайдено</p>
        <Button variant="ghost" size="lg" className="mt-6" onClick={() => router.push(withToken(`/courses/${courseId}`))}>
          ← До курсу
        </Button>
      </div>
    );
  }

  // ── Energy gate ───────────────────────────────────────────────────────────────
  if (showEnergyGate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <div className="mb-4 flex justify-center">
            <Zap className="h-20 w-20 text-reward" />
          </div>
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
          <div className="mt-8 space-y-3">
            <Button variant="ghost" size="lg" className="w-full" onClick={() => router.push(withToken(`/courses/${courseId}`))}>
              ← До курсу
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
            <Button size="lg" className="w-full bg-reward text-reward-dark hover:bg-reward-dark hover:text-white"
              onClick={() => { setLives(1); setShowLivesGate(false); }}>
              <span className="flex items-center justify-center gap-2">
                <Gem className="h-5 w-5" /> Витратити {GEMS_PER_REFILL} кристалів
              </span>
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={() => router.push(withToken("/home"))}>
              На головну
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Level-up ──────────────────────────────────────────────────────────────────
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
            <span className="font-display text-4xl font-800 text-white">{displayLevel}</span>
          </div>
          <p className="mt-4 font-body text-sm text-white/70">
            Рівень {displayLevel} розблоковано — продовжуй у тому ж дусі!
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-white/15 px-6 py-2">
            <Zap className="h-5 w-5 text-white" />
            <span className="font-display text-lg font-700 text-white">+{displayXp} XP</span>
          </div>
          <Button size="lg" className="mt-10 w-full border-2 border-white/20 bg-white text-primary hover:bg-white/90"
            onClick={() => setShowLevelUp(false)}>
            <span className="flex items-center justify-center gap-2">
              Отримати нагороду <Star className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    );
  }

  // ── Completion ────────────────────────────────────────────────────────────────
  if (step === "complete") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="mx-auto w-full max-w-app text-center">
          <div className="mb-6 flex justify-center">
            <PartyPopper className="h-20 w-20 text-primary" />
          </div>
          <h1 className="font-display text-xl font-800 text-text-primary">Урок завершено!</h1>
          <p className="mt-2 font-body text-base text-text-secondary">Чудова робота! Ти молодець!</p>

          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-reward-light px-6 py-3">
            <Zap className="h-5 w-5 text-reward-dark" />
            {completeResult ? (
              <span className="font-display text-lg font-700 text-reward-dark">+{completeResult.exp} XP</span>
            ) : (
              <span className="font-display text-lg font-700 text-reward-dark">+{xpEarned} XP</span>
            )}
          </div>

          {completeResult?.exp_boost_active && (
            <p className="mt-2 font-display text-xs font-600 text-reward">⚡ Множник XP активний!</p>
          )}

          {completeResult?.unlocked_achievements && completeResult.unlocked_achievements.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="font-display text-xs font-600 uppercase tracking-widest text-text-secondary">
                Нові досягнення
              </p>
              {completeResult.unlocked_achievements.map((a) => (
                <div key={a.code} className="flex items-center gap-3 rounded-xl border border-reward/30 bg-reward-light px-4 py-2.5">
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
            <Button size="lg" className="w-full" onClick={() => router.push(withToken(`/courses/${courseId}`))}>
              Продовжити
            </Button>
            <Button variant="ghost" size="md" className="w-full" onClick={() => router.push(withToken("/home"))}>
              На головну
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Bottom bar helper ─────────────────────────────────────────────────────────
  function renderBottomBar() {
    if (isQuestion && isChecked) {
      return (
        <FeedbackPanel
          type={isCorrect ? "correct" : "wrong"}
          explanation={currentQ!.explanation}
          xpGained={isCorrect ? currentQ!.xp : 0}
          onContinue={handleNext}
        />
      );
    }
    if (step === "graph" && graphChecked) {
      return (
        <FeedbackPanel
          type={graphCorrect ? "correct" : "wrong"}
          explanation={graphCorrect ? gc!.correctExplanation : gc!.wrongExplanation}
          xpGained={graphCorrect ? gc!.xp : 0}
          onContinue={handleNext}
        />
      );
    }
    return (
      <div className="border-t border-border bg-canvas/95 px-4 pb-6 pt-3 backdrop-blur-sm">
        {isQuestion ? (
          <Button size="lg" className="w-full" disabled={selected === null} onClick={handleCheck}>
            Перевірити
          </Button>
        ) : step === "graph" ? (
          <Button size="lg" className="w-full" onClick={handleGraphCheck}>
            Перевірити
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={handleNext}>
            Далі →
          </Button>
        )}
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <LessonHeader
        progress={progress}
        onClose={() => router.push(withToken(`/courses/${courseId}`))}
        xpEarned={xpEarned}
        lives={lives}
      />

      <div className="mx-auto w-full max-w-app flex-1 space-y-4 px-4 py-5 pb-40">

        {/* ── Theory ── */}
        {step === "theory" && lessonId === "lesson-3" && (
          <TheoryBlock icon={<Triangle className="h-6 w-6 text-white/90" />} title="Квадратне рівняння">
            <p>
              <strong className="font-600 text-text-primary">Квадратне рівняння</strong> — рівняння виду{" "}
              <span className="font-mono font-600 text-primary">ax² + bx + c = 0</span>, де{" "}
              <span className="font-mono font-600 text-primary">a ≠ 0</span>.
            </p>
            <p>
              Щоб знайти корені, використовуємо{" "}
              <strong className="font-600 text-primary">дискримінант</strong> — число, яке показує
              скільки розв&apos;язків має рівняння.
            </p>
            <Formula>D = b² − 4ac</Formula>
            <div className="space-y-1.5 rounded-lg bg-surface-alt p-3">
              <p className="font-body text-sm"><span className="font-600 text-correct-dark">D &gt; 0</span> — два різних корені</p>
              <p className="font-body text-sm"><span className="font-600 text-reward-dark">D = 0</span> — один корінь (кратний)</p>
              <p className="font-body text-sm"><span className="font-600 text-wrong-dark">D &lt; 0</span> — немає дійсних коренів</p>
            </div>
          </TheoryBlock>
        )}

        {step === "theory" && lessonId === "lesson-4" && (
          <TheoryBlock icon={<BarChart2 className="h-6 w-6 text-white/90" />} title="Дискримінант і парабола">
            <p>
              <strong className="font-600 text-text-primary">Дискримінант</strong>{" "}
              <span className="font-mono font-600 text-primary">D = b² − 4ac</span> визначає кількість
              коренів квадратного рівняння та описує поведінку параболи{" "}
              <span className="font-mono font-600 text-primary">y = ax² + bx + c</span>.
            </p>
            <Formula>D = b² − 4ac</Formula>
            <p>Геометрично: скільки разів парабола перетинає вісь X?</p>
            <div className="space-y-2 rounded-lg bg-surface-alt p-3">
              <p className="font-body text-sm"><span className="font-600 text-correct-dark">D &gt; 0</span> — перетинає у <strong>двох</strong> точках → два корені</p>
              <p className="font-body text-sm"><span className="font-600 text-reward-dark">D = 0</span> — <strong>торкається</strong> осі X → один корінь</p>
              <p className="font-body text-sm"><span className="font-600 text-wrong-dark">D &lt; 0</span> — <strong>не перетинає</strong> → коренів немає</p>
            </div>
          </TheoryBlock>
        )}

        {step === "theory" && lessonId === "lesson-sphere" && (
          <TheoryBlock icon={<Box className="h-6 w-6 text-white/90" />} title="Куля та її властивості">
            <p>
              <strong className="font-600 text-text-primary">Куля</strong> — тіло, утворене обертанням
              кола навколо свого діаметра. Усі точки поверхні рівновіддалені від{" "}
              <strong className="font-600 text-primary">центра O</strong> на відстань{" "}
              <span className="font-mono font-600 text-primary">R</span> (радіус).
            </p>
            <div className="space-y-2 rounded-lg bg-surface-alt p-3">
              <p className="font-body text-sm"><span className="font-600 text-primary">R</span> — радіус кулі</p>
              <p className="font-body text-sm"><span className="font-600 text-primary">D = 2R</span> — діаметр</p>
              <p className="font-body text-sm"><span className="font-600 text-primary">Переріз через центр</span> — велике коло з радіусом R</p>
            </div>
            <Formula>V = ⁴⁄₃ · π · R³</Formula>
            <Formula>S = 4 · π · R²</Formula>
            <p className="font-body text-sm text-text-secondary">
              На наступному кроці — інтерактивна 3D-модель. Оберни кулю, щоб побачити її з усіх боків.
            </p>
          </TheoryBlock>
        )}

        {step === "theory" && lessonId === "lesson-cone" && (
          <TheoryBlock icon={<Triangle className="h-6 w-6 text-white/90" />} title="Конус та його елементи">
            <p>
              <strong className="font-600 text-text-primary">Конус</strong> — тіло обертання, утворене
              обертанням прямокутного трикутника навколо одного з катетів.
            </p>
            <div className="space-y-2 rounded-lg bg-surface-alt p-3">
              <p className="font-body text-sm">
                <span className="font-600 text-primary">R</span> — радіус кола в основі
              </p>
              <p className="font-body text-sm">
                <span className="font-600 text-primary">H</span> — висота (від вершини до центра основи)
              </p>
              <p className="font-body text-sm">
                <span className="font-600 text-primary">L</span> — твірна (бічне ребро), пряма від вершини до краю основи
              </p>
            </div>
            <Formula>L = √(R² + H²)</Formula>
            <p>
              <strong className="font-600 text-primary">Вісьовий переріз</strong> (через вісь конуса) — рівнобедрений трикутник
              з основою 2R і бічними сторонами L.
            </p>
            <p className="font-body text-sm text-text-secondary">
              Далі — 3D-модель конуса, де ти побачиш H, R і L одночасно.
            </p>
          </TheoryBlock>
        )}

        {/* ── 3D viewer (sphere or cone) ── */}
        {step === "viewer3d" && config.viewer3d === "sphere" && <SphereViewerStep />}
        {step === "viewer3d" && config.viewer3d === "cone"   && <ConeViewerStep />}

        {/* ── Algorithm ── */}
        {step === "algorithm" && <AlgorithmBlock steps={config.algorithmSteps} />}

        {/* ── Graph challenge ── */}
        {step === "graph" && gc && (
          <GraphChallenge
            prompt={gc.prompt}
            subprompt={gc.subprompt}
            checked={graphChecked}
            isCorrect={graphCorrect}
            c={graphC}
            onCChange={setGraphC}
          />
        )}

        {/* ── Question ── */}
        {isQuestion && currentQ && (
          <>
            <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
              <p className="font-display text-xs font-600 uppercase tracking-widest text-text-secondary">
                Запитання {(step as { type: "question"; idx: number }).idx + 1} / {questions.length}
              </p>
              <h2 className="mt-2 font-display text-lg font-700 text-text-primary">{currentQ.text}</h2>
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
        <div className="mx-auto max-w-app">{renderBottomBar()}</div>
      </div>
    </div>
  );
}
