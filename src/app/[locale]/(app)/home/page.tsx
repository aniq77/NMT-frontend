"use client";
import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, BookOpen, Flame, Hash, HeartCrack, ShoppingBag, Sparkles, Swords, Target, Triangle, Users, X } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { DarkSectionTitle as SectionTitle } from "@/components/theme/DarkThemeShell";
import { useAuthStore } from "@/store/auth.store";
import { coursesApi, type CourseListItem } from "@/lib/api/courses";

function getSubjectIcon(subject: string): React.ReactNode {
  const s = subject.toLowerCase();
  if (s.includes("алгебр") || s.includes("математ")) return <Hash className="h-8 w-8 text-white" />;
  if (s.includes("геометр")) return <Triangle className="h-8 w-8 text-white" />;
  return <BookOpen className="h-8 w-8 text-white" />;
}

type StreakStatus = "broken" | "at-risk" | null;

const QUICK_LINKS = [
  { href: "/quests", Icon: Target, label: "Завдання" },
  { href: "/shop", Icon: ShoppingBag, label: "Крамниця" },
  { href: "/friends", Icon: Users, label: "Друзі" },
  { href: "/pvp", Icon: Swords, label: "Дуелі" },
] as const;

// Vibrant subject cards — the same rich gradients read well on both the light
// "sky" and dark "night" backgrounds, so a single palette drives both themes.
function getCoursePalette(subject: string) {
  const s = subject.toLowerCase();

  if (s.includes("алгеб") || s.includes("матем")) {
    return {
      card: "from-[#11244a] to-[#1d3f72]",
      emblem: "from-[#5b7fd6] to-[#2c4a96]",
      progress: "from-[#7fb0ff] to-[#ffe08a]",
      button: "from-[#5b7fd6] to-[#3956a8]",
      eyebrow: "Небесний острів",
    };
  }

  if (s.includes("геометр")) {
    return {
      card: "from-[#102b3f] to-[#193f55]",
      emblem: "from-[#5cc4dd] to-[#2f7fbd]",
      progress: "from-[#3aa6c4] to-[#7fe0ec]",
      button: "from-[#1f8fa6] to-[#3aa6c4]",
      eyebrow: "Кристальний берег",
    };
  }

  return {
    card: "from-[#2c2030] to-[#4a2f3a]",
    emblem: "from-[#e0a05a] to-[#c97b4a]",
    progress: "from-[#ffb15c] to-[#ffe08a]",
    button: "from-[#c97b4a] to-[#e0a05a]",
    eyebrow: "Вечірня цитадель",
  };
}

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

  const showBanner = !bannerDismissed && streakStatus !== null;

  return (
    <div className="relative min-h-screen text-text-primary">
      {user ? <AppHeader user={user} /> : null}
      <main className="mx-auto max-w-[820px] px-4 pb-32 pt-6 md:px-6">
        <section>
          <h1 className="text-glow font-display text-[42px] font-800 leading-none text-text-primary md:text-[58px]">
            Привіт, {user?.nickname ?? user?.email ?? "друже"}! <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="mt-3 flex items-center gap-2 font-body text-base font-700 text-text-secondary">
            {user?.streak_days ?? 0} днів поспіль. Темп чудовий.
            <Flame className="h-4 w-4 text-reward" />
          </p>
        </section>

        {showBanner ? (
          <div className="glass mt-6 overflow-hidden rounded-[26px] border-reward/40 p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[#3a2400] shadow-[0_0_18px_-2px_rgba(255,177,92,0.7)]" style={{ backgroundImage: "var(--grad-reward)" }}>
                {streakStatus === "broken" ? <HeartCrack className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-800 text-text-primary">
                  {streakStatus === "broken" ? "Серію втрачено" : "Не дай серії згаснути"}
                </p>
                <p className="mt-1 font-body text-sm font-700 text-text-secondary">
                  {streakStatus === "broken"
                    ? `Твоя серія з ${user?.streak_days ?? 0} днів скинулась. Повернись у подорож сьогодні.`
                    : "Пройди урок сьогодні, щоб зберегти інерцію і забрати нагороду за ритм."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-text-secondary"
                aria-label="Закрити"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        <section className="mt-8">
          <SectionTitle title="Швидкі дії" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {QUICK_LINKS.map(({ href, Icon, label }) => (
              <button
                key={href}
                type="button"
                onClick={() => router.push(href)}
                className="glass lift rounded-[22px] px-4 py-4 text-left"
              >
                <Icon className="h-6 w-6 text-primary" />
                <p className="mt-4 font-display text-sm font-800 text-text-primary">{label}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionTitle title="Твоя мапа" caption={`${courses.length} курсів`} />
          <div className="space-y-5">
            {courses.map((course) => {
              const progress = course.user_progress?.progress_percent ?? 0;
              const palette = getCoursePalette(course.subject);

              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => router.push(`/courses/${course.slug}`)}
                  className={`group relative w-full overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br ${palette.card} p-6 text-left shadow-[0_24px_60px_-22px_rgba(0,0,0,0.55)] transition hover:-translate-y-1`}
                >
                  <div className="grid gap-5 md:grid-cols-[88px_1fr]">
                    <div className={`grid h-[88px] w-[88px] place-items-center rounded-[24px] bg-gradient-to-br ${palette.emblem} text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.18)]`}>
                      {getSubjectIcon(course.subject)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-[26px] font-800 leading-none text-white">{course.title}</h3>
                        <span className="rounded-full bg-white/15 px-3 py-1 font-body text-[11px] font-700 uppercase tracking-[0.2em] text-white/90">
                          {palette.eyebrow}
                        </span>
                      </div>
                      <p className="mt-2 font-body text-sm font-700 text-white/75">{course.subject}</p>
                      <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-white/85">{course.description}</p>
                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between font-body text-xs font-700 text-white/80">
                          <span>Прогрес острова</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-black/25">
                          <div className={`h-full rounded-full bg-gradient-to-r ${palette.progress}`} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className={`mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${palette.button} px-5 py-3 font-body text-sm font-700 text-white shadow-[0_12px_26px_-12px_rgba(0,0,0,0.7)]`}>
                        <Sparkles className="h-4 w-4" />
                        Відкрити маршрут
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {courses.length === 0 ? (
              <div className="glass rounded-[26px] px-4 py-8 text-center">
                <p className="font-body text-sm text-text-secondary">Завантаження курсів...</p>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
