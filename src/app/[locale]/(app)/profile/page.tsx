"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/types/auth";

const PROVIDER_LABEL: Record<User["auth_provider"], string> = {
  email: "Пошта",
  google: "Google",
  phone: "Телефон",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, fetchMe, restoreStreak, logout } = useAuthStore();
  const [isRestoring, setIsRestoring] = useState(false);
  const [streakError, setStreakError] = useState("");

  useEffect(() => {
    fetchMe().catch(() => {});
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

  return (
    <section className="view active">
      <div className="profile-wrap">
        {/* IDENTITY BANNER */}
        <div className="glass pbanner">
          <div className="pav">{initial}<span className="lv">{user.level}</span></div>
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

        {/* ACHIEVEMENTS — статичні, доки їх немає в базі */}
        <div className="glass block">
          <div className="bt-row"><div className="bt">Досягнення</div><div className="bt-count">4 / 12 зібрано</div></div>
          <div className="ach-grid">
            <div className="medal r-common"><div className="disc"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><path d="M24 6 L28 18 L41 18 L31 26 L35 38 L24 30 L13 38 L17 26 L7 18 L20 18 Z" fill="#f3c25a" stroke="#c9952a" strokeWidth="1.2" /></svg></div><div className="mname">Перший крок</div><div className="mval">Отримано</div></div>
            <div className="medal r-rare"><div className="disc"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%">
              <path d="M24 6 C24 6 12 14 12 26 C12 33 17 39 24 39 C31 39 36 33 36 26 C36 22 34 18 34 18 C34 23 29 25 29 19 C29 11 24 6 24 6Z" fill="#ff8a4c" stroke="#e8602c" strokeWidth="1" strokeLinejoin="round" />
              <path d="M24 18 C24 18 19 24 19 30 C19 33.5 21 36 24 36 C27 36 29 33.5 29 30 C29 27 27 25 27 25 C27 27.5 24 28.5 24 26 C24 23 24 18 24 18Z" fill="#ffd23c" />
            </svg></div><div className="mname">Серія 2 дні</div><div className="mval">Отримано</div></div>
            <div className="medal r-common"><div className="disc"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><rect x="10" y="14" width="10" height="22" rx="2" fill="#6fa8dc" /><rect x="22" y="10" width="10" height="26" rx="2" fill="#4a7fc1" /><rect x="34" y="16" width="8" height="20" rx="2" fill="#89c4e8" /></svg></div><div className="mname">Книжковий хробак</div><div className="mval">Отримано</div></div>
            <div className="medal r-epic"><div className="disc"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><circle cx="24" cy="24" r="18" stroke="#4a7fc1" strokeWidth="2" fill="rgba(208,232,248,.2)" /><path d="M24 12 L27 22 L24 20 L21 22 Z" fill="#e8794a" /><path d="M24 36 L21 26 L24 28 L27 26 Z" fill="#4a7fc1" /><circle cx="24" cy="24" r="2.5" fill="#fff" stroke="#4a7fc1" strokeWidth="1" /></svg></div><div className="mname">Дослідник</div><div className="mval">Отримано</div></div>
            <div className="medal locked r-rare"><div className="disc"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><path d="M28 6 L14 26 L22 26 L18 44 L36 20 L27 20 Z" fill="#ffe08a" /></svg><span className="lockb">🔐</span></div><div className="mname">500 XP</div><div className="mprog"><i style={{ width: "30%" }} /></div></div>
            <div className="medal locked r-epic"><div className="disc"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><path d="M14 10 L34 10 L34 26 C34 32 29 36 24 36 C19 36 14 32 14 26 Z" fill="#f3c25a" /><rect x="20" y="36" width="8" height="5" fill="#e8ab30" /><rect x="14" y="41" width="20" height="4" rx="2" fill="#c9952a" /></svg><span className="lockb">🔐</span></div><div className="mname">Чемпіон тижня</div><div className="mprog"><i style={{ width: "45%" }} /></div></div>
            <div className="medal locked r-rare"><div className="disc"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><ellipse cx="24" cy="26" rx="12" ry="14" fill="#8b6f47" /><circle cx="20" cy="22" r="4" fill="#fff" /><circle cx="28" cy="22" r="4" fill="#fff" /><circle cx="20" cy="23" r="2.5" fill="#2c1a0e" /><circle cx="28" cy="23" r="2.5" fill="#2c1a0e" /></svg><span className="lockb">🔐</span></div><div className="mname">Нічна сова</div><div className="mprog"><i style={{ width: "20%" }} /></div></div>
            <div className="medal locked r-legend"><div className="disc"><svg viewBox="0 0 48 48" fill="none" width="100%" height="100%"><ellipse cx="24" cy="28" rx="12" ry="14" fill="#5a9e6f" /><circle cx="20" cy="22" r="3.5" fill="#fff" /><circle cx="28" cy="22" r="3.5" fill="#fff" /><circle cx="20" cy="23" r="2" fill="#1a3a28" /><circle cx="28" cy="23" r="2" fill="#1a3a28" /></svg><span className="lockb">🔐</span></div><div className="mname">Легенда НМТ</div><div className="mprog"><i style={{ width: "8%" }} /></div></div>
          </div>
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
