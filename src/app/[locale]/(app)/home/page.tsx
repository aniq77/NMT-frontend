"use client";
import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, BookOpen, Flame, Hash, HeartCrack, Triangle, X } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { CourseCard } from "@/components/ui/CourseCard";
import { useAuthStore } from "@/store/auth.store";
import { coursesApi, type CourseListItem } from "@/lib/api/courses";

function getSubjectIcon(subject: string): React.ReactNode {
  const s = subject.toLowerCase();
  if (s.includes("алгебр") || s.includes("математ")) return <Hash className="h-8 w-8 text-primary" />;
  if (s.includes("геометр")) return <Triangle className="h-8 w-8 text-primary" />;
  return <BookOpen className="h-8 w-8 text-primary" />;
}

type StreakStatus = "broken" | "at-risk" | null;

export default function HomePage() {
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    fetchMe().catch(() => {});
    coursesApi.list().then(setCourses).catch(() => {});
  }, [fetchMe]);

  const streakStatus = useMemo<StreakStatus>(() => {
    if (!user || !user.last_activity_date) return null;
    const lastActivity = new Date(user.last_activity_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActivity.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - lastActivity.getTime()) / 86_400_000);
    if (diffDays > 1) return "broken";
    if (diffDays === 1) return "at-risk";
    return null;
  }, [user]);

  const activeCourse = courses.find(
    (c) =>
      c.user_progress !== null &&
      (c.user_progress.progress_percent ?? 0) > 0 &&
      (c.user_progress.progress_percent ?? 0) < 100,
  );

  const showBanner = !bannerDismissed && streakStatus !== null;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader user={user} />

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
              {streakStatus === "broken" ? (
                <HeartCrack className="h-6 w-6 text-wrong-dark" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-reward-dark" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={
                  "font-display text-sm font-700 " +
                  (streakStatus === "broken" ? "text-wrong-dark" : "text-reward-dark")
                }
              >
                {streakStatus === "broken" ? "Серія перервана" : "Не пропустіть серію!"}
              </p>
              <p
                className={
                  "font-body text-xs " +
                  (streakStatus === "broken" ? "text-wrong-dark/80" : "text-reward-dark/80")
                }
              >
                {streakStatus === "broken"
                  ? `Ваша серія з ${user.streak_days} днів скинута. Починайте нову!`
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
            Привіт, {user.nickname ?? user.email}!
          </h1>
          <p className="mt-1 inline-flex items-center gap-1.5 font-body text-base text-text-secondary">
            {user.streak_days} днів поспіль — так тримати!
            <Flame className="h-4 w-4 text-reward" />
          </p>
        </div>

        {activeCourse && (
          <button
            type="button"
            onClick={() => router.push(`/courses/${activeCourse.slug}`)}
            className="w-full overflow-hidden rounded-xl bg-primary p-4 text-left text-white shadow-button transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                {getSubjectIcon(activeCourse.subject)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs font-600 opacity-80">Продовжити навчання</p>
                <h3 className="truncate font-display text-base font-700">{activeCourse.title}</h3>
              </div>
              <span className="text-xl opacity-80">→</span>
            </div>
            <div className="mt-3">
              <div className="mb-1.5 flex justify-between">
                <span className="font-display text-xs font-600 opacity-80">Прогрес</span>
                <span className="font-display text-xs font-700">
                  {activeCourse.user_progress?.progress_percent ?? 0}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
                  style={{ width: `${activeCourse.user_progress?.progress_percent ?? 0}%` }}
                />
              </div>
            </div>
          </button>
        )}

        <div>
          <h2 className="mb-4 font-display text-lg font-700 text-text-primary">Курси</h2>
          {courses.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center">
              <p className="font-body text-sm text-text-secondary">Завантаження курсів...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => {
                const progress = course.user_progress?.progress_percent ?? 0;
                return (
                  <CourseCard
                    key={course.id}
                    id={course.slug}
                    icon={getSubjectIcon(course.subject)}
                    title={course.title}
                    subject={course.subject}
                    description={course.description}
                    difficulty="intermediate"
                    isEnrolled={course.user_progress !== null}
                    progress={progress}
                    onClick={() => router.push(`/courses/${course.slug}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
