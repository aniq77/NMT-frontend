"use client";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { AlertTriangle, BookOpen, Flame, Hash, HeartCrack, ShoppingBag, Swords, Target, Triangle, Users, X } from "lucide-react";
import { useRouter } from "@/lib/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { StatChip } from "@/components/ui/StatChip";
import { CourseCard } from "@/components/ui/CourseCard";
import { useAuthStore } from "@/store/auth.store";
import { coursesApi, type CourseListItem } from "@/lib/api/courses";
import { questsApi } from "@/lib/api/quests";

function getSubjectIcon(subject: string): React.ReactNode {
  const s = subject.toLowerCase();
  if (s.includes("алгебр") || s.includes("математ")) return <Hash className="h-8 w-8 text-white" />;
  if (s.includes("геометр")) return <Triangle className="h-8 w-8 text-white" />;
  return <BookOpen className="h-8 w-8 text-white" />;
}

type StreakStatus = "broken" | "at-risk" | null;

/* ── Dark ("magical night") theme assets — used only when theme === dark ── */
const FlameGlyph = () => (
  <svg viewBox="0 0 18 18" fill="none" width="17" height="17">
    <path d="M9 1.5 C9 1.5 4.5 5 4.5 9.8 C4.5 13.2 6.6 15.5 9 15.5 C11.4 15.5 13.5 13.2 13.5 9.8 C13.5 8 12.5 6.5 12.5 6.5 C12.5 8 11 8.8 11 7 C11 4.5 9 1.5 9 1.5Z" fill="#ff7a3c" />
    <path d="M9 6.5 C9 6.5 6.8 8.5 6.8 11 C6.8 12.8 7.8 14 9 14 C10.2 14 11.2 12.8 11.2 11 C11.2 9.5 10 8.8 10 8.8 C10 9.8 9 10 9 8.8 C9 7.5 9 6.5 9 6.5Z" fill="#ffc93c" />
  </svg>
);

const QUICK_LINKS = [
  {
    href: "/quests", cls: "qa-tasks", label: "Завдання",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#5ff0db" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.4" fill="#5ff0db" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/shop", cls: "qa-shop", label: "Крамниця",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#ffd27a" strokeWidth={2} strokeLinejoin="round">
        <path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/friends", cls: "qa-friends", label: "Друзі",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#9b8cff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-4.6 5.5-4.6s5.5 1.6 5.5 4.6" />
        <path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 14.6c2.3.5 3.5 2 3.5 4.4" />
      </svg>
    ),
  },
  {
    href: "/pvp", cls: "qa-duels", label: "Дуелі",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#ff8a52" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 3.5 21 3l-.5 6.5-9 9" /><path d="M3 16l5 5" />
        <path d="M9.5 3.5 3 3l.5 6.5 9 9" /><path d="M21 16l-5 5" />
      </svg>
    ),
  },
] as const;

type StyleKey = "math" | "ukr" | "hist" | "bio" | "phys";

const SUBJECTS: { key: StyleKey; title: string; desc: string; active: boolean }[] = [
  { key: "math", title: "Математика", desc: "Підготовка до НМТ з математики — серед сузір’їв формул та геометрії зір.", active: true },
  { key: "ukr", title: "Українська мова", desc: "Правопис, граматика та стилістика — все для впевненої грамотності.", active: false },
  { key: "hist", title: "Історія України", desc: "Від Київської Русі до сьогодення — події, дати та особистості.", active: false },
  { key: "bio", title: "Біологія", desc: "Клітини, організми та екосистеми — як влаштоване життя навколо.", active: false },
  { key: "phys", title: "Фізика", desc: "Сили, енергія та закони природи — зрозуміло і без зайвого.", active: false },
];

const EMBLEMS: Record<StyleKey, React.ReactNode> = {
  math: (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M10 15 L20 15 M12.5 15 L12 26 M17.5 15 L17.5 24 C17.5 26 19 26 20 25" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="14" r="1.7" fill="#fff" /><line x1="27" y1="19" x2="39" y2="19" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx="33" cy="24" r="1.7" fill="#fff" /><line x1="14" y1="31" x2="14" y2="39" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
      <line x1="10" y1="35" x2="18" y2="35" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" /><line x1="29" y1="31" x2="37" y2="39" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
      <line x1="37" y1="31" x2="29" y2="39" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  ),
  ukr: (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="8" y="10" width="16" height="30" rx="2" fill="rgba(255,255,255,.5)" /><rect x="24" y="10" width="16" height="30" rx="2" fill="rgba(255,255,255,.65)" />
      <rect x="22" y="9" width="4" height="32" rx="2" fill="rgba(255,255,255,.35)" />
      <line x1="27" y1="17" x2="36" y2="17" stroke="rgba(255,255,255,.6)" strokeWidth={1.5} strokeLinecap="round" /><line x1="27" y1="21" x2="36" y2="21" stroke="rgba(255,255,255,.6)" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="27" y1="25" x2="33" y2="25" stroke="rgba(255,255,255,.6)" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  ),
  hist: (
    <svg viewBox="0 0 48 48" fill="none">
      <rect x="6" y="38" width="36" height="4" rx="2" fill="rgba(255,255,255,.7)" /><rect x="6" y="10" width="36" height="4" rx="2" fill="rgba(255,255,255,.7)" />
      <rect x="8" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" /><rect x="17" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" />
      <rect x="26" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" /><rect x="35" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" />
    </svg>
  ),
  bio: (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M24 8 C10 8 8 24 14 34 C18 40 24 42 24 42 C24 42 30 40 34 34 C40 24 38 8 24 8Z" fill="rgba(255,255,255,.6)" />
      <path d="M24 8 C24 8 26 20 22 34" stroke="rgba(255,255,255,.35)" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  ),
  phys: (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M28 6 L14 26 L22 26 L18 44 L36 20 L27 20 Z" fill="rgba(255,255,255,.75)" stroke="rgba(255,255,255,.3)" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  ),
};

const SCENES: Record<StyleKey, React.ReactNode> = {
  math: (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <g fill="#fff" opacity=".85"><circle cx="40" cy="30" r="1.6" /><circle cx="120" cy="20" r="2" /><circle cx="300" cy="34" r="1.6" /><circle cx="360" cy="60" r="2" /><circle cx="200" cy="18" r="1.4" /></g>
      <circle cx="350" cy="40" r="22" fill="#e8f0ff" opacity=".5" />
      <g stroke="#9fd2ff" strokeWidth={1} opacity=".6" fill="none"><path d="M60 70 L120 60 L90 120 Z" /></g>
      <circle cx="60" cy="70" r="2.5" fill="#ffe08a" /><circle cx="120" cy="60" r="2.5" fill="#ffe08a" /><circle cx="90" cy="120" r="2.5" fill="#ffe08a" />
      <text x="330" y="150" fill="#cfe4ff" opacity=".5" fontFamily="Playfair Display" fontSize="34">π</text>
      <text x="250" y="190" fill="#cfe4ff" opacity=".4" fontFamily="Playfair Display" fontSize="26">∑</text>
    </svg>
  ),
  ukr: (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <circle cx="320" cy="60" r="40" fill="#ffd27a" opacity=".25" />
      <rect x="40" y="120" width="14" height="60" fill="#c97b4a" opacity=".5" /><rect x="58" y="116" width="12" height="64" fill="#9b8cff" opacity=".5" /><rect x="74" y="122" width="14" height="58" fill="#54e0a0" opacity=".5" />
      <circle cx="200" cy="70" r="6" fill="#ffe7a8" opacity=".8" />
    </svg>
  ),
  hist: (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <circle cx="330" cy="50" r="34" fill="#ffd27a" opacity=".3" />
      <g fill="#e9c06a" opacity=".5"><rect x="40" y="120" width="16" height="60" /><rect x="70" y="112" width="16" height="68" /><rect x="100" y="118" width="16" height="62" /></g>
      <path d="M30 110 L130 104 L80 80 Z" fill="#e9c06a" opacity=".5" />
    </svg>
  ),
  bio: (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <circle cx="80" cy="90" r="50" fill="#54e0a0" opacity=".35" /><circle cx="320" cy="100" r="44" fill="#54e0a0" opacity=".3" />
      <circle cx="80" cy="80" r="4" fill="#9cf0cf" /><circle cx="320" cy="92" r="3" fill="#9cf0cf" />
      <path d="M0 180 Q200 150 400 180 L400 220 L0 220Z" fill="#5cdcef" opacity=".3" />
    </svg>
  ),
  phys: (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <ellipse cx="90" cy="120" rx="50" ry="16" fill="#5cc4dd" opacity=".4" /><ellipse cx="320" cy="80" rx="40" ry="13" fill="#5cc4dd" opacity=".35" />
      <circle cx="200" cy="90" r="20" fill="#7fe0ec" opacity=".4" /><path d="M150 70 l14 0 l-8 18 l18 0 l-24 36 l5 -26 l-13 0z" fill="#ffe08a" opacity=".6" />
    </svg>
  ),
};

export default function HomePage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { user, fetchMe } = useAuthStore();

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [questsDone, setQuestsDone] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes is client-only; read the theme after mount to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    fetchMe().catch(() => {});
    coursesApi.list().then(setCourses).catch(() => {});
    // Badge = daily quests finished but not yet claimed.
    questsApi.list()
      .then((list) => setQuestsDone(list.filter((q) => q.status === "completed").length))
      .catch(() => {});
  }, [fetchMe]);

  const mathProgress = useMemo(() => {
    const math = courses.find(
      (c) => c.slug === "mathematics" || c.subject?.toLowerCase().includes("матем") || c.title?.toLowerCase().includes("матем"),
    );
    return math?.user_progress?.progress_percent ?? 0;
  }, [courses]);

  const activeCourse = courses.find(
    (c) =>
      c.user_progress !== null &&
      (c.user_progress.progress_percent ?? 0) > 0 &&
      (c.user_progress.progress_percent ?? 0) < 100,
  );

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
  const isDark = mounted && resolvedTheme === "dark";

  /* ═══════════════ DARK — magical-night mockup ═══════════════ */
  if (isDark) {
    return (
      <div className="relative min-h-screen text-text-primary">
        {user ? (
          <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
            <div className="flex items-center justify-between px-[clamp(16px,4vw,40px)] py-3">
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 48 48" fill="none" className="h-[38px] w-[38px] drop-shadow-[0_0_10px_rgba(51,214,194,0.6)]">
                  <path d="M24 3l5 6 8-1-1 8 6 5-6 5 1 8-8-1-5 6-5-6-8 1 1-8-6-5 6-5-1-8 8 1 5-6z" fill="#33d6c2" stroke="#0f7a70" strokeWidth="1.4" />
                  <path d="M16 26l5 5 11-13" stroke="#06221f" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden font-display text-xl font-800 tracking-[0.5px] text-primary-dark [text-shadow:0_0_16px_rgba(51,214,194,0.5)] sm:inline">
                  Cresco&nbsp;test
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <StatChip type="streak" value={user.streak_days} size="sm" />
                <StatChip type="lives"  value={user.lives}       size="sm" />
                <StatChip type="gems"   value={user.gems}        size="sm" />
                <StatChip type="xp"     value={user.exp}         size="sm" />
              </div>
            </div>
          </header>
        ) : null}

        <main className="mx-auto max-w-[820px] px-4 pb-32 pt-6 md:px-6">
          <h1 className="hello">Привіт, {user?.nickname ?? user?.email ?? "друже"}!</h1>
          <p className="streakline">
            {user?.streak_days ?? 0} днів поспіль — так тримати! <FlameGlyph />
          </p>

          {showBanner ? (
            <div className="home-banner">
              <div className="ic">
                <svg viewBox="0 0 32 32" fill="none" width="24" height="24">
                  <path d="M16 3 C16 3 8 9 8 17.5 C8 23.5 11.6 27.5 16 27.5 C20.4 27.5 24 23.5 24 17.5 C24 14 22 11 22 11 C22 14 19 15.5 19 12 C19 7 16 3 16 3Z" fill="#fff" />
                  <path d="M16 12 C16 12 12 15.5 12 20 C12 23 13.8 25 16 25 C18.2 25 20 23 20 20 C20 17.5 18 16 18 16 C18 18 16 18.5 16 16 C16 14 16 12 16 12Z" fill="#ffd98a" />
                </svg>
              </div>
              <div className="tx">
                <b>{streakStatus === "broken" ? "Серію втрачено" : "Продовжуй серію сьогодні!"}</b>
                <span>
                  {streakStatus === "broken"
                    ? `Твоя серія з ${user?.streak_days ?? 0} днів скинулась — почни нову`
                    : "Один урок — і твоя серія живе далі"}
                </span>
              </div>
              <button type="button" className="x" onClick={() => setBannerDismissed(true)} aria-label="Закрити">✕</button>
            </div>
          ) : null}

          <div className="quick-actions">
            {QUICK_LINKS.map(({ href, cls, label, icon }) => {
              const badge = href === "/quests" && questsDone > 0 ? String(questsDone) : null;
              return (
                <button key={href} type="button" className={`qa ${cls}`} onClick={() => router.push(href)}>
                  {badge ? <span className="qa-badge">{badge}</span> : null}
                  <span className="qa-ic">{icon}</span>
                  <span className="qa-name">{label}</span>
                </button>
              );
            })}
          </div>

          <h2 className="sec-title">
            Курси <small>{SUBJECTS.length} регіонів світу</small>
          </h2>
          <p className="sec-sub">
            Кожен предмет — окрема магічна земля. Обирай регіон і вирушай у подорож до НМТ.
          </p>

          <div className="courses">
            {SUBJECTS.map((s) => {
              const progress = s.active ? mathProgress : 0;
              const inner = (
                <>
                  <div className="scene">{SCENES[s.key]}</div>
                  <div className="emblem">{EMBLEMS[s.key]}</div>
                  <div>
                    <h3>
                      {s.title}
                      {!s.active ? <span className="lvl-badge">Скоро</span> : null}
                    </h3>
                    <p className="desc">{s.desc}</p>
                    <div className="prog">
                      <div className="row"><span>Прогрес</span><span>{progress}%</span></div>
                      <div className="track"><div className="fill" style={{ width: `${Math.max(progress, 6)}%` }} /></div>
                    </div>
                    <span className="go">
                      {s.active ? (progress > 0 ? "Продовжити" : "Розпочати") : "Скоро"} <span>→</span>
                    </span>
                  </div>
                </>
              );

              return s.active ? (
                <button key={s.key} type="button" className={`course c-${s.key}`} onClick={() => router.push("/courses/mathematics")}>
                  {inner}
                </button>
              ) : (
                <div key={s.key} className={`course c-${s.key}`} style={{ cursor: "default" }} aria-disabled>
                  {inner}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  /* ═══════════════ LIGHT — original design (unchanged) ═══════════════ */
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
          <h1 className="text-glow font-display text-2xl font-800 text-primary-dark">
            Привіт, {user.nickname ?? user.email}! <span className="animate-wave">👋</span>
          </h1>
          <p className="mt-1 inline-flex items-center gap-1.5 font-body text-base text-text-secondary">
            {user.streak_days} днів поспіль — так тримати!
            <Flame className="h-4 w-4 text-reward" />
          </p>
        </div>

        <div className="stagger grid grid-cols-4 gap-2">
          {[
            { href: "/quests", Icon: Target, label: "Завдання" },
            { href: "/shop", Icon: ShoppingBag, label: "Крамниця" },
            { href: "/friends", Icon: Users, label: "Друзі" },
            { href: "/pvp", Icon: Swords, label: "Дуелі" },
          ].map(({ href, Icon, label }) => (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              className="glass lift flex flex-col items-center gap-1.5 rounded-2xl py-3 active:scale-[0.97]"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="font-display text-xs font-700 text-text-primary">{label}</span>
            </button>
          ))}
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
          <h2 className="mb-4 font-display text-xl font-800 text-primary-dark">Курси</h2>
          {courses.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface px-4 py-8 text-center">
              <p className="font-body text-sm text-text-secondary">Завантаження курсів...</p>
            </div>
          ) : (
            <div className="stagger space-y-4">
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
