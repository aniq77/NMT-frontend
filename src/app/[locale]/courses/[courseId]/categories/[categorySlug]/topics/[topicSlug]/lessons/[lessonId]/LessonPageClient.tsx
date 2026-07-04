"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/lib/navigation";
import { GameScreen } from "@/components/layout/GameScreen";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
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
import { useAuthStore } from "@/store/auth.store";
import {
  BossBattleStage,
  BOSS_MAX_HP,
  COMBO_FOR_CRIT,
  HERO_MAX_HP,
  type BattleTurn,
} from "./BossBattleStage";

const MAX_LIVES = 5;

type ShuffledOption = QuestionOption & { originalIndex: number };

function shuffleOptions(options: QuestionOption[]): ShuffledOption[] {
  return [...options]
    .map((o, i) => ({ ...o, originalIndex: i }))
    .sort(() => Math.random() - 0.5);
}

type Phase = "loading" | "energy_gate" | "locked" | "load_error" | "quiz" | "completing" | "done";

function HeartIcon() {
  return (
    <svg viewBox="0 0 22 22" fill="none" width="22" height="22">
      <path
        d="M11 18.5 C11 18.5 3 13 3 7.5 C3 4.8 5 3 7.5 3 C9.2 3 10.3 4 11 5.2 C11.7 4 12.8 3 14.5 3 C17 3 19 4.8 19 7.5 C19 13 11 18.5 11 18.5Z"
        fill="#e35d72"
      />
      <path d="M7 6.5 C7 5.5 8 4.8 9.2 5.5" stroke="#f5a0b0" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Full-screen themed state / result card on the night background. */
function StateScreen({
  fail = false,
  icon,
  title,
  sub,
  children,
}: {
  fail?: boolean;
  icon: ReactNode;
  title: string;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <GameScreen dock={false}>
      <div className="result-overlay show">
        <div className={`result-card${fail ? " fail" : ""}`}>
          {icon && <div className="result-icon">{icon}</div>}
          <div className="result-title">{title}</div>
          {sub && <div className="result-sub">{sub}</div>}
          {children}
        </div>
      </div>
    </GameScreen>
  );
}

const SuccessIcon = (
  <svg viewBox="0 0 88 88" fill="none" width="88" height="88">
    <circle cx="44" cy="44" r="40" fill="none" stroke="#f3c25a" strokeWidth="3" strokeDasharray="6 4" opacity=".5" />
    <circle cx="44" cy="44" r="30" fill="none" stroke="#f3c25a" strokeWidth="2" opacity=".3" />
    <path d="M44 14 L48 28 L62 28 L51 36 L55 50 L44 42 L33 50 L37 36 L26 28 L40 28Z" fill="#f3c25a" stroke="#c9952a" strokeWidth="1" />
  </svg>
);

const FailIcon = (
  <svg viewBox="0 0 88 88" fill="none" width="88" height="88">
    <path d="M44 72 C44 72 14 52 14 30 C14 18 22 12 32 12 C38 12 42 16 44 20 C46 16 50 12 56 12 C66 12 74 18 74 30 C74 52 44 72 44 72Z" fill="none" stroke="#e35d72" strokeWidth="2.5" />
    <line x1="34" y1="30" x2="54" y2="50" stroke="#e35d72" strokeWidth="3" strokeLinecap="round" />
    <line x1="54" y1="30" x2="34" y2="50" stroke="#e35d72" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const XpBolt = (
  <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
    <path d="M11 2L3 12h5l-1 6 8-10h-5z" fill="#c9952a" />
  </svg>
);

export default function LessonPageClient() {
  const params = useParams<{
    courseId: string;
    categorySlug: string;
    topicSlug: string;
    lessonId: string;
  }>();
  const { courseId, categorySlug, lessonId } = params;
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
  const [heartsDepleted, setHeartsDepleted] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [completeResult, setCompleteResult] = useState<CompleteLessonResult | null>(null);
  const [completionSaved, setCompletionSaved] = useState(false);
  const [loadError, setLoadError] = useState<string>("");

  // ── Boss battle (only active when the lesson is a boss) ───────────────────────
  const [isBoss, setIsBoss] = useState(false);
  const [bossName, setBossName] = useState("Бос");
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [heroHp, setHeroHp] = useState(HERO_MAX_HP);
  const [battleCombo, setBattleCombo] = useState(0);
  const [battleTurn, setBattleTurn] = useState<BattleTurn | null>(null);
  const [battleOutcome, setBattleOutcome] = useState<"win" | "lose" | null>(null);

  const completeCalledRef = useRef(false);
  const topicPath = `/courses/${courseId}/categories/${categorySlug}`;

  const loadLesson = useCallback(() => {
    setPhase("loading");
    setLoadError("");
    // Hearts are a per-attempt resource: every entry (including a retry) starts
    // fresh at 5, independent of any global/persistent lives count.
    setLives(MAX_LIVES);
    setHeartsDepleted(false);
    Promise.all([lessonsApi.start(lessonId), lessonsApi.questions(lessonId)])
      .then(([startRes, qs]) => {
        if (!qs || qs.length === 0) {
          // Start succeeded but the bank returned no questions — never show an
          // empty, unplayable quiz. Surface it so the user can retry / go back.
          setLoadError("Завдання для цього уроку не завантажились. Спробуйте ще раз.");
          setPhase("load_error");
          return;
        }
        setIsBoss(startRes.is_boss);
        if (startRes.is_boss) {
          setBossName(startRes.title || "Бос");
          setBossHp(BOSS_MAX_HP);
          setHeroHp(HERO_MAX_HP);
          setBattleCombo(0);
          setBattleTurn(null);
          setBattleOutcome(null);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        if (isBoss) {
          // Hero hits the boss. Crit on every COMBO_FOR_CRIT-th correct in a
          // row (+1 dmg), then the combo resets.
          const nextCombo = battleCombo + 1;
          const crit = nextCombo >= COMBO_FOR_CRIT;
          const damage = 1 + (crit ? 1 : 0);
          setBossHp((p) => Math.max(0, p - damage));
          setBattleCombo(crit ? 0 : nextCombo);
          setBattleTurn((t) => ({ key: (t?.key ?? 0) + 1, attacker: "hero", crit }));
        }
      } else {
        if (isBoss) {
          // Boss hits the hero. Battle HP is separate from global lives.
          setHeroHp((p) => Math.max(0, p - 1));
          setBattleCombo(0);
          setBattleTurn((t) => ({ key: (t?.key ?? 0) + 1, attacker: "boss", crit: false }));
        } else {
          setLives((p) => Math.max(0, p - 1));
        }
      }
    } catch {
      // Network/validation error — leave the question unanswered so the user can retry.
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (isBoss) {
      if (bossHp <= 0) {
        setBattleOutcome("win");
        finishLesson();
        return;
      }
      if (heroHp <= 0) {
        setBattleOutcome("lose");
        finishLesson();
        return;
      }
    } else if (lives === 0) {
      // Out of hearts → the attempt is over. Record it (a failed pass earns
      // nothing) and show the defeat screen; retrying re-enters and costs
      // energy, never a global life.
      setHeartsDepleted(true);
      finishLesson();
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
        updateUser({ level: res.level, gems: res.gems });
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

  // Boss defeat → fight again from scratch. loadLesson re-charges energy and
  // resets the battle (bossHp/heroHp/combo), so just clear the quiz run here.
  function restartBattle() {
    completeCalledRef.current = false;
    setCurrentIdx(0);
    setSelectedId(null);
    setCheckedId(null);
    setResult(null);
    setAnswers([]);
    setCorrectCount(0);
    setXpEarned(0);
    setCompleteResult(null);
    setCompletionSaved(false);
    setBattleOutcome(null);
    loadLesson();
  }

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (phase === "loading" || phase === "completing") {
    return (
      <GameScreen dock={false}>
        <div className="result-overlay show">
          <div className="result-card">
            <div className="result-title">Завантаження…</div>
          </div>
        </div>
      </GameScreen>
    );
  }

  // ── Energy gate ───────────────────────────────────────────────────────────────
  if (phase === "energy_gate") {
    return (
      <StateScreen
        fail
        icon={<span style={{ fontSize: 64 }}>⚡</span>}
        title="Немає енергії!"
        sub={
          <>
            Зачекайте відновлення енергії або поверніться пізніше
            {user ? ` · Енергія: ${user.energy}` : ""}
          </>
        }
      >
        <button className="result-link" onClick={() => router.push(topicPath)}>
          ← Назад до острова
        </button>
      </StateScreen>
    );
  }

  // ── Locked ────────────────────────────────────────────────────────────────────
  if (phase === "locked") {
    return (
      <StateScreen
        icon={<span style={{ fontSize: 64 }}>🔒</span>}
        title="Урок ще закритий"
        sub="Спочатку пройди попередню тему хоча б один раз, щоб відкрити цей урок."
      >
        <button className="result-btn" onClick={() => router.push(topicPath)}>
          ← Назад до острова
        </button>
      </StateScreen>
    );
  }

  // ── Load error ────────────────────────────────────────────────────────────────
  if (phase === "load_error") {
    return (
      <StateScreen
        fail
        icon={FailIcon}
        title="Не вдалося завантажити урок"
        sub={loadError}
      >
        <button className="result-btn" onClick={loadLesson}>
          Спробувати ще раз
        </button>
        <br />
        <button className="result-link" onClick={() => router.push(topicPath)}>
          ← Назад до острова
        </button>
      </StateScreen>
    );
  }

  // ── Completion ────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;

    // Hearts ran out mid-lesson → the attempt failed. No life is lost; retrying
    // re-enters the lesson (and spends energy) with a fresh set of 5 hearts.
    if (heartsDepleted && !isBoss) {
      return (
        <StateScreen
          fail
          icon={FailIcon}
          title="Серця закінчились!"
          sub="Урок не зараховано. Спробуй ще раз — серця відновляться, але захід витратить енергію."
        >
          <button className="result-btn" onClick={restartBattle}>
            Спробувати ще раз
          </button>
          <br />
          <button className="result-link" onClick={() => router.push(topicPath)}>
            ← Назад до острова
          </button>
        </StateScreen>
      );
    }

    if (!completionSaved) {
      return (
        <StateScreen
          fail
          icon={FailIcon}
          title="Не вдалося зберегти"
          sub="Прогрес не збережено через проблему з мережею. Спробуйте ще раз."
        >
          <button className="result-btn" onClick={retryFinishLesson}>
            Спробувати ще раз
          </button>
          <br />
          <button className="result-link" onClick={() => router.push(topicPath)}>
            Вийти без збереження
          </button>
        </StateScreen>
      );
    }

    if (isBoss) {
      const outcome: "win" | "lose" =
        battleOutcome ?? (completeResult?.status === "completed" ? "win" : "lose");

      if (outcome === "lose") {
        return (
          <StateScreen
            fail
            icon={FailIcon}
            title="Тебе переможено"
            sub={`${bossName} виявився сильнішим. Збери сили й спробуй ще раз.`}
          >
            <button className="result-btn gold" onClick={restartBattle}>
              ⚔️ Битися знову
            </button>
            <br />
            <button className="result-link" onClick={() => router.push(topicPath)}>
              ← Назад до острова
            </button>
          </StateScreen>
        );
      }

      return (
        <StateScreen
          icon={SuccessIcon}
          title="Боса переможено!"
          sub={`${bossName} повалено ⚔️`}
        >
          <div className="result-xp" style={{ background: "rgba(243,194,90,.16)", color: "#f3c25a" }}>
            {XpBolt} +{completeResult?.exp ?? xpEarned} XP
            {(completeResult?.gems ?? 0) > 0 ? ` · 💎 ${completeResult?.gems}` : ""}
          </div>
          <br />
          {completeResult?.is_gold && (
            <div className="result-sub" style={{ color: "#f3c25a" }}>
              ★ Боса пройдено — острів засяяв золотом!
            </div>
          )}
          <button className="result-btn" onClick={() => router.push(topicPath)}>
            Продовжити
          </button>
          <br />
          <button className="result-link" onClick={() => router.push("/home")}>
            На головну
          </button>
        </StateScreen>
      );
    }

    return (
      <StateScreen
        icon={SuccessIcon}
        title="Урок завершено!"
        sub={
          <>
            Правильних відповідей: {correctCount} / {questions.length} ({score}%)
          </>
        }
      >
        <div className="result-xp" style={{ background: "rgba(243,194,90,.16)", color: "#f3c25a" }}>
          {XpBolt} +{completeResult?.exp ?? xpEarned} XP
        </div>
        <br />
        {completeResult?.exp_boost_active && (
          <div className="result-sub" style={{ color: "#f3c25a" }}>⚡ Множник XP активний!</div>
        )}
        <button className="result-btn" onClick={() => router.push(topicPath)}>
          Продовжити
        </button>
        <br />
        <button className="result-link" onClick={() => router.push("/home")}>
          На головну
        </button>
      </StateScreen>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────────
  const hasQuizProgress =
    answers.length > 0 || currentIdx > 0 || checkedId !== null || selectedId !== null;
  const requestQuit = () => {
    if (hasQuizProgress) setShowQuitConfirm(true);
    else router.push(topicPath);
  };

  const qn = isBoss
    ? `⚔️ Раунд ${currentIdx + 1}`
    : `Запитання ${currentIdx + 1} / ${questions.length}`;

  return (
    <GameScreen dock={false}>
      <section className="view active">
        <div className="quiz-bar">
          <button className="qx" onClick={requestQuit} aria-label="Вийти">
            ✕
          </button>
          <div className="qtrack">
            <div className="qf" style={{ width: `${progress}%` }} />
          </div>
          {!isBoss && (
            <div className="hearts">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} className={`h${i >= lives ? " lost" : ""}`}>
                  <HeartIcon />
                </span>
              ))}
            </div>
          )}
        </div>

        {isBoss && currentQ && (
          <BossBattleStage
            bossName={bossName}
            bossHp={bossHp}
            heroHp={heroHp}
            combo={battleCombo}
            turn={battleTurn}
          />
        )}

        {currentQ && (
          <>
            <div className="glass qcard">
              <div className="qn">{qn}</div>
              <div className="qtext">
                <MathText text={currentQ.text} />
              </div>
            </div>

            <div className="opts">
              {shuffledOptions.map((option, i) => {
                let stateCls = "";
                if (isChecked) {
                  if (result?.correct_option_ids.includes(option.id)) stateCls = " correct";
                  else if (option.id === checkedId) stateCls = " wrong";
                } else if (option.id === selectedId) {
                  stateCls = " sel";
                }
                return (
                  <button
                    key={option.id}
                    className={`opt${stateCls}${isChecked ? " disabled" : ""}`}
                    disabled={isChecked}
                    onClick={() => !isChecked && setSelectedId(option.id)}
                  >
                    <span className="key">{String.fromCharCode(65 + i)}</span>
                    <span className="val">
                      <MathText text={option.text} />
                    </span>
                  </button>
                );
              })}
            </div>

            {isChecked && (
              <div className={`feedback show ${isCorrect ? "good" : "bad"}`}>
                {isCorrect ? "✓ Правильно!" : "✗ Не зовсім."}
                {result?.explanation ? ` ${result.explanation}` : ""}
              </div>
            )}

            {isChecked ? (
              <button className="check ok" onClick={handleContinue}>
                Далі →
              </button>
            ) : (
              <button
                className="check"
                disabled={selectedId === null || submitting}
                onClick={handleCheck}
              >
                {submitting ? "Перевіряємо…" : "Перевірити"}
              </button>
            )}
          </>
        )}
      </section>

      <Modal
        open={showQuitConfirm}
        onClose={() => setShowQuitConfirm(false)}
        title="Вийти з уроку?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="font-body text-sm text-text-secondary">
            Якщо вийти зараз, весь прогрес цього уроку буде втрачено, а витрачену енергію не
            повернуть.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowQuitConfirm(false)}>
              Залишитись
            </Button>
            <Button
              className="flex-1 !bg-none bg-wrong text-white"
              onClick={() => router.push(topicPath)}
            >
              Вийти
            </Button>
          </div>
        </div>
      </Modal>
    </GameScreen>
  );
}
