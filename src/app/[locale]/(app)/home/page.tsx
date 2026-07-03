"use client";
import { useState, useEffect, useMemo } from "react";
import { Link } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";

type StreakStatus = "broken" | "at-risk" | null;

export default function HomePage() {
  const { user, fetchMe } = useAuthStore();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    fetchMe().catch(() => {});
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

  // Quest rewards ready to claim. There is no backend source for this yet, so
  // it is 0 and the badge stays hidden. The "2" in the HTML mockup is only a
  // design sample — the badge must show the REAL count and disappear at 0,
  // never a constant number. Wire this to the rewards API when it exists.
  const availableRewards = 0;

  if (!user) return null;

  // Only Математика is functional for now. Same-origin relative path so it
  // resolves identically on localhost, Preview and Production.
  const openMathematics = () => {
    window.location.href = "/en/courses/mathematics";
  };

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

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <Link href="/quests" className="qa qa-tasks">
          {availableRewards > 0 && <span className="qa-badge">{availableRewards}</span>}
          <span className="qa-ic"><svg viewBox="0 0 24 24" fill="none" stroke="var(--teal-bright)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="var(--teal-bright)" stroke="none" /></svg></span>
          <span className="qa-name">Завдання</span>
        </Link>
        <Link href="/shop" className="qa qa-shop">
          <span className="qa-ic"><svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinejoin="round"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" /></svg></span>
          <span className="qa-name">Крамниця</span>
        </Link>
        <Link href="/friends" className="qa qa-friends">
          <span className="qa-ic"><svg viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-4.6 5.5-4.6s5.5 1.6 5.5 4.6" /><path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 14.6c2.3.5 3.5 2 3.5 4.4" /></svg></span>
          <span className="qa-name">Друзі</span>
        </Link>
        <Link href="/pvp" className="qa qa-duels">
          <span className="qa-ic"><svg viewBox="0 0 24 24" fill="none" stroke="var(--ember)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 3.5 21 3l-.5 6.5-9 9" /><path d="M3 16l5 5" /><path d="M9.5 3.5 3 3l.5 6.5 9 9" /><path d="M21 16l-5 5" /></svg></span>
          <span className="qa-name">Дуелі</span>
        </Link>
      </div>

      <h2 className="sec-title">Курси <small>5 регіонів світу</small></h2>
      <p className="sec-sub">Кожен предмет — окрема магічна земля. Обирай регіон і вирушай у подорож до НМТ.</p>

      <div className="courses">
        {/* Математика — the only working card: opens the existing course page. */}
        <article className="course c-math" onClick={openMathematics}>
          <div className="scene"><svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
            <g fill="#fff" opacity=".85"><circle cx="40" cy="30" r="1.6" /><circle cx="120" cy="20" r="2" /><circle cx="300" cy="34" r="1.6" /><circle cx="360" cy="60" r="2" /><circle cx="200" cy="18" r="1.4" /></g>
            <circle cx="350" cy="40" r="22" fill="#e8f0ff" opacity=".5" />
            <g stroke="#9fd2ff" strokeWidth="1" opacity=".6" fill="none"><path d="M60 70 L120 60 L90 120 Z" /></g>
            <circle cx="60" cy="70" r="2.5" fill="#ffe08a" /><circle cx="120" cy="60" r="2.5" fill="#ffe08a" /><circle cx="90" cy="120" r="2.5" fill="#ffe08a" />
            <text x="330" y="150" fill="#cfe4ff" opacity=".5" fontFamily="Playfair Display" fontSize="34">π</text>
            <text x="250" y="190" fill="#cfe4ff" opacity=".4" fontFamily="Playfair Display" fontSize="26">∑</text>
          </svg></div>
          <div className="emblem"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><path d="M10 15 L20 15 M12.5 15 L12 26 M17.5 15 L17.5 24 C17.5 26 19 26 20 25" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="33" cy="14" r="1.7" fill="#fff" /><line x1="27" y1="19" x2="39" y2="19" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /><circle cx="33" cy="24" r="1.7" fill="#fff" /><line x1="14" y1="31" x2="14" y2="39" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /><line x1="10" y1="35" x2="18" y2="35" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /><line x1="29" y1="31" x2="37" y2="39" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /><line x1="37" y1="31" x2="29" y2="39" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></svg></div>
          <div>
            <h3>Математика <span className="lvl-badge">Середній</span></h3>
            <p className="desc">Підготовка до НМТ з математики — серед сузір’їв формул та геометрії зір.</p>
            <div className="prog"><div className="row"><span>Прогрес</span><span>100%</span></div><div className="track"><div className="fill" style={{ width: "100%" }} /></div></div>
            <button className="go">Продовжити <span>→</span></button>
          </div>
        </article>

        {/* Українська мова — decorative (no navigation yet) */}
        <article className="course c-ukr">
          <div className="scene"><svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
            <circle cx="320" cy="60" r="40" fill="#ffd27a" opacity=".25" />
            <rect x="40" y="120" width="14" height="60" fill="#c97b4a" opacity=".5" /><rect x="58" y="116" width="12" height="64" fill="#9b8cff" opacity=".5" /><rect x="74" y="122" width="14" height="58" fill="#54e0a0" opacity=".5" />
            <circle cx="200" cy="70" r="6" fill="#ffe7a8" opacity=".8" />
          </svg></div>
          <div className="emblem"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><rect x="8" y="10" width="16" height="30" rx="2" fill="rgba(255,255,255,.5)" /><rect x="24" y="10" width="16" height="30" rx="2" fill="rgba(255,255,255,.65)" /><rect x="22" y="9" width="4" height="32" rx="2" fill="rgba(255,255,255,.35)" /><line x1="27" y1="17" x2="36" y2="17" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round" /><line x1="27" y1="21" x2="36" y2="21" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round" /><line x1="27" y1="25" x2="33" y2="25" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
          <div>
            <h3>Українська мова <span className="lvl-badge">Скоро</span></h3>
            <p className="desc">Правопис, граматика та стилістика — все для впевненої грамотності.</p>
            <div className="prog"><div className="row"><span>Прогрес</span><span>0%</span></div><div className="track"><div className="fill" style={{ width: "6%" }} /></div></div>
            <button className="go">Розпочати <span>→</span></button>
          </div>
        </article>

        {/* Історія України — decorative */}
        <article className="course c-hist">
          <div className="scene"><svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
            <circle cx="330" cy="50" r="34" fill="#ffd27a" opacity=".3" />
            <g fill="#e9c06a" opacity=".5"><rect x="40" y="120" width="16" height="60" /><rect x="70" y="112" width="16" height="68" /><rect x="100" y="118" width="16" height="62" /></g>
            <path d="M30 110 L130 104 L80 80 Z" fill="#e9c06a" opacity=".5" />
          </svg></div>
          <div className="emblem"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><rect x="6" y="38" width="36" height="4" rx="2" fill="rgba(255,255,255,.7)" /><rect x="6" y="10" width="36" height="4" rx="2" fill="rgba(255,255,255,.7)" /><rect x="8" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" /><rect x="17" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" /><rect x="26" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" /><rect x="35" y="14" width="6" height="24" rx="2" fill="rgba(255,255,255,.55)" /></svg></div>
          <div>
            <h3>Історія України <span className="lvl-badge">Скоро</span></h3>
            <p className="desc">Від Київської Русі до сьогодення — події, дати та особистості.</p>
            <div className="prog"><div className="row"><span>Прогрес</span><span>0%</span></div><div className="track"><div className="fill" style={{ width: "6%" }} /></div></div>
            <button className="go">Розпочати <span>→</span></button>
          </div>
        </article>

        {/* Біологія — decorative */}
        <article className="course c-bio">
          <div className="scene"><svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
            <circle cx="80" cy="90" r="50" fill="#54e0a0" opacity=".35" /><circle cx="320" cy="100" r="44" fill="#54e0a0" opacity=".3" />
            <circle cx="80" cy="80" r="4" fill="#9cf0cf" /><circle cx="320" cy="92" r="3" fill="#9cf0cf" />
            <path d="M0 180 Q200 150 400 180 L400 220 L0 220Z" fill="#5cdcef" opacity=".3" />
          </svg></div>
          <div className="emblem"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><path d="M24 8 C10 8 8 24 14 34 C18 40 24 42 24 42 C24 42 30 40 34 34 C40 24 38 8 24 8Z" fill="rgba(255,255,255,.6)" /><path d="M24 8 C24 8 26 20 22 34" stroke="rgba(255,255,255,.35)" strokeWidth="1.8" strokeLinecap="round" /></svg></div>
          <div>
            <h3>Біологія <span className="lvl-badge">Скоро</span></h3>
            <p className="desc">Клітини, організми та екосистеми — як влаштоване життя навколо.</p>
            <div className="prog"><div className="row"><span>Прогрес</span><span>0%</span></div><div className="track"><div className="fill" style={{ width: "6%" }} /></div></div>
            <button className="go">Розпочати <span>→</span></button>
          </div>
        </article>

        {/* Фізика — decorative */}
        <article className="course c-phys">
          <div className="scene"><svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
            <ellipse cx="90" cy="120" rx="50" ry="16" fill="#5cc4dd" opacity=".4" /><ellipse cx="320" cy="80" rx="40" ry="13" fill="#5cc4dd" opacity=".35" />
            <circle cx="200" cy="90" r="20" fill="#7fe0ec" opacity=".4" /><path d="M150 70 l14 0 l-8 18 l18 0 l-24 36 l5 -26 l-13 0z" fill="#ffe08a" opacity=".6" />
          </svg></div>
          <div className="emblem"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><path d="M28 6 L14 26 L22 26 L18 44 L36 20 L27 20 Z" fill="rgba(255,255,255,.75)" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinejoin="round" /></svg></div>
          <div>
            <h3>Фізика <span className="lvl-badge">Скоро</span></h3>
            <p className="desc">Сили, енергія та закони природи — зрозуміло і без зайвого.</p>
            <div className="prog"><div className="row"><span>Прогрес</span><span>0%</span></div><div className="track"><div className="fill" style={{ width: "6%" }} /></div></div>
            <button className="go">Розпочати <span>→</span></button>
          </div>
        </article>
      </div>
    </section>
  );
}
