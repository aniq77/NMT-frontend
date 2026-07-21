"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import { TempThemeToggle } from "@/components/ui/TempThemeToggle";
import { SkinIcon, hasSkinIcon } from "@/components/ui/SkinIcon";
import { AchievementIcon } from "@/components/achievements/AchievementIcon";
import { achievementsApi } from "@/lib/api/achievements";
import { PAYMENTS_ENABLED } from "@/lib/features";
import type { User } from "@/types/auth";
import type { Achievement } from "@/types/achievements";
import "./profile-redesign.css";

const PROVIDER_LABEL: Record<User["auth_provider"], string> = {
  email: "Пошта",
  google: "Google",
  phone: "Телефон",
};

const RARITY_TAG: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legend",
};

const PREMIUM_FEATURES = [
  "Безліміт сердець",
  "×2 XP за урок",
  "Усі регіони",
  "+500 кристалів / міс",
  "Без реклами",
  "AI-розбір помилок",
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Inline SVG icons (ported 1:1 from the nmt-app-fixed mockup — no emoji)
// ---------------------------------------------------------------------------

const IconRankStar = (
  <svg className="em" viewBox="0 0 24 24" fill="none" width="22" height="22">
    <path d="M12 3l2.5 5 5.5.6-4 3.8 1.1 5.5L12 20.5 6.9 21l1.1-5.5-4-3.8L9.5 8 12 3z" fill="#ffd27a" stroke="#c9952a" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);
const StatFire = (
  <svg viewBox="0 0 32 32" fill="none" width="18" height="18">
    <path d="M16 3 C16 3 9 9 9 17 C9 22 12 26 16 26 C20 26 23 22 23 17 C23 15 22 13 22 13 C22 16 19 17 19 14 C19 9 16 3 16 3Z" fill="#ff8a4c" stroke="#e8602c" strokeWidth=".8" strokeLinejoin="round" />
    <path d="M16 12 C16 12 13 16 13 20 C13 22.5 14.5 24 16 24 C17.5 24 19 22.5 19 20 C19 18 17.5 17 17.5 17 C17.5 18.5 16 19 16 17.5 C16 16 16 12 16 12Z" fill="#ffd23c" />
  </svg>
);
const StatGem = (
  <svg viewBox="0 0 28 28" fill="none" width="18" height="18">
    <path d="M8 6 L20 6 L24 11 L14 23 L4 11 Z" fill="#4cc4d6" stroke="#1f8fa6" strokeWidth="1" />
    <path d="M4 11 L24 11" stroke="#1f8fa6" strokeWidth=".8" />
    <path d="M8 6 L11 11 M20 6 L17 11 M14 23 L14 11" stroke="#fff" strokeWidth=".8" opacity=".5" />
  </svg>
);
const IconEnergy = (
  <svg viewBox="0 0 28 28" fill="none" width="18" height="18">
    <path d="M15 3 L6 15 L12 15 L11 25 L22 12 L15 12 Z" fill="#ffd23c" stroke="#e8ab30" strokeWidth=".8" strokeLinejoin="round" />
  </svg>
);

// statistics / account tile icons (fill the 36px .ti box)
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
    <path d="M12 7 L12 12 L15 14" stroke="#4a7fc1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
const RoyalCrown = (
  <svg viewBox="0 0 56 44" fill="none" width="100%" height="100%">
    <path d="M6 36 L8 16 L18 26 L28 8 L38 26 L48 16 L50 36 Z" fill="#ffd879" stroke="#c9952a" strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="6" y="36" width="44" height="7" rx="3.5" fill="#e8ab30" />
    <circle cx="8" cy="16" r="3.5" fill="#fff9d0" />
    <circle cx="28" cy="8" r="3.5" fill="#fff9d0" />
    <circle cx="48" cy="16" r="3.5" fill="#fff9d0" />
  </svg>
);
const IconCheck = (
  <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
    <path d="M5 12l4 4 10-10" stroke="#3a2400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCopy = (
  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
    <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
const IconExit = (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
    <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 8l-4 4 4 4M6 12h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
      .profile()
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
  const levelExpRequired = user.exp_required_for_next_level ?? levelExp + user.exp_to_next_level;
  const expPercent = Math.min(100, Math.round((levelExp / Math.max(levelExpRequired, 1)) * 100));
  const expRemaining = Math.max(0, levelExpRequired - levelExp);
  const canRestoreStreak = user.lost_streak_days > 0 && user.gems >= 50;
  const initial = (user.nickname ?? user.email).charAt(0).toUpperCase();
  const skin = user.equipped_skin;
  const rarityTag = skin && skin.rarity !== "default" ? RARITY_TAG[skin.rarity] : null;
  const displayName = user.nickname ?? user.email;
  const handle = user.nickname ? user.email : null;
  const profileAchievements = achievements.slice(0, 8);
  const totalAchievements = achievements.length;
  const unlockedCount = achievements.filter((a) => a.is_unlocked || a.unlocked).length;
  const achPercent = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  return (
    <section className="view active">
      <div className="profile-v2">
        {/* ═══ HERO PLAYER CARD ═══ */}
        <div className="pf-hero pf-glass">
          <div className="pf-bg">
            <div className="pf-band" />
            <div className="pf-aur1" />
            <div className="pf-aur2" />
            <div className="pf-aur3" />
            <div className="pf-stars" />
          </div>
          {/* TEMP: moon/sun switch reusing main's next-themes system */}
          <TempThemeToggle />
          <div className="pf-hero-top">
            <span className="pf-rank">{IconRankStar}Рівень {user.level} · Шукач</span>
          </div>
          <div className="pf-hero-body">
            <div className="pf-avf">
              <div className="pf-ring" />
              {rarityTag && <span className="pf-rtag">{rarityTag}</span>}
              <div className="pf-av" style={skin?.gradient ? { background: skin.gradient } : undefined}>
                {skin && hasSkinIcon(skin.code) ? <SkinIcon code={skin.code} className="h-16 w-16" /> : initial}
                <span className="pf-lv">{user.level}</span>
              </div>
            </div>
            <div className="pf-name">{displayName}</div>
            {handle && <div className="pf-handle">{handle}</div>}

            <div className="pf-xp">
              <div className="lab">
                <span className="l">До рівня {user.level + 1}</span>
                <span className="r">{levelExp.toLocaleString("uk")} / {levelExpRequired.toLocaleString("uk")} XP</span>
              </div>
              <div className="pf-track"><div className="pf-fill" style={{ width: `${expPercent}%` }} /></div>
              <div className="pf-lvls">
                <span>Рівень {user.level}</span>
                <span>лишилось {expRemaining.toLocaleString("uk")} XP</span>
                <span>Рівень {user.level + 1}</span>
              </div>
            </div>

            <div className="pf-mini">
              <div className="pf-ministat s-fire"><span className="mi">{StatFire}</span><span className="mt"><b>{user.streak_days}</b><span>днів</span></span></div>
              <div className="pf-ministat s-gem"><span className="mi">{StatGem}</span><span className="mt"><b>{user.gems}</b><span>кристали</span></span></div>
              <div className="pf-ministat s-energy"><span className="mi">{IconEnergy}</span><span className="mt"><b>{user.energy}</b><span>енергія</span></span></div>
            </div>
          </div>
        </div>

        {/* ═══ ACHIEVEMENTS — real data from the API ═══ */}
        <div className="pf-glass pf-block">
          <div className="pf-sech">
            <span className="t">Досягнення</span>
            <span className="rule" />
            <button type="button" className="c" onClick={() => router.push("/achievements")}>
              <b>{unlockedCount}</b> / {totalAchievements} зібрано →
            </button>
          </div>
          {achievementsLoading ? (
            <p className="pf-handle" style={{ textAlign: "center" }}>Завантаження досягнень…</p>
          ) : totalAchievements === 0 ? (
            <p className="pf-handle" style={{ textAlign: "center" }}>Ще немає досягнень</p>
          ) : (
            <>
              <div className="pf-achbar"><i style={{ width: `${achPercent}%` }} /></div>
              <div className="pf-grid">
                {profileAchievements.map((ach) => {
                  const progress =
                    ach.condition_value > 0
                      ? Math.min(100, Math.round((ach.user_progress / ach.condition_value) * 100))
                      : 0;
                  const isUnlocked = ach.is_unlocked || ach.unlocked;
                  return (
                    <div
                      key={ach.id}
                      className={`pf-medal r-${ach.rarity}${isUnlocked ? "" : " locked"}`}
                      title={`${ach.name}: ${ach.description}. ${ach.progress_label}`}
                    >
                      <div className="pf-disc">
                        <AchievementIcon icon={ach.icon} slug={ach.slug} code={ach.code} alt="" unlocked={isUnlocked} />
                      </div>
                      <div className="mn">{ach.name}</div>
                      {isUnlocked ? (
                        <div className="mv">Отримано</div>
                      ) : (
                        <div className="pf-mprog"><i style={{ width: `${progress}%` }} /></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ═══ RESTORE STREAK ═══ */}
        {canRestoreStreak && (
          <div className="pf-glass pf-block pf-restore">
            <div className="rt">Відновити серію {user.lost_streak_days} днів?</div>
            <p className="rs">Коштує 50 кристалів. У тебе {user.gems}.</p>
            {streakError && <p className="rerr">{streakError}</p>}
            <button className="pf-restore-btn" disabled={isRestoring} onClick={handleRestoreStreak}>
              {isRestoring ? "Відновлення…" : "Відновити за 50 кристалів"}
            </button>
          </div>
        )}

        {/* ═══ STATISTICS ═══ */}
        <div className="pf-glass pf-block">
          <div className="pf-sech"><span className="t">Статистика</span><span className="rule" /></div>
          <div className="pf-tiles">
            <div className="pf-tile g"><div className="ti">{TileTrophy}</div><div className="tb"><small>Макс. серія</small><b>{user.best_streak_days} дн.</b></div></div>
            <div className="pf-tile g"><div className="ti">{TileStar}</div><div className="tb"><small>Всього XP</small><b>{user.exp.toLocaleString("uk")} XP</b></div></div>
            <div className="pf-tile v"><div className="ti">{TileCalendar}</div><div className="tb"><small>З нами з</small><b>{formatDate(user.date_joined)}</b></div></div>
            {user.last_activity_date && (
              <div className="pf-tile b"><div className="ti">{TileActivity}</div><div className="tb"><small>Активність</small><b>{formatDate(user.last_activity_date)}</b></div></div>
            )}
          </div>
        </div>

        {/* ═══ ACCOUNT ═══ */}
        <div className="pf-glass pf-block">
          <div className="pf-sech"><span className="t">Акаунт</span><span className="rule" /></div>
          <div className="pf-tiles col">
            <div className="pf-acc-code">
              <div className="ti">{TileId}</div>
              <div className="tb"><small>Мій код (для друзів)</small><b>{user.player_code || user.id}</b></div>
              <button type="button" className={`pf-copybtn${codeCopied ? " ok" : ""}`} onClick={handleCopyCode}>
                {IconCopy}<span>{codeCopied ? "Скопійовано ✓" : "Копіювати"}</span>
              </button>
            </div>
            <div className="pf-tile b pf-acc-email"><div className="ti">{TileMail}</div><div className="tb"><small>Email</small><b title={user.email}>{user.email}</b></div>{user.is_email_verified && <span className="tag">✓ Verified</span>}</div>
            <div className="pf-tile g"><div className="ti">{TileLogin}</div><div className="tb"><small>Метод входу</small><b>{PROVIDER_LABEL[user.auth_provider]}</b></div></div>
            <div className="pf-tile v"><div className="ti">{TileGlobe}</div><div className="tb"><small>Мова інтерфейсу</small><b>Українська</b></div></div>
            <div className="pf-tile r"><div className="ti">{TileBell}</div><div className="tb"><small>Сповіщення</small><b>Увімкнено</b></div></div>
          </div>
        </div>

        {/* ═══ ROYAL PASS ═══ */}
        <div className="pf-royal">
          <div className="pf-rinner">
            <span className="pf-spark" style={{ width: 5, height: 5, top: 24, left: "72%" }} />
            <span className="pf-spark" style={{ width: 4, height: 4, top: 120, left: "26%", animationDelay: "1.2s" }} />
            <span className="pf-spark" style={{ width: 3, height: 3, top: 70, left: "52%", animationDelay: "2s" }} />
            <span className="pf-rrib">−40%</span>
            <div className="pf-rhead">
              <div className="pf-rcrown">{RoyalCrown}</div>
              <div><div className="pf-reye">NMT Premium</div><h3>Royal Pass</h3></div>
            </div>
            <div className="pf-feats">
              {PREMIUM_FEATURES.map((f) => (
                <div className="pf-feat" key={f}><span className="ck">{IconCheck}</span> {f}</div>
              ))}
            </div>
            <div className="pf-rfoot">
              <div className="pf-price"><span className="now">99 ₴<small>/міс</small></span><span className="old">165 ₴</span></div>
              {PAYMENTS_ENABLED ? (
                <button className="pf-rgo" onClick={() => router.push("/subscription")}>Спробувати →</button>
              ) : (
                <button className="pf-rgo" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>Скоро</button>
              )}
            </div>
            <div className="pf-rnote"><b>7 днів безкоштовно</b> · скасуй будь-коли</div>
          </div>
        </div>

        <button className="pf-logout" onClick={handleLogout}>{IconExit} Вийти з акаунту</button>
      </div>
    </section>
  );
}
