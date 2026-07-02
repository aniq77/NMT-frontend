"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import {
  Calendar,
  CalendarDays,
  Check,
  ChevronRight,
  Crown,
  Flame,
  Gem,
  Globe,
  Mail,
  Pencil,
  Smartphone,
  Star,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { SkinIcon, hasSkinIcon } from "@/components/ui/SkinIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import { achievementsApi } from "@/lib/api/achievements";
import type { User } from "@/types/auth";
import type { Achievement, AchievementTier } from "@/types/achievements";

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

const AUTH_PROVIDER_LABELS: Record<User["auth_provider"], { label: string; icon: React.ReactNode }> = {
  email:  { label: "Пошта",   icon: <Mail       className="h-5 w-5 text-text-secondary" /> },
  google: { label: "Google",  icon: <Globe      className="h-5 w-5 text-text-secondary" /> },
  phone:  { label: "Телефон", icon: <Smartphone className="h-5 w-5 text-text-secondary" /> },
};

const TIER_DOT: Record<AchievementTier, string> = {
  platinum: "bg-violet-500",
  gold:     "bg-reward",
  silver:   "bg-slate-400",
  bronze:   "bg-orange-500",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-display text-sm font-700 uppercase tracking-widest text-primary">
          {title}
        </h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  verified,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  verified?: boolean | null;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="font-display text-xs font-600 text-text-secondary">{label}</p>
        <p className="mt-0.5 truncate font-body text-sm text-text-primary">{value}</p>
      </div>
      {verified !== undefined && verified !== null && (
        <Tag
          size="xs"
          variant={verified ? "correct" : "wrong"}
          icon={verified ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        >
          {verified ? "Підтверджено" : "Не підтверджено"}
        </Tag>
      )}
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass-soft flex flex-col items-center gap-1 rounded-2xl px-3 py-3 text-center">
      {icon}
      <span className="font-display text-md font-700 text-text-primary tabular-nums">{value}</span>
      <span className="font-display text-xs font-600 text-text-secondary">{label}</span>
    </div>
  );
}

function UnlockedAchievementsSection({
  achievements,
  loading,
  onViewAll,
}: {
  achievements: Achievement[];
  loading: boolean;
  onViewAll: () => void;
}) {
  const unlocked = achievements.filter((a) => a.unlocked);

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-display text-sm font-700 uppercase tracking-widest text-primary">Досягнення</h2>
        {!loading && (
          <span className="font-display text-xs font-600 text-text-secondary tabular-nums">
            {unlocked.length}/{achievements.length}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="divide-y divide-border">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-border" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-border" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && unlocked.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
          <Trophy className="h-7 w-7 text-text-secondary/40" />
          <p className="font-body text-sm text-text-secondary">Ще немає нагород</p>
          <p className="font-body text-xs text-text-secondary/70">Завершіть урок, щоб отримати першу</p>
        </div>
      )}

      {/* Unlocked list */}
      {!loading && unlocked.length > 0 && (
        <div className="divide-y divide-border">
          {unlocked.map((ach) => (
            <div key={ach.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${TIER_DOT[ach.tier]}`} />
              <p className="flex-1 font-display text-sm font-600 text-text-primary">{ach.title}</p>
              <Check className="h-4 w-4 shrink-0 text-correct" />
            </div>
          ))}
        </div>
      )}

      {/* Footer link */}
      {!loading && (
        <button
          onClick={onViewAll}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-3 font-display text-sm font-600 text-primary hover:bg-primary/5 transition-colors"
        >
          Всі досягнення <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const router = useRouter();
  const { user, fetchMe, restoreStreak, logout } = useAuthStore();
  const [isRestoringStreak, setIsRestoringStreak] = useState(false);
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
    setIsRestoringStreak(true);
    setStreakError("");
    try {
      await restoreStreak();
      toast.success("Серію відновлено! 🔥");
    } catch {
      setStreakError("Не вдалося відновити серію. Спробуйте ще раз.");
      toast.error("Не вдалося відновити серію");
    } finally {
      setIsRestoringStreak(false);
    }
  }

  if (!user) return null;

  const expPercent = Math.round((user.exp / user.exp_to_next_level) * 100);
  const provider = AUTH_PROVIDER_LABELS[user.auth_provider];
  const canRestoreStreak = user.lost_streak_days > 0 && user.gems >= 50;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-app items-center px-4 py-3">
          <h1 className="font-display text-base font-800 text-primary-dark">Профіль</h1>
        </div>
      </header>

      <main className="stagger mx-auto max-w-app space-y-4 px-4 py-6">

        {/* Hero */}
        <div className="glass flex flex-col items-center gap-3 rounded-2xl py-6">
          <button
            onClick={() => router.push("/avatar")}
            className="relative transition-transform hover:scale-[1.04] active:scale-[0.97]"
            aria-label="Змінити аватар"
          >
            <Avatar
              name={user.nickname ?? undefined}
              level={user.level}
              size="lg"
              gradient={user.equipped_skin?.gradient}
              icon={
                user.equipped_skin && hasSkinIcon(user.equipped_skin.code)
                  ? <SkinIcon code={user.equipped_skin.code} className="h-8 w-8" />
                  : undefined
              }
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-canvas bg-primary shadow-soft">
              <Pencil className="h-2.5 w-2.5 text-white" />
            </span>
          </button>
          <div className="text-center">
            <h2 className="font-display text-lg font-700 text-text-primary">@{user.nickname ?? user.email}</h2>
            <p className="mt-0.5 font-body text-sm text-text-secondary">{user.email}</p>
          </div>
          <Tag variant="primary" icon={<Star className="h-3.5 w-3.5" />}>Рівень {user.level}</Tag>

          <div className="mt-1 w-full px-6">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-display text-xs font-600 text-text-secondary">XP до рівня {user.level + 1}</span>
              <span className="font-display text-xs font-700 text-primary tabular-nums">
                {user.exp.toLocaleString("uk")} / {user.exp_to_next_level.toLocaleString("uk")}
              </span>
            </div>
            <ProgressBar value={expPercent} size="md" color="reward" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox icon={<Flame  className="h-7 w-7 text-reward"       />} label="Серія"    value={`${user.streak_days}д`} />
          <StatBox icon={<Gem    className="h-7 w-7 text-primary-dark" />} label="Кристали" value={user.gems} />
          <StatBox icon={<Trophy className="h-7 w-7 text-reward-dark"  />} label="Нагороди" value={user.unlocked_achievement_count} />
        </div>

        {/* Restore streak */}
        {canRestoreStreak && (
          <div className="rounded-2xl border border-reward/40 bg-reward-light p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <Flame className="mt-0.5 h-5 w-5 shrink-0 text-reward-dark" />
              <div className="flex-1">
                <p className="font-display text-sm font-700 text-reward-dark">
                  Відновити серію {user.lost_streak_days} днів?
                </p>
                <p className="mt-0.5 font-body text-xs text-reward-dark/80">
                  Коштує 50 кристалів. У вас є {user.gems}.
                </p>
                {streakError && (
                  <p className="mt-1 font-body text-xs text-wrong-dark">{streakError}</p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              className="mt-3 w-full"
              loading={isRestoringStreak}
              onClick={handleRestoreStreak}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Gem className="h-3.5 w-3.5" /> Відновити за 50 кристалів
              </span>
            </Button>
          </div>
        )}

        {/* Achievements */}
        <UnlockedAchievementsSection
          achievements={achievements}
          loading={achievementsLoading}
          onViewAll={() => router.push("/achievements")}
        />

        {/* Stats */}
        <SectionCard title="Статистика">
          <InfoRow icon={<Flame        className="h-5 w-5 text-reward-dark"    />} label="Максимальна серія"   value={`${user.best_streak_days} днів`} />
          <InfoRow icon={<Zap          className="h-5 w-5 text-reward"         />} label="Всього XP"           value={`${user.exp.toLocaleString("uk")} XP`} />
          <InfoRow icon={<Calendar     className="h-5 w-5 text-text-secondary" />} label="Приєднався"          value={formatDate(user.date_joined)} />
          {user.last_activity_date && (
            <InfoRow icon={<CalendarDays className="h-5 w-5 text-text-secondary" />} label="Остання активність" value={formatDate(user.last_activity_date)} />
          )}
        </SectionCard>

        {/* Account */}
        <SectionCard title="Акаунт">
          <InfoRow
            icon={<Mail className="h-5 w-5 text-text-secondary" />}
            label="Email"
            value={user.email}
            verified={user.is_email_verified}
          />
          <InfoRow
            icon={provider.icon}
            label="Метод входу"
            value={provider.label}
          />
        </SectionCard>

        {/* Subscription */}
        <button
          type="button"
          onClick={() => router.push("/subscription")}
          className="glass ring-glow lift flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--grad-reward)] shadow-button">
            <Crown className="h-5 w-5 text-[#5a3a00]" />
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-700 text-text-primary">Premium підписка</p>
            <p className="font-body text-xs text-text-secondary">Розблокуй усі функції — 99 ₴ / місяць</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-text-secondary" />
        </button>

        {/* Appearance */}
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-3.5">
          <p className="font-display text-sm font-700 text-text-primary">Тема</p>
          <ThemeToggle />
        </div>

        {/* Logout */}
        <div className="pb-4 pt-2">
          <Button
            variant="ghost"
            size="lg"
            className="w-full text-wrong hover:bg-wrong-light"
            onClick={handleLogout}
          >
            Вийти з акаунту
          </Button>
        </div>
      </main>
    </div>
  );
}
