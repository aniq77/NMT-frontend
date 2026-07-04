"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "@/lib/navigation";
import { Button } from "@/components/ui/Button";
import { StatChip } from "@/components/ui/StatChip";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { achievementsApi } from "@/lib/api/achievements";
import type { AchievementTier, AchievementConditionType } from "@/types/achievements";

// ---------------------------------------------------------------------------
// Static lookup tables
// ---------------------------------------------------------------------------

const AUTH_PROVIDER_LABEL: Record<string, string> = {
  email: "Пошта",
  google: "Google",
  phone: "Телефон",
};

// tier → rarity ring (matches the mockup's medallion rarities)
const TIER_RARITY: Record<AchievementTier, string> = {
  platinum: "r-legend",
  gold: "r-epic",
  silver: "r-rare",
  bronze: "r-common",
};

function rankTitle(level: number): string {
  if (level >= 30) return "Легенда";
  if (level >= 20) return "Майстер";
  if (level >= 12) return "Дослідник";
  if (level >= 6) return "Шукач";
  if (level >= 3) return "Учень";
  return "Новачок";
}

function formatShort(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Inline SVG icons (ported 1:1 from nmt-app-fixed (2).html)
// ---------------------------------------------------------------------------

const IconFire = (
  <svg viewBox="0 0 32 32" fill="none" width="20" height="20">
    <path d="M16 3 C16 3 9 9 9 17 C9 22 12 26 16 26 C20 26 23 22 23 17 C23 15 22 13 22 13 C22 16 19 17 19 14 C19 9 16 3 16 3Z" fill="#ff8a4c" stroke="#e8602c" strokeWidth=".8" strokeLinejoin="round" />
    <path d="M16 12 C16 12 13 16 13 20 C13 22.5 14.5 24 16 24 C17.5 24 19 22.5 19 20 C19 18 17.5 17 17.5 17 C17.5 18.5 16 19 16 17.5 C16 16 16 12 16 12Z" fill="#ffd23c" />
  </svg>
);

const IconGem = (
  <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
    <path d="M8 6 L20 6 L24 11 L14 23 L4 11 Z" fill="#4cc4d6" stroke="#1f8fa6" strokeWidth="1" strokeLinejoin="round" />
    <path d="M4 11 L24 11" stroke="#1f8fa6" strokeWidth=".8" />
    <path d="M8 6 L11 11 M20 6 L17 11 M14 23 L14 11" stroke="#fff" strokeWidth=".8" opacity=".5" strokeLinecap="round" />
  </svg>
);

const IconEnergy = (
  <svg viewBox="0 0 28 28" fill="none" width="20" height="20">
    <path d="M15 3 L6 15 L12 15 L11 25 L22 12 L15 12 Z" fill="#ffd23c" stroke="#e8ab30" strokeWidth=".8" strokeLinejoin="round" />
  </svg>
);

const IconLock = (
  <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
    <rect x="5" y="11" width="14" height="10" rx="2.5" fill="#b0b8c9" stroke="#8090a8" strokeWidth="1" />
    <path d="M8 11 L8 8 C8 5.2 16 5.2 16 8 L16 11" stroke="#8090a8" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="16" r="2" fill="#8090a8" />
  </svg>
);

// medal disc icons — keyed by achievement condition type
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

// statistics / account tile icons
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

// royal pass icons
const RoyalCrown = (
  <svg viewBox="0 0 56 44" fill="none" width="100%" height="100%">
    <path d="M6 36 L8 16 L18 26 L28 8 L38 26 L48 16 L50 36 Z" fill="#f3c25a" stroke="#c9952a" strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="6" y="36" width="44" height="7" rx="3.5" fill="#e8ab30" />
    <circle cx="8" cy="16" r="3.5" fill="#fff9d0" stroke="#c9952a" strokeWidth="1" />
    <circle cx="28" cy="8" r="3.5" fill="#fff9d0" stroke="#c9952a" strokeWidth="1" />
    <circle cx="48" cy="16" r="3.5" fill="#fff9d0" stroke="#c9952a" strokeWidth="1" />
    <path d="M12 30 L18 22 L24 28 L28 20 L32 28 L38 22 L44 30" stroke="#c9952a" strokeWidth=".8" fill="none" opacity=".4" />
  </svg>
);

const STICKERS: { icon: React.ReactNode; label: string }[] = [
  {
    label: "Безліміт сердець",
    icon: <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 16 C10 16 3 11.5 3 6.5 C3 4 5 2.5 7.5 2.5 C8.8 2.5 9.5 3.2 10 4 C10.5 3.2 11.2 2.5 12.5 2.5 C15 2.5 17 4 17 6.5 C17 11.5 10 16 10 16Z" fill="#e35d72" /></svg>,
  },
  {
    label: "×2 XP",
    icon: <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 2 L11.5 7 L17 7 L12.5 10 L14 15.5 L10 12.5 L6 15.5 L7.5 10 L3 7 L8.5 7 Z" fill="#f3c25a" /></svg>,
  },
  {
    label: "Усі 5 регіонів",
    icon: <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M3 4 L7 2 L13 5 L17 3 L17 16 L13 18 L7 15 L3 17 Z" fill="#4fbf83" stroke="#2d8f5e" strokeWidth=".8" strokeLinejoin="round" /><line x1="7" y1="2" x2="7" y2="15" stroke="#2d8f5e" strokeWidth=".8" /><line x1="13" y1="5" x2="13" y2="18" stroke="#2d8f5e" strokeWidth=".8" /></svg>,
  },
  {
    label: "+100 / міс",
    icon: <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M5 4 L15 4 L18 8 L10 17 L2 8 Z" fill="#4cc4d6" stroke="#1f8fa6" strokeWidth=".8" /><line x1="2" y1="8" x2="18" y2="8" stroke="#1f8fa6" strokeWidth=".6" /></svg>,
  },
  {
    label: "Без реклами",
    icon: <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><circle cx="10" cy="10" r="7.5" stroke="#e35d72" strokeWidth="1.5" fill="none" /><line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke="#e35d72" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    label: "AI-розбір",
    icon: <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><circle cx="10" cy="10" r="6" fill="#7d6fd1" opacity=".2" stroke="#7d6fd1" strokeWidth="1" /><circle cx="10" cy="7" r="1.5" fill="#7d6fd1" /><path d="M7 12.5 C7 10.5 13 10.5 13 12.5" stroke="#7d6fd1" strokeWidth="1.2" strokeLinecap="round" fill="none" /><path d="M6 10 C4 8 3 5 5 4" stroke="#7d6fd1" strokeWidth=".8" strokeLinecap="round" fill="none" /><path d="M14 10 C16 8 17 5 15 4" stroke="#7d6fd1" strokeWidth=".8" strokeLinecap="round" fill="none" /></svg>,
  },
];

// compact round theme toggle (light ⇄ dark), lives in the identity banner corner
function ProfileThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      className="ptheme"
      aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const router = useRouter();
  const { user, fetchMe, restoreStreak, logout } = useAuthStore();
  const [isRestoringStreak, setIsRestoringStreak] = useState(false);
  const [achievements, setAchievements] = useState<
    { id: string; title: string; tier: AchievementTier; condition_type: AchievementConditionType; unlocked: boolean; user_progress: number }[]
  >([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  useEffect(() => {
    fetchMe().catch(() => {});
    achievementsApi
      .list()
      .then(setAchievements)
      .catch(() => {})
      .finally(() => setAchievementsLoading(false));
  }, [fetchMe]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  async function handleRestoreStreak() {
    setIsRestoringStreak(true);
    try {
      await restoreStreak();
      toast.success("Серію відновлено! 🔥");
    } catch {
      toast.error("Не вдалося відновити серію");
    } finally {
      setIsRestoringStreak(false);
    }
  }

  if (!user) return null;

  const displayName = user.nickname ?? user.email;
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const expPercent = Math.min(100, Math.round((user.exp / user.exp_to_next_level) * 100));
  const providerLabel = AUTH_PROVIDER_LABEL[user.auth_provider] ?? user.auth_provider;
  const canRestoreStreak = user.lost_streak_days > 0 && user.gems >= 50;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return b.user_progress - a.user_progress;
  });

  return (
    <div className="profile-page relative min-h-screen text-text-primary">
      {/* Shared app HUD (mirrors home) */}
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
            <StatChip type="streak" value={user.streak_days} size="md" />
            <StatChip type="energy" value={user.energy}      size="md" />
            <StatChip type="gems"   value={user.gems}        size="md" />
            <StatChip type="xp"     value={user.exp}         size="md" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-4 pb-32 pt-6 md:px-6">
        <div className="profile-view stagger">

          {/* IDENTITY BANNER */}
          <div className="glass pbanner rounded-2xl">
            <ProfileThemeToggle />
            <button
              type="button"
              onClick={() => router.push("/avatar")}
              className="pav"
              aria-label="Змінити аватар"
            >
              {avatarLetter}
              <span className="lv">{user.level}</span>
            </button>
            <div className="pb-mid">
              <h2>@{displayName}</h2>
              <div className="mail">{user.email}</div>
              <div className="lvl-chip">★ Рівень {user.level} · {rankTitle(user.level)}</div>
              <div className="pxp">
                <div className="row"><span>XP до рівня {user.level + 1}</span><span>{user.exp} / {user.exp_to_next_level}</span></div>
                <div className="track"><div className="fill" style={{ width: `${expPercent}%` }} /></div>
              </div>
            </div>
            <div className="pb-stats">
              <div className="qstat s-fire"><div className="qi">{IconFire}</div><div className="qt"><b>{user.streak_days}</b><span>днів поспіль</span></div></div>
              <div className="qstat s-gem"><div className="qi">{IconGem}</div><div className="qt"><b>{user.gems}</b><span>Кристали</span></div></div>
              <div className="qstat s-energy"><div className="qi">{IconEnergy}</div><div className="qt"><b>{user.energy}</b><span>Енергія</span></div></div>
            </div>
          </div>

          {/* RESTORE STREAK (preserved logic — shown only when applicable) */}
          {canRestoreStreak && (
            <div className="glass block rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="qi flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: "rgba(232,121,74,.16)" }}>{IconFire}</div>
                <div className="flex-1">
                  <p className="font-display text-sm font-700 text-text-primary">Відновити серію {user.lost_streak_days} днів?</p>
                  <p className="mt-0.5 font-body text-xs text-text-secondary">Коштує 50 кристалів. У вас є {user.gems}.</p>
                </div>
              </div>
              <Button size="sm" className="mt-3 w-full" loading={isRestoringStreak} onClick={handleRestoreStreak}>
                Відновити за 50 кристалів
              </Button>
            </div>
          )}

          {/* ACHIEVEMENTS */}
          <div className="glass block rounded-2xl">
            <div className="bt-row">
              <div className="bt">Досягнення</div>
              {!achievementsLoading && (
                <div className="bt-count">{unlockedCount} / {achievements.length} зібрано</div>
              )}
            </div>
            {achievementsLoading ? (
              <div className="ach-grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="medal">
                    <div className="disc" style={{ opacity: 0.5 }} />
                    <div className="mname">&nbsp;</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ach-grid">
                {sortedAchievements.map((ach) => (
                  <div key={ach.id} className={`medal ${TIER_RARITY[ach.tier]}${ach.unlocked ? "" : " locked"}`}>
                    <div className="disc">
                      {medalIcon(ach.condition_type)}
                      {!ach.unlocked && <span className="lockb">{IconLock}</span>}
                    </div>
                    <div className="mname">{ach.title}</div>
                    {ach.unlocked ? (
                      <div className="mval">Отримано</div>
                    ) : (
                      <div className="mprog"><i style={{ width: `${Math.min(100, Math.round(ach.user_progress))}%` }} /></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STATS + ACCOUNT */}
          <div className="two">
            <div className="glass block rounded-2xl">
              <div className="bt-row"><div className="bt">Статистика</div></div>
              <div className="tiles grid2">
                <div className="tile g"><div className="ti">{TileTrophy}</div><div className="tb"><small>Макс. серія</small><b>{user.best_streak_days} дн.</b></div></div>
                <div className="tile"><div className="ti">{TileStar}</div><div className="tb"><small>Всього XP</small><b>{user.exp} XP</b></div></div>
                <div className="tile v"><div className="ti">{TileCalendar}</div><div className="tb"><small>З нами з</small><b>{formatShort(user.date_joined)}</b></div></div>
                <div className="tile"><div className="ti">{TileActivity}</div><div className="tb"><small>Активність</small><b>{user.last_activity_date ? formatShort(user.last_activity_date) : "—"}</b></div></div>
              </div>
            </div>
            <div className="glass block rounded-2xl">
              <div className="bt-row"><div className="bt">Акаунт</div></div>
              <div className="tiles">
                <div className="tile"><div className="ti">{TileMail}</div><div className="tb" style={{ minWidth: 0, flex: 1 }}><small>Email</small><b>{user.email}</b></div>{user.is_email_verified && <span className="tag" style={{ flex: "0 0 auto", marginLeft: "auto" }}>✓</span>}</div>
                <div className="tile g"><div className="ti">{TileLogin}</div><div className="tb"><small>Метод входу</small><b>{providerLabel}</b></div></div>
                <div className="tile v"><div className="ti">{TileGlobe}</div><div className="tb"><small>Мова інтерфейсу</small><b>Українська</b></div></div>
                <div className="tile r"><div className="ti">{TileBell}</div><div className="tb"><small>Сповіщення</small><b>Увімкнено</b></div></div>
              </div>
            </div>
          </div>

          {/* ROYAL PASS */}
          <div className="royal">
            <div className="rinner">
              <span className="r-ribbon">АКЦІЯ −40%</span>
              <div className="r-sheen" />
              <span className="r-spark" style={{ width: 5, height: 5, top: 22, left: "74%" }} />
              <span className="r-spark" style={{ width: 4, height: 4, top: 118, left: "30%", animationDelay: "2s" }} />
              <span className="r-spark" style={{ width: 3, height: 3, top: 176, left: "66%", animationDelay: "1s" }} />
              <div className="r-head">
                <div className="r-crown" style={{ width: 48, height: 38 }}>{RoyalCrown}</div>
                <div><div className="r-eye">NMT Premium</div><h3>Royal Pass</h3></div>
              </div>
              <div className="stickers">
                {STICKERS.map((s) => (
                  <span className="st" key={s.label}><span className="ic">{s.icon}</span> {s.label}</span>
                ))}
              </div>
              <div className="r-footer">
                <div className="pricebox">
                  <span className="now">99 ₴<small>/міс</small></span>
                  <span className="old">165 ₴</span>
                  <span className="save">−40%</span>
                </div>
                <button className="r-go" onClick={() => router.push("/subscription")}><span className="gs" /> Розблокувати →</button>
              </div>
              <div className="r-note">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }}><rect x="2" y="8" width="16" height="10" rx="2" fill="#ef9aa8" /><rect x="2" y="8" width="16" height="4" rx="1" fill="#e35d72" /><rect x="9" y="8" width="2" height="10" fill="#e35d72" /><path d="M10 8 C10 8 7 6 7 4 C7 3 8 2 9 3 C9.5 4 10 6 10 8Z" fill="#ef9aa8" /><path d="M10 8 C10 8 13 6 13 4 C13 3 12 2 11 3 C10.5 4 10 6 10 8Z" fill="#ef9aa8" /></svg>
                {" "}<b>7 днів безкоштовно</b> · скасуй будь-коли
              </div>
            </div>
          </div>

          <button className="logout" onClick={handleLogout}>Вийти з акаунту</button>
        </div>
      </main>
    </div>
  );
}
