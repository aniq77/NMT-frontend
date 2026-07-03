"use client";
import { useState, useEffect, useMemo } from "react";
import { Link } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import { coursesApi, type CourseListItem } from "@/lib/api/courses";
import { subjectVisual } from "@/components/journey/courseVisuals";

type StreakStatus = "broken" | "at-risk" | null;

const QUICK_ACTIONS = [
  { href: "/journey#tasks", name: "Завдання", cls: "qa-tasks", badge: "2", icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--teal-bright)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="var(--teal-bright)" stroke="none" /></svg> },
  { href: "/journey#shop", name: "Крамниця", cls: "qa-shop", icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinejoin="round"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" /></svg> },
  { href: "/journey#friends", name: "Друзі", cls: "qa-friends", icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-4.6 5.5-4.6s5.5 1.6 5.5 4.6" /><path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 14.6c2.3.5 3.5 2 3.5 4.4" /></svg> },
  { href: "/journey#duels", name: "Дуелі", cls: "qa-duels", icon: <svg viewBox="0 0 24 24" fill="none" stroke="var(--ember)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 3.5 21 3l-.5 6.5-9 9" /><path d="M3 16l5 5" /><path d="M9.5 3.5 3 3l.5 6.5 9 9" /><path d="M21 16l-5 5" /></svg> },
];

export default function HomePage() {
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

  if (!user) return null;

  return (
    <section className="view active">
      <h1 className="hello">Привіт, {user.nickname ?? user.email}!</h1>
      <p className="streakline">
        {streakStatus === "broken"
          ? `Серію з ${user.streak_days} днів перервано — почни нову!`
          : `${user.streak_days} днів поспіль — так тримати!`}{" "}
        <span style={{ display: "inline-block", verticalAlign: -3 }}>
          <svg viewBox="0 0 18 18" fill="none" width="17" height="17"><path d="M9 1.5 C9 1.5 4.5 5 4.5 9.8 C4.5 13.2 6.6 15.5 9 15.5 C11.4 15.5 13.5 13.2 13.5 9.8 C13.5 8 12.5 6.5 12.5 6.5 C12.5 8 11 8.8 11 7 C11 4.5 9 1.5 9 1.5Z" fill="#ff7a3c" /><path d="M9 6.5 C9 6.5 6.8 8.5 6.8 11 C6.8 12.8 7.8 14 9 14 C10.2 14 11.2 12.8 11.2 11 C11.2 9.5 10 8.8 10 8.8 C10 9.8 9 10 9 8.8 C9 7.5 9 6.5 9 6.5Z" fill="#ffc93c" /></svg>
        </span>
      </p>

      {showBanner && (
        <div className="banner">
          <div className="ic">
            <svg viewBox="0 0 32 32" fill="none" width="100%" height="100%"><path d="M16 3 C16 3 8 9 8 17.5 C8 23.5 11.6 27.5 16 27.5 C20.4 27.5 24 23.5 24 17.5 C24 14 22 11 22 11 C22 14 19 15.5 19 12 C19 7 16 3 16 3Z" fill="#fff" /><path d="M16 12 C16 12 12 15.5 12 20 C12 23 13.8 25 16 25 C18.2 25 20 23 20 20 C20 17.5 18 16 18 16 C18 18 16 18.5 16 16 C16 14 16 12 16 12Z" fill="#ffd98a" /></svg>
          </div>
          <div className="tx">
            <b>{streakStatus === "broken" ? "Серію перервано" : "Продовжуй серію сьогодні!"}</b>
            <span>Один урок — і твоя серія живе далі</span>
          </div>
          <button className="x" onClick={() => setBannerDismissed(true)}>✕</button>
        </div>
      )}

      <div className="quick-actions">
        {QUICK_ACTIONS.map((qa) => (
          <Link key={qa.href} href={qa.href} className={`qa ${qa.cls}`}>
            {qa.badge && <span className="qa-badge">{qa.badge}</span>}
            <span className="qa-ic">{qa.icon}</span>
            <span className="qa-name">{qa.name}</span>
          </Link>
        ))}
      </div>

      <h2 className="sec-title">Курси <small>{courses.length} регіонів світу</small></h2>
      <p className="sec-sub">Кожен предмет — окрема магічна земля. Обирай регіон і вирушай у подорож до НМТ.</p>

      <div className="courses">
        {courses.length === 0 ? (
          <p className="sec-sub" style={{ textAlign: "center" }}>Завантаження курсів…</p>
        ) : (
          courses.map((course) => {
            const progress = course.user_progress?.progress_percent ?? 0;
            const enrolled = course.user_progress !== null;
            const { cls, emblem } = subjectVisual(course.subject);
            // Only Математика is functional for now — it links to the existing
            // (old-design) course page on production. All other subjects are
            // decorative: they render but navigate nowhere.
            const isMath = course.slug === "mathematics";
            return (
              <article
                key={course.id}
                className={`course ${cls}`}
                onClick={
                  isMath
                    ? () => {
                        window.location.href =
                          "https://mathquest-frontend-eight.vercel.app/en/courses/mathematics";
                      }
                    : undefined
                }
              >
                <div className="emblem">{emblem}</div>
                <div>
                  <h3>
                    {course.title}
                    <span className="lvl-badge">{course.is_active ? "Відкрито" : "Скоро"}</span>
                  </h3>
                  <p className="desc">{course.description}</p>
                  <div className="prog">
                    <div className="row"><span>Прогрес</span><span>{progress}%</span></div>
                    <div className="track"><div className="fill" style={{ width: `${Math.max(progress, 2)}%` }} /></div>
                  </div>
                  <button className="go">{enrolled && progress > 0 ? "Продовжити" : "Розпочати"} <span>→</span></button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
