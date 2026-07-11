"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import { TempThemeToggle } from "@/components/ui/TempThemeToggle";
import { SkinIcon, hasSkinIcon } from "@/components/ui/SkinIcon";
import { achievementsApi } from "@/lib/api/achievements";
import type { User } from "@/types/auth";
import type { Achievement, AchievementTier, AchievementConditionType } from "@/types/achievements";

const PROVIDER_LABEL: Record<User["auth_provider"], string> = {
  email: "Пошта",
  google: "Google",
  phone: "Телефон",
};

// Map the backend achievement tier onto the game-app medallion rarity styles.
const TIER_RARITY: Record<AchievementTier, string> = {
  bronze: "r-common",
  silver: "r-rare",
  gold: "r-epic",
  platinum: "r-legend",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Inline SVG icons (ported 1:1 from the nmt-app-fixed mockup — no emoji)
// ---------------------------------------------------------------------------

const IconEnergy = (
  <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
    <path d="M15 3 L6 15 L12 15 L11 25 L22 12 L15 12 Z" fill="#ffd23c" stroke="#e8ab30" strokeWidth=".8" strokeLinejoin="round" />
  </svg>
);

const IconLock = (
  <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
    <rect x="5" y="11" width="14" height="10" rx="2.5" fill="#b0b8c9" stroke="#8090a8" strokeWidth="1" />
    <path d="M8 11 L8 8 C8 5.2 16 5.2 16 8 L16 11" stroke="#8090a8" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="16" r="2" fill="#8090a8" />
  </svg>
);

// medal disc icons — keyed by the backend achievement condition type
const MEDAL_STAR = (
  <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
    <path d="M24 6 L28 18 L41 18 L31 26 L35 38 L24 30 L13 38 L17 26 L7 18 L20 18 Z" fill="#f3c25a" stroke="#c9952a" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M24 10 L27 19 L24 17 Z" fill="#fff" opacity=".4" />
  </svg>
);
const MEDAL_FLAME = (
  <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
    <path d="M24 6 C24 6 12 14 12 26 C12 33 17 39 24 39 C31 39 36 33 36 26 C36 22 34 18 34 18 C34 23 29 25 29 19 C29 11 24 6 24 6Z" fill="#ff8a4c" stroke="#e8602c" strokeWidth="1" strokeLinejoin="round" />
    <path d="M24 18 C24 18 19 24 19 30 C19 33.5 21 36 24 36 C27 36 29 33.5 29 30 C29 27 27 25 27 25 C27 27.5 24 28.5 24 26 C24 23 24 18 24 18Z" fill="#ffd23c" />
  </svg>
);
const MEDAL_BOOKS = (
  <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
    <rect x="10" y="14" width="10" height="22" rx="2" fill="#6fa8dc" />
    <rect x="22" y="10" width="10" height="26" rx="2" fill="#4a7fc1" />
    <rect x="34" y="16" width="8" height="20" rx="2" fill="#89c4e8" />
    <line x1="24" y1="16" x2="24" y2="32" stroke="#fff" strokeWidth="1" opacity=".4" />
    <line x1="36" y1="20" x2="36" y2="30" stroke="#fff" strokeWidth="1" opacity=".4" />
  </svg>
);
const MEDAL_COMPASS = (
  <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
    <circle cx="24" cy="24" r="18" stroke="#4a7fc1" strokeWidth="2" fill="#d0e8f8" />
    <path d="M24 12 L27 22 L24 20 L21 22 Z" fill="#e8794a" />
    <path d="M24 36 L21 26 L24 28 L27 26 Z" fill="#4a7fc1" />
    <circle cx="24" cy="24" r="2.5" fill="#fff" stroke="#4a7fc1" strokeWidth="1" />
    <line x1="12" y1="24" x2="16" y2="24" stroke="#4a7fc1" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="32" y1="24" x2="36" y2="24" stroke="#4a7fc1" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const MEDAL_BOLT = (
  <svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
    <path d="M28 6 L14 26 L22 26 L18 44 L36 20 L27 20 Z" fill="#ffe08a" stroke="#f3c25a" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="34" cy="12" r="5" fill="#fff9d0" opacity=".5" />
  </svg>
);

function medalIcon(type: AchievementConditionType): React.ReactNode {
  switch (type) {
    case "streak_days":       return MEDAL_FLAME;
    case "lessons_completed": return MEDAL_BOOKS;
    case "courses_completed": return MEDAL_COMPASS;
    case "level_reached":     return MEDAL_BOLT;
    case "exp_earned":        return MEDAL_STAR;
    default:                  return MEDAL_STAR;
  }
}

// statistics / account tile icons (fill the 36px .ti box, like the mockup)
const TileTrophy = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <path d="M7 5 L17 5 L17 14 C17 17 14.5 19 12 19 C9.5 19 7 17 7 14Z" fill="#f3c25a" />
    <path d="M4 5 L7 5 L7 12 C4 12 3 8 4 5Z" fill="#e8ab30" />
    <path d="M20 5 L17 5 L17 12 C20 12 21 8 20 5Z" fill="#e8ab30" />
    <rect x="10" y="19" width="4" height="3" fill="#e8ab30" />
    <rect x="7" y="22" width="10" height="2" rx="1" fill="#c9952a" />
  </svg>
);
const TileStar = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <path d="M12 3 L14 9 L20.5 9 L15.5 13 L17.5 19.5 L12 15.5 L6.5 19.5 L8.5 13 L3.5 9 L10 9 Z" fill="#f3c25a" stroke="#c9952a" strokeWidth=".8" />
  </svg>
);
const TileCalendar = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <rect x="3" y="5" width="18" height="16" rx="3" fill="#6fa8dc" stroke="#4a7fc1" strokeWidth="1" />
    <rect x="3" y="5" width="18" height="6" rx="3" fill="#4a7fc1" />
    <line x1="8" y1="3" x2="8" y2="7" stroke="#4a7fc1" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16" y1="3" x2="16" y2="7" stroke="#4a7fc1" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="15" r="1.5" fill="#4a7fc1" />
    <circle cx="12" cy="15" r="1.5" fill="#4a7fc1" />
    <circle cx="16" cy="15" r="1.5" fill="#4a7fc1" />
  </svg>
);
const TileActivity = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <circle cx="12" cy="12" r="9" stroke="#4a7fc1" strokeWidth="1.2" fill="#d0e8f8" />
    <path d="M12 6 L13.5 11 L12 10 L10.5 11 Z" fill="#e8794a" />
    <path d="M12 18 L10.5 13 L12 14 L13.5 13 Z" fill="#4a7fc1" />
    <circle cx="12" cy="12" r="1.5" fill="#fff" stroke="#4a7fc1" strokeWidth=".8" />
  </svg>
);
const TileMail = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <rect x="3" y="6" width="18" height="13" rx="2.5" fill="#6fa8dc" stroke="#4a7fc1" strokeWidth="1" />
    <path d="M3 8 L12 14 L21 8" stroke="#4a7fc1" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </svg>
);
const TileLogin = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <circle cx="9" cy="11" r="5" stroke="#f3c25a" strokeWidth="1.5" fill="#fff9d0" />
    <path d="M13 13 L20 20" stroke="#f3c25a" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 18 L19 16 M15 20 L17 18" stroke="#f3c25a" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const TileGlobe = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <circle cx="12" cy="12" r="9" stroke="#4a7fc1" strokeWidth="1.2" fill="#d0e8f8" />
    <ellipse cx="12" cy="12" rx="4" ry="9" stroke="#4a7fc1" strokeWidth="1" fill="none" />
    <line x1="3" y1="12" x2="21" y2="12" stroke="#4a7fc1" strokeWidth="1" />
    <path d="M5 7.5 Q12 9 19 7.5 M5 16.5 Q12 15 19 16.5" stroke="#4a7fc1" strokeWidth=".8" fill="none" />
  </svg>
);
const TileBell = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <path d="M12 3 C9 3 7 6 7 10 L7 16 L5 18 L19 18 L17 16 L17 10 C17 6 15 3 12 3Z" fill="#ef9aa8" stroke="#c97080" strokeWidth="1" />
    <circle cx="12" cy="20" r="2" fill="#c97080" />
    <line x1="12" y1="3" x2="12" y2="1" stroke="#c97080" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const TileId = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <rect x="3" y="6" width="18" height="12" rx="2.5" fill="#a99cf0" stroke="#7d6fd1" strokeWidth="1" />
    <circle cx="9" cy="12" r="2.5" fill="#fff" />
    <line x1="14" y1="10.5" x2="18" y2="10.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14" y1="13.5" x2="18" y2="13.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// royal-pass sticker icons
const StHeart = <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 16 C10 16 3 11.5 3 6.5 C3 4 5 2.5 7.5 2.5 C8.8 2.5 9.5 3.2 10 4 C10.5 3.2 11.2 2.5 12.5 2.5 C15 2.5 17 4 17 6.5 C17 11.5 10 16 10 16Z" fill="#e35d72" /></svg>;
const StXp = <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 2 L11.5 7 L17 7 L12.5 10 L14 15.5 L10 12.5 L6 15.5 L7.5 10 L3 7 L8.5 7 Z" fill="#f3c25a" /></svg>;
const StMap = <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M3 4 L7 2 L13 5 L17 3 L17 16 L13 18 L7 15 L3 17 Z" fill="#4fbf83" stroke="#2d8f5e" strokeWidth=".8" strokeLinejoin="round" /><line x1="7" y1="2" x2="7" y2="15" stroke="#2d8f5e" strokeWidth=".8" /><line x1="13" y1="5" x2="13" y2="18" stroke="#2d8f5e" strokeWidth=".8" /></svg>;
const StGem = <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M5 4 L15 4 L18 8 L10 17 L2 8 Z" fill="#4cc4d6" stroke="#1f8fa6" strokeWidth=".8" /><line x1="2" y1="8" x2="18" y2="8" stroke="#1f8fa6" strokeWidth=".6" /></svg>;
const StNoAds = <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><circle cx="10" cy="10" r="7.5" stroke="#e35d72" strokeWidth="1.5" fill="none" /><line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke="#e35d72" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const StAi = <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><circle cx="10" cy="10" r="6" fill="#7d6fd1" opacity=".2" stroke="#7d6fd1" strokeWidth="1" /><circle cx="10" cy="7" r="1.5" fill="#7d6fd1" /><path d="M7 12.5 C7 10.5 13 10.5 13 12.5" stroke="#7d6fd1" strokeWidth="1.2" strokeLinecap="round" fill="none" /><path d="M6 10 C4 8 3 5 5 4" stroke="#7d6fd1" strokeWidth=".8" strokeLinecap="round" fill="none" /><path d="M14 10 C16 8 17 5 15 4" stroke="#7d6fd1" strokeWidth=".8" strokeLinecap="round" fill="none" /></svg>;

const IconGift = (
  <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }}>
    <rect x="2" y="8" width="16" height="10" rx="2" fill="#ef9aa8" />
    <rect x="2" y="8" width="16" height="4" rx="1" fill="#e35d72" />
    <rect x="9" y="8" width="2" height="10" fill="#e35d72" />
    <path d="M10 8 C10 8 7 6 7 4 C7 3 8 2 9 3 C9.5 4 10 6 10 8Z" fill="#ef9aa8" />
    <path d="M10 8 C10 8 13 6 13 4 C13 3 12 2 11 3 C10.5 4 10 6 10 8Z" fill="#ef9aa8" />
  </svg>
);

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchMe, restoreStreak, logout } = useAuthStore();
  const [isRestoring, setIsRestoring] = useState(false);
  const [streakError, setStreakError] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    fetchMe().catch(() => {});
    achievementsApi
      .list()
      .then(setAchievements)
      .catch(() => {})
      .finally(() => setAchievementsLoading(false));
  }, [fetchMe]);

  // The profile is entirely the signed-in user's own data, so it can't degrade
  // to a public view. Send unauthenticated visitors to login instead of
  // rendering a blank page. Key off `isAuthenticated`, not `user`: after a
  // persist migration the session flag survives while `user` is briefly null
  // until `fetchMe()` resolves — redirecting on `!user` would bounce a
  // signed-in user to login during that window.
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  async function handleCopyCode() {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.player_code || user.id);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context) — ignore silently.
    }
  }

  async function handleRestoreStreak() {
    setIsRestoring(true);
    setStreakError("");
    try {
      await restoreStreak();
    } catch {
      setStreakError("Не вдалося відновити серію. Спробуй ще раз.");
    } finally {
      setIsRestoring(false);
    }
  }

  // Redirecting to /login (see effect above); render nothing this frame.
  if (!user) return null;

  const levelExp = user.exp_in_current_level ?? Math.max(0, user.exp - user.exp_to_next_level);
  const levelExpRequired =
    user.exp_required_for_next_level ?? levelExp + user.exp_to_next_level;
  const expPercent = Math.min(
    100,
    Math.round((levelExp / Math.max(levelExpRequired, 1)) * 100),
  );
  const canRestoreStreak = user.lost_streak_days > 0 && user.gems >= 50;
  const initial = (user.nickname ?? user.email).charAt(0).toUpperCase();
  const skin = user.equipped_skin;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const sortedAchievements = [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));

  return (
    <section className="view active">
      <div className="profile-wrap">
        {/* IDENTITY BANNER */}
        <div className="glass pbanner">
          {/* TEMP: tiny theme switch reusing main's next-themes system */}
          <TempThemeToggle />
          <div className="pav" style={skin?.gradient ? { background: skin.gradient } : undefined}>
            {skin && hasSkinIcon(skin.code) ? <SkinIcon code={skin.code} className="h-14 w-14" /> : initial}
            <span className="lv">{user.level}</span>
          </div>
          <div className="pb-mid">
            <h2>@{user.nickname ?? user.email}</h2>
            <div className="mail">{user.email}</div>
            <div className="lvl-chip">✦ Рівень {user.level} · Шукач</div>
            <div className="pxp">
              <div className="row">
                <span>XP до рівня {user.level + 1}</span>
                <span>{levelExp.toLocaleString("uk")} / {levelExpRequired.toLocaleString("uk")}</span>
              </div>
              <div className="track"><div className="fill" style={{ width: `${expPercent}%` }} /></div>
            </div>
          </div>
          <div className="pb-stats">
            <div className="qstat s-fire"><div className="qi"><svg viewBox="0 0 32 32" fill="none" width="20" height="20"><path d="M16 3 C16 3 9 9 9 17 C9 22 12 26 16 26 C20 26 23 22 23 17 C23 15 22 13 22 13 C22 16 19 17 19 14 C19 9 16 3 16 3Z" fill="#ff8a4c" stroke="#e8602c" strokeWidth=".8" strokeLinejoin="round" /><path d="M16 12 C16 12 13 16 13 20 C13 22.5 14.5 24 16 24 C17.5 24 19 22.5 19 20 C19 18 17.5 17 17.5 17 C17.5 18.5 16 19 16 17.5 C16 16 16 12 16 12Z" fill="#ffd23c" /></svg></div><div className="qt"><b>{user.streak_days}</b><span>днів поспіль</span></div></div>
            <div className="qstat s-gem"><div className="qi"><svg viewBox="0 0 28 28" fill="none" width="20" height="20"><path d="M8 6 L20 6 L24 11 L14 23 L4 11 Z" fill="#4cc4d6" stroke="#1f8fa6" strokeWidth="1" /><path d="M4 11 L24 11" stroke="#1f8fa6" strokeWidth=".8" /><path d="M8 6 L11 11 M20 6 L17 11 M14 23 L14 11" stroke="#fff" strokeWidth=".8" opacity=".5" /></svg></div><div className="qt"><b>{user.gems}</b><span>Кристали</span></div></div>
            <div className="qstat s-energy"><div className="qi">{IconEnergy}</div><div className="qt"><b>{user.energy}</b><span>Енергія</span></div></div>
          </div>
        </div>

        {/* ACHIEVEMENTS — real data from the API, rendered in game-app medal style */}
        <div className="glass block">
          <div className="bt-row">
            <div className="bt">Досягнення</div>
            {!achievementsLoading && achievements.length > 0 && (
              <div className="bt-count">{unlockedCount} / {achievements.length} зібрано</div>
            )}
          </div>
          {achievementsLoading ? (
            <p className="sec-sub" style={{ textAlign: "center", margin: 0 }}>Завантаження досягнень…</p>
          ) : achievements.length === 0 ? (
            <p className="sec-sub" style={{ textAlign: "center", margin: 0 }}>Ще немає досягнень</p>
          ) : (
            <div className="ach-grid">
              {sortedAchievements.map((ach) => {
                const progress =
                  ach.condition_value > 0
                    ? Math.min(100, Math.round((ach.user_progress / ach.condition_value) * 100))
                    : 0;
                return (
                  <div
                    key={ach.id}
                    className={`medal ${TIER_RARITY[ach.tier]}${ach.unlocked ? "" : " locked"}`}
                    title={ach.description}
                  >
                    <div className="disc">
                      {medalIcon(ach.condition_type)}
                      {!ach.unlocked && <span className="lockb">{IconLock}</span>}
                    </div>
                    <div className="mname">{ach.title}</div>
                    {ach.unlocked ? (
                      <div className="mval">Отримано</div>
                    ) : (
                      <div className="mprog"><i style={{ width: `${progress}%` }} /></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RESTORE STREAK */}
        {canRestoreStreak && (
          <div className="glass block">
            <div className="bt-row"><div className="bt">Відновити серію {user.lost_streak_days} днів?</div></div>
            <p className="sec-sub" style={{ margin: "0 0 12px" }}>Коштує 50 кристалів. У тебе {user.gems}.</p>
            {streakError && <p style={{ color: "#ff9ab0", fontSize: 12, marginBottom: 10 }}>{streakError}</p>}
            <button className="q-claim" style={{ width: "100%" }} disabled={isRestoring} onClick={handleRestoreStreak}>
              {isRestoring ? "Відновлення…" : "Відновити за 50 кристалів"}
            </button>
          </div>
        )}

        {/* STATS + ACCOUNT */}
        <div className="two">
          <div className="glass block">
            <div className="bt-row"><div className="bt">Статистика</div></div>
            <div className="tiles grid2">
              <div className="tile g"><div className="ti">{TileTrophy}</div><div className="tb"><small>Макс. серія</small><b>{user.best_streak_days} дн.</b></div></div>
              <div className="tile"><div className="ti">{TileStar}</div><div className="tb"><small>Всього XP</small><b>{user.exp.toLocaleString("uk")} XP</b></div></div>
              <div className="tile v"><div className="ti">{TileCalendar}</div><div className="tb"><small>З нами з</small><b>{formatDate(user.date_joined)}</b></div></div>
              {user.last_activity_date && (
                <div className="tile"><div className="ti">{TileActivity}</div><div className="tb"><small>Активність</small><b>{formatDate(user.last_activity_date)}</b></div></div>
              )}
            </div>
          </div>
          <div className="glass block">
            <div className="bt-row"><div className="bt">Акаунт</div></div>
            <div className="tiles">
              <div
                className="tile"
                onClick={handleCopyCode}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCopyCode(); } }}
                title="Натисніть, щоб скопіювати"
              >
                <div className="ti">{TileId}</div>
                <div className="tb">
                  <small>Мій код (для друзів)</small>
                  <b style={{ fontSize: 20, letterSpacing: 3, fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>{user.player_code || user.id}</b>
                </div>
                <span style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="tag"
                    style={{ cursor: "pointer", border: "none" }}
                    onClick={handleCopyCode}
                  >
                    {codeCopied ? "✓ Скопійовано" : "Копіювати"}
                  </button>
                </span>
              </div>
              <div className="tile"><div className="ti">{TileMail}</div><div className="tb"><small>Email</small><b>{user.email}</b></div>{user.is_email_verified && <span className="tag">✓</span>}</div>
              <div className="tile g"><div className="ti">{TileLogin}</div><div className="tb"><small>Метод входу</small><b>{PROVIDER_LABEL[user.auth_provider]}</b></div></div>
              <div className="tile v"><div className="ti">{TileGlobe}</div><div className="tb"><small>Мова інтерфейсу</small><b>Українська</b></div></div>
              <div className="tile r"><div className="ti">{TileBell}</div><div className="tb"><small>Сповіщення</small><b>Увімкнено</b></div></div>
            </div>
          </div>
        </div>

        {/* PREMIUM */}
        <div className="royal">
          <div className="rinner">
            <span className="r-ribbon">АКЦІЯ −40%</span>
            <div className="r-sheen" />
            <span className="r-spark" style={{ width: 5, height: 5, top: 22, left: "74%" }} />
            <span className="r-spark" style={{ width: 4, height: 4, top: 118, left: "30%", animationDelay: "2s" }} />
            <span className="r-spark" style={{ width: 3, height: 3, top: 176, left: "66%", animationDelay: "1s" }} />
            <div className="r-head">
              <div className="r-crown" style={{ width: 48, height: 38 }}>
                <svg viewBox="0 0 56 44" fill="none" width="100%" height="100%"><path d="M6 36 L8 16 L18 26 L28 8 L38 26 L48 16 L50 36 Z" fill="#f3c25a" stroke="#c9952a" strokeWidth="1.5" strokeLinejoin="round" /><rect x="6" y="36" width="44" height="7" rx="3.5" fill="#e8ab30" /><circle cx="8" cy="16" r="3.5" fill="#fff9d0" /><circle cx="28" cy="8" r="3.5" fill="#fff9d0" /><circle cx="48" cy="16" r="3.5" fill="#fff9d0" /></svg>
              </div>
              <div><div className="r-eye">NMT Premium</div><h3>Royal Pass</h3></div>
            </div>
            <div className="stickers">
              <span className="st"><span className="ic">{StHeart}</span> Безліміт сердець</span>
              <span className="st"><span className="ic">{StXp}</span> ×2 XP</span>
              <span className="st"><span className="ic">{StMap}</span> Усі 5 регіонів</span>
              <span className="st"><span className="ic">{StGem}</span> +500 / міс</span>
              <span className="st"><span className="ic">{StNoAds}</span> Без реклами</span>
              <span className="st"><span className="ic">{StAi}</span> AI-розбір</span>
            </div>
            <div className="r-footer">
              <div className="pricebox">
                <span className="now">99 ₴<small>/міс</small></span>
                <span className="old">165 ₴</span>
                <span className="save">−40%</span>
              </div>
              <button className="r-go" onClick={() => router.push("/subscription")}><span className="gs" /> Розблокувати →</button>
            </div>
            <div className="r-note">{IconGift}<b>7 днів безкоштовно</b> · скасуй будь-коли</div>
          </div>
        </div>

        <button className="logout" onClick={handleLogout}>Вийти з акаунту</button>
      </div>
    </section>
  );
}
