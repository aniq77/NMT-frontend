"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import { TempThemeToggle } from "@/components/ui/TempThemeToggle";
import { SkinIcon, hasSkinIcon } from "@/components/ui/SkinIcon";
import { achievementsApi } from "@/lib/api/achievements";
import type { User } from "@/types/auth";
import type { Achievement, AchievementTier } from "@/types/achievements";

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

const TIER_ICON: Record<AchievementTier, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, fetchMe, restoreStreak, logout } = useAuthStore();
  const [isRestoring, setIsRestoring] = useState(false);
  const [streakError, setStreakError] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
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

  if (!user) return null;

  const expPercent = Math.round((user.exp / Math.max(user.exp_to_next_level, 1)) * 100);
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
                <span>{user.exp.toLocaleString("uk")} / {user.exp_to_next_level.toLocaleString("uk")}</span>
              </div>
              <div className="track"><div className="fill" style={{ width: `${expPercent}%` }} /></div>
            </div>
          </div>
          <div className="pb-stats">
            <div className="qstat s-fire"><div className="qi"><svg viewBox="0 0 32 32" fill="none" width="20" height="20"><path d="M16 3 C16 3 9 9 9 17 C9 22 12 26 16 26 C20 26 23 22 23 17 C23 15 22 13 22 13 C22 16 19 17 19 14 C19 9 16 3 16 3Z" fill="#ff8a4c" stroke="#e8602c" strokeWidth=".8" strokeLinejoin="round" /><path d="M16 12 C16 12 13 16 13 20 C13 22.5 14.5 24 16 24 C17.5 24 19 22.5 19 20 C19 18 17.5 17 17.5 17 C17.5 18.5 16 19 16 17.5 C16 16 16 12 16 12Z" fill="#ffd23c" /></svg></div><div className="qt"><b>{user.streak_days}</b><span>днів поспіль</span></div></div>
            <div className="qstat s-gem"><div className="qi"><svg viewBox="0 0 28 28" fill="none" width="20" height="20"><path d="M8 6 L20 6 L24 11 L14 23 L4 11 Z" fill="#4cc4d6" stroke="#1f8fa6" strokeWidth="1" /><path d="M4 11 L24 11" stroke="#1f8fa6" strokeWidth=".8" /><path d="M8 6 L11 11 M20 6 L17 11 M14 23 L14 11" stroke="#fff" strokeWidth=".8" opacity=".5" /></svg></div><div className="qt"><b>{user.gems}</b><span>Кристали</span></div></div>
            <div className="qstat s-energy"><div className="qi">⚡</div><div className="qt"><b>{user.energy}</b><span>Енергія</span></div></div>
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
            <p className="sec-sub" style={{ textAlign: "center", margin: 0 }}>Ще немає досягнень 🌙</p>
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
                      {TIER_ICON[ach.tier]}
                      {!ach.unlocked && <span className="lockb">🔐</span>}
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
              {isRestoring ? "Відновлення…" : "💎 Відновити за 50 кристалів"}
            </button>
          </div>
        )}

        {/* STATS + ACCOUNT */}
        <div className="two">
          <div className="glass block">
            <div className="bt-row"><div className="bt">Статистика</div></div>
            <div className="tiles grid2">
              <div className="tile g"><div className="ti">🏆</div><div className="tb"><small>Макс. серія</small><b>{user.best_streak_days} дн.</b></div></div>
              <div className="tile"><div className="ti">⚡</div><div className="tb"><small>Всього XP</small><b>{user.exp.toLocaleString("uk")} XP</b></div></div>
              <div className="tile v"><div className="ti">📅</div><div className="tb"><small>З нами з</small><b>{formatDate(user.date_joined)}</b></div></div>
              {user.last_activity_date && (
                <div className="tile"><div className="ti">🧭</div><div className="tb"><small>Активність</small><b>{formatDate(user.last_activity_date)}</b></div></div>
              )}
            </div>
          </div>
          <div className="glass block">
            <div className="bt-row"><div className="bt">Акаунт</div></div>
            <div className="tiles">
              <div className="tile"><div className="ti">✉️</div><div className="tb"><small>Email</small><b>{user.email}</b></div>{user.is_email_verified && <span className="tag">✓</span>}</div>
              <div className="tile g"><div className="ti">🔑</div><div className="tb"><small>Метод входу</small><b>{PROVIDER_LABEL[user.auth_provider]}</b></div></div>
              <div className="tile v"><div className="ti">🌐</div><div className="tb"><small>Мова інтерфейсу</small><b>Українська</b></div></div>
              <div className="tile r"><div className="ti">🔔</div><div className="tb"><small>Сповіщення</small><b>Увімкнено</b></div></div>
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
              <span className="st"><span className="ic">❤️</span> Безліміт сердець</span>
              <span className="st"><span className="ic">⚡</span> ×2 XP</span>
              <span className="st"><span className="ic">🗺️</span> Усі 5 регіонів</span>
              <span className="st"><span className="ic">💎</span> +500 / міс</span>
              <span className="st"><span className="ic">🚫</span> Без реклами</span>
              <span className="st"><span className="ic">🎯</span> AI-розбір</span>
            </div>
            <div className="r-footer">
              <div className="pricebox">
                <span className="now">99 ₴<small>/міс</small></span>
                <span className="old">165 ₴</span>
                <span className="save">−40%</span>
              </div>
              <button className="r-go" onClick={() => router.push("/subscription")}><span className="gs" /> Розблокувати →</button>
            </div>
            <div className="r-note">🎁 <b>7 днів безкоштовно</b> · скасуй будь-коли</div>
          </div>
        </div>

        <button className="logout" onClick={handleLogout}>Вийти з акаунту</button>
      </div>
    </section>
  );
}
