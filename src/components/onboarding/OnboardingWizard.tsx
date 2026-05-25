"use client";

import { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  User,
  BookOpen,
  Hash,
  Triangle,
  Target,
  Zap,
  Flame,
  Trophy,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import { coursesApi, type CourseListItem } from "@/lib/api/courses";
import { usersApi } from "@/lib/api/users";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type Step = "welcome" | "nickname" | "course" | "goal" | "done";
type DailyGoal = 5 | 10 | 15 | 20;

const GOALS: {
  value: DailyGoal;
  label: string;
  sublabel: string;
  desc: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
}[] = [
  {
    value: 5,
    label: "5",
    sublabel: "хвилин",
    desc: "Легкий старт",
    icon: <Target className="h-5 w-5" />,
    iconColor: "text-correct",
    bgColor: "bg-correct-light",
  },
  {
    value: 10,
    label: "10",
    sublabel: "хвилин",
    desc: "Стабільний темп",
    icon: <Zap className="h-5 w-5" />,
    iconColor: "text-primary",
    bgColor: "bg-primary-light",
  },
  {
    value: 15,
    label: "15",
    sublabel: "хвилин",
    desc: "Активна підготовка",
    icon: <Flame className="h-5 w-5" />,
    iconColor: "text-reward-dark",
    bgColor: "bg-reward-light",
  },
  {
    value: 20,
    label: "20",
    sublabel: "хвилин",
    desc: "Інтенсивний режим",
    icon: <Trophy className="h-5 w-5" />,
    iconColor: "text-wrong-dark",
    bgColor: "bg-wrong-light",
  },
];

function getSubjectIcon(subject: string) {
  const s = subject.toLowerCase();
  if (s.includes("алгебр") || s.includes("математ")) return <Hash className="h-6 w-6" />;
  if (s.includes("геометр")) return <Triangle className="h-6 w-6" />;
  return <BookOpen className="h-6 w-6" />;
}

function computeSteps(hasNickname: boolean): Step[] {
  const steps: Step[] = ["welcome"];
  if (!hasNickname) steps.push("nickname");
  steps.push("course", "goal");
  return steps;
}

export function OnboardingWizard() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<DailyGoal | null>(null);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const steps = computeSteps(!!user?.nickname);
  const [step, setStep] = useState<Step>("welcome");
  const stepKey = useRef(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (user.is_onboarded) {
      router.replace("/home");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    coursesApi
      .list()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  }, []);

  const transition = (next: Step) => {
    stepKey.current += 1;
    setAnimKey(stepKey.current);
    setStep(next);
  };

  const nextStep = () => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) {
      transition(steps[idx + 1]);
    }
  };

  const handleNicknameNext = () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setNicknameError("Мінімум 2 символи");
      return;
    }
    if (trimmed.length > 50) {
      setNicknameError("Максимум 50 символів");
      return;
    }
    setNicknameError("");
    nextStep();
  };

  const handleFinish = async () => {
    if (!selectedCourseId || !selectedGoal) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const needsNickname = !user?.nickname;
      const updatedUser = await usersApi.completeOnboarding({
        ...(needsNickname ? { nickname: nickname.trim() } : {}),
        course_id: selectedCourseId,
        daily_goal_minutes: selectedGoal,
      });
      setUser(updatedUser);
      transition("done");
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(Object.values(err.data).flat().join(" "));
      } else {
        setSubmitError("Щось пішло не так. Спробуй ще раз.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const progressSteps = steps;
  const stepIdx = progressSteps.indexOf(step);
  const showProgress = step !== "done";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress bar */}
      {showProgress && (
        <div className="px-4 pt-10">
          <div className="mx-auto max-w-app">
            <div className="flex items-center gap-1.5">
              {progressSteps.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-500",
                    i <= stepIdx ? "bg-primary" : "bg-border",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      <div
        key={animKey}
        className="step-in mx-auto flex w-full max-w-app flex-1 flex-col px-4 pb-10 pt-8"
      >
        {step === "welcome" && (
          <WelcomeStep
            displayName={user.nickname ?? user.email.split("@")[0]}
            onNext={nextStep}
          />
        )}
        {step === "nickname" && (
          <NicknameStep
            value={nickname}
            onChange={(v) => { setNickname(v); setNicknameError(""); }}
            error={nicknameError}
            onNext={handleNicknameNext}
          />
        )}
        {step === "course" && (
          <CourseStep
            courses={courses}
            loading={coursesLoading}
            selected={selectedCourseId}
            onSelect={setSelectedCourseId}
            onNext={nextStep}
          />
        )}
        {step === "goal" && (
          <GoalStep
            selected={selectedGoal}
            onSelect={setSelectedGoal}
            onFinish={handleFinish}
            submitting={submitting}
            error={submitError}
          />
        )}
        {step === "done" && (
          <DoneStep onStart={() => router.replace("/home")} />
        )}
      </div>
    </div>
  );
}

// ─── Step components ────────────────────────────────────────────────

function StepHero({
  icon,
  bgClass = "bg-primary-light",
  iconClass = "text-primary",
}: {
  icon: React.ReactNode;
  bgClass?: string;
  iconClass?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex h-24 w-24 items-center justify-center rounded-3xl shadow-card",
        bgClass,
        iconClass,
      )}
    >
      {icon}
    </div>
  );
}

function WelcomeStep({
  displayName,
  onNext,
}: {
  displayName: string;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHero icon={<GraduationCap className="h-12 w-12" />} />

      <h1 className="font-display text-xl font-800 text-text-primary">
        Привіт, {displayName}!
      </h1>
      <p className="mt-2 font-body text-base text-text-secondary">
        Налаштуємо твоє навчання — обереш курс і встановиш щоденну ціль.
        Це займе менше хвилини.
      </p>

      <ul className="mt-6 space-y-3">
        {[
          "Обери предмет для підготовки",
          "Встанови зручний темп занять",
          "Починай навчатись одразу",
        ].map((item) => (
          <li key={item} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-correct-light">
              <Check className="h-3.5 w-3.5 text-correct-dark" />
            </span>
            <span className="font-body text-sm text-text-primary">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-10">
        <Button onClick={onNext} className="w-full" size="lg">
          Почати налаштування
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function NicknameStep({
  value,
  onChange,
  error,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHero icon={<User className="h-12 w-12" />} />

      <h1 className="font-display text-xl font-800 text-text-primary">Як тебе звати?</h1>
      <p className="mt-2 font-body text-base text-text-secondary">
        Це ім&apos;я будуть бачити інші учасники у рейтингу.
      </p>

      <div className="mt-6">
        <Input
          label="Нікнейм"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onNext()}
          placeholder="наприклад: Олексій123"
          autoFocus
          autoComplete="nickname"
          error={error}
        />
      </div>

      <div className="mt-auto pt-10">
        <Button onClick={onNext} className="w-full" size="lg" disabled={!value.trim()}>
          Далі
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function CourseStep({
  courses,
  loading,
  selected,
  onSelect,
  onNext,
}: {
  courses: CourseListItem[];
  loading: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHero icon={<BookOpen className="h-12 w-12" />} />

      <h1 className="font-display text-xl font-800 text-text-primary">Що готуєш?</h1>
      <p className="mt-2 font-body text-base text-text-secondary">
        Обери курс для підготовки до НМТ. Пізніше зможеш додати ще.
      </p>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-alt" />
          ))
        ) : (
          courses.map((course) => {
            const isSelected = selected === course.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onSelect(course.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150 active:scale-[0.99]",
                  isSelected
                    ? "border-primary bg-primary-light shadow-card"
                    : "border-border bg-surface hover:border-primary-mid hover:bg-surface-alt",
                )}
              >
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isSelected ? "bg-primary text-white" : "bg-primary-light text-primary",
                  )}
                >
                  {getSubjectIcon(course.subject)}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-display text-base font-700 transition-colors",
                      isSelected ? "text-primary-dark" : "text-text-primary",
                    )}
                  >
                    {course.title}
                  </p>
                  <p className="mt-0.5 truncate font-body text-sm text-text-secondary">
                    {course.description}
                  </p>
                </div>
                {isSelected && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-auto pt-10">
        <Button onClick={onNext} className="w-full" size="lg" disabled={!selected}>
          Далі
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function GoalStep({
  selected,
  onSelect,
  onFinish,
  submitting,
  error,
}: {
  selected: DailyGoal | null;
  onSelect: (g: DailyGoal) => void;
  onFinish: () => void;
  submitting: boolean;
  error: string;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <StepHero icon={<Target className="h-12 w-12" />} />

      <h1 className="font-display text-xl font-800 text-text-primary">Щоденна ціль</h1>
      <p className="mt-2 font-body text-base text-text-secondary">
        Скільки часу готовий приділяти навчанню щодня? Маленькі кроки — великий результат.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {GOALS.map((goal) => {
          const isSelected = selected === goal.value;
          return (
            <button
              key={goal.value}
              type="button"
              onClick={() => onSelect(goal.value)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-150 active:scale-[0.97]",
                isSelected
                  ? "border-primary bg-primary-light shadow-card"
                  : "border-border bg-surface hover:border-primary-mid hover:bg-surface-alt",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  isSelected ? "bg-primary text-white" : `${goal.bgColor} ${goal.iconColor}`,
                )}
              >
                {goal.icon}
              </span>
              <div>
                <p
                  className={cn(
                    "font-display text-lg font-800 leading-none transition-colors",
                    isSelected ? "text-primary-dark" : "text-text-primary",
                  )}
                >
                  {goal.label}{" "}
                  <span className="font-display text-sm font-600">{goal.sublabel}</span>
                </p>
                <p className="mt-1 font-body text-xs text-text-secondary">{goal.desc}</p>
              </div>
              {isSelected && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-wrong-light px-4 py-3 font-body text-sm text-wrong-dark">
          {error}
        </p>
      )}

      <div className="mt-auto pt-10">
        <Button
          onClick={onFinish}
          className="w-full"
          size="lg"
          disabled={!selected}
          loading={submitting}
        >
          Завершити налаштування
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function DoneStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="mb-8 flex h-28 w-28 animate-bounce items-center justify-center rounded-3xl bg-reward-light text-reward-dark shadow-card">
        <Sparkles className="h-14 w-14" />
      </div>

      <h1 className="font-display text-2xl font-800 text-text-primary">Все готово!</h1>
      <p className="mt-3 max-w-xs font-body text-base text-text-secondary">
        Твій план налаштовано. Час зробити перший крок до вступу до університету мрії.
      </p>

      <div className="mt-10 w-full">
        <Button onClick={onStart} className="w-full" size="lg">
          Починаємо навчання
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
