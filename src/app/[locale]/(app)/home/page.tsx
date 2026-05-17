"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Flame, Hash, HeartCrack, Triangle, X } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { CourseCard } from "@/components/ui/CourseCard";
import { withToken } from "@/lib/dev";

const MOCK_USER = {
  username: "Юрій",
  level: 7,
  xp: 1250,
  gems: 83,
  lives: 3,
  streak_days: 14,
  last_activity_date: "2026-05-15",
  hearts_refill_at: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
};

const MOCK_COURSES = [
  {
    id: "math-nmt",
    icon: <Hash className="h-8 w-8 text-primary" />,
    title: "Математика НМТ",
    subject: "Алгебра та геометрія",
    description:
      "Повна підготовка до НМТ з математики. Від базових рівнянь до складних задач.",
    difficulty: "intermediate" as const,
    isEnrolled: true,
    progress: 40,
    completedLessons: 6,
    totalLessons: 15,
  },
  {
    id: "geometry",
    icon: <Triangle className="h-8 w-8 text-primary" />,
    title: "Геометрія",
    subject: "Планіметрія і стереометрія",
    description:
      "Трикутники, кола, об'єми тіл обертання та багато іншого для поглибленого вивчення.",
    difficulty: "beginner" as const,
    isEnrolled: false,
    progress: 0,
    completedLessons: 0,
    totalLessons: 20,
  },
];

type StreakStatus = "broken" | "at-risk" | null;

export default function HomePage() {
  const router = useRouter();
  const activeCourse = MOCK_COURSES.find((c) => c.isEnrolled && c.progress > 0 && c.progress < 100);

  const [streakStatus, setStreakStatus] = useState<StreakStatus>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const lastActivity = new Date(MOCK_USER.last_activity_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActivity.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - lastActivity.getTime()) / 86_400_000);
    if (diffDays > 1) setStreakStatus("broken");
    else if (diffDays === 1) setStreakStatus("at-risk");
  }, []);

  const showBanner = !bannerDismissed && streakStatus !== null;

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={MOCK_USER} />

      {showBanner && (
        <div
          className={
            streakStatus === "broken"
              ? "border-b border-wrong/20 bg-wrong-light px-4 py-3"
              : "border-b border-reward/20 bg-reward-light px-4 py-3"
          }
        >
          <div className="mx-auto flex max-w-app items-center gap-3">
            <span className="shrink-0">
              {streakStatus === "broken"
                ? <HeartCrack className="h-6 w-6 text-wrong-dark" />
                : <AlertTriangle className="h-6 w-6 text-reward-dark" />
              }
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={
                  "font-display text-sm font-700 " +
                  (streakStatus === "broken" ? "text-wrong-dark" : "text-reward-dark")
                }
              >
                {streakStatus === "broken"
                  ? "Серія перервана"
                  : "Не пропустіть серію!"}
              </p>
              <p
                className={
                  "font-body text-xs " +
                  (streakStatus === "broken" ? "text-wrong-dark/80" : "text-reward-dark/80")
                }
              >
                {streakStatus === "broken"
                  ? `Ваша серія з ${MOCK_USER.streak_days} днів скинута. Починайте нову!`
                  : "Пройдіть урок сьогодні, щоб зберегти серію"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className={
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors " +
                (streakStatus === "broken"
                  ? "text-wrong hover:bg-wrong/10"
                  : "text-reward-dark hover:bg-reward/20")
              }
              aria-label="Закрити"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-app space-y-6 px-4 py-6">
        <div>
          <h1 className="font-display text-xl font-800 text-text-primary">
            Привіт, {MOCK_USER.username}!
          </h1>
          <p className="mt-1 inline-flex items-center gap-1.5 font-body text-base text-text-secondary">
            {MOCK_USER.streak_days} днів поспіль — так тримати!
            <Flame className="h-4 w-4 text-reward" />
          </p>
        </div>

        {activeCourse && (
          <button
            type="button"
            onClick={() => router.push(withToken(`/courses/${activeCourse.id}`))}
            className="w-full overflow-hidden rounded-xl bg-primary p-4 text-left text-white shadow-button transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                {activeCourse.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs font-600 opacity-80">Продовжити навчання</p>
                <h3 className="truncate font-display text-base font-700">{activeCourse.title}</h3>
              </div>
              <span className="text-xl opacity-80">→</span>
            </div>
            <div className="mt-3">
              <div className="mb-1.5 flex justify-between">
                <span className="font-display text-xs font-600 opacity-80">
                  {activeCourse.completedLessons} / {activeCourse.totalLessons} уроків
                </span>
                <span className="font-display text-xs font-700">{activeCourse.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
                  style={{ width: `${activeCourse.progress}%` }}
                />
              </div>
            </div>
          </button>
        )}

        <div>
          <h2 className="mb-4 font-display text-lg font-700 text-text-primary">Курси</h2>
          <div className="space-y-4">
            {MOCK_COURSES.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                onClick={() => router.push(withToken(`/courses/${course.id}`))}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
