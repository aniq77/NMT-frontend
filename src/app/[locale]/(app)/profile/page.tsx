"use client";
import { useRouter } from "@/lib/navigation";
import {
  Calendar,
  CalendarDays,
  Check,
  Flame,
  Gem,
  Globe,
  Heart,
  Mail,
  Smartphone,
  Star,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatChip } from "@/components/ui/StatChip";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { withToken } from "@/lib/dev";
import { cn } from "@/lib/utils";
import type { User } from "@/types/auth";

const MOCK_USER: User = {
  id: 1,
  username: "yurii.arutiunov",
  email: "yurii.arutiunov@skelar.tech",
  phone: "+380991234567",
  custom_avatar_url: null,
  auth_provider: "email",
  xp: 1250,
  xp_to_next_level: 2000,
  level: 7,
  gems: 83,
  lives: 5,
  streak_days: 14,
  max_streak: 21,
  last_activity_date: "2026-05-16",
  hearts_refill_at: null,
  is_email_verified: true,
  is_phone_verified: false,
  date_joined: "2026-03-01",
};

const AUTH_PROVIDER_LABELS: Record<User["auth_provider"], { label: string; icon: React.ReactNode }> = {
  email:  { label: "Пошта",   icon: <Mail       className="h-5 w-5 text-text-secondary" /> },
  google: { label: "Google",  icon: <Globe      className="h-5 w-5 text-text-secondary" /> },
  phone:  { label: "Телефон", icon: <Smartphone className="h-5 w-5 text-text-secondary" /> },
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-display text-sm font-700 uppercase tracking-widest text-text-secondary">
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
          icon={verified
            ? <Check className="h-3 w-3" />
            : <X    className="h-3 w-3" />
          }
        >
          {verified ? "Підтверджено" : "Не підтверджено"}
        </Tag>
      )}
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-alt px-3 py-3 text-center">
      {icon}
      <span className="font-display text-md font-700 text-text-primary tabular-nums">{value}</span>
      <span className="font-display text-xs font-600 text-text-secondary">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const user = MOCK_USER;
  const xpPercent = Math.round((user.xp / user.xp_to_next_level) * 100);
  const provider = AUTH_PROVIDER_LABELS[user.auth_provider];

  function handleLogout() {
    router.push(withToken("/login"));
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-app items-center px-4 py-3">
          <h1 className="font-display text-base font-700 text-text-primary">Профіль</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app space-y-4 px-4 py-6">

        {/* Hero */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface py-6 shadow-card">
          <Avatar
            src={user.custom_avatar_url ?? undefined}
            name={user.username}
            level={user.level}
            size="lg"
          />
          <div className="text-center">
            <h2 className="font-display text-lg font-700 text-text-primary">@{user.username}</h2>
            <p className="mt-0.5 font-body text-sm text-text-secondary">{user.email}</p>
          </div>
          <Tag variant="primary" icon={<Star className="h-3.5 w-3.5" />}>Рівень {user.level}</Tag>

          <div className="mt-1 w-full px-6">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-display text-xs font-600 text-text-secondary">XP до рівня {user.level + 1}</span>
              <span className="font-display text-xs font-700 text-primary tabular-nums">
                {user.xp.toLocaleString("uk")} / {user.xp_to_next_level.toLocaleString("uk")}
              </span>
            </div>
            <ProgressBar value={xpPercent} size="md" color="reward" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox icon={<Flame className="h-7 w-7 text-reward"        />} label="Серія"     value={`${user.streak_days}д`} />
          <StatBox icon={<Gem   className="h-7 w-7 text-primary-dark"  />} label="Кристали"  value={user.gems} />
          <StatBox icon={<Heart className="h-7 w-7 text-wrong"         />} label="Серця"     value={`${user.lives}/5`} />
        </div>

        {/* Achievements */}
        <SectionCard title="Досягнення">
          <InfoRow icon={<Trophy      className="h-5 w-5 text-reward-dark"  />} label="Максимальна серія"    value={`${user.max_streak ?? 0} днів`} />
          <InfoRow icon={<Zap         className="h-5 w-5 text-reward"       />} label="Всього XP"            value={`${user.xp.toLocaleString("uk")} XP`} />
          <InfoRow icon={<Calendar    className="h-5 w-5 text-text-secondary" />} label="Приєднався"          value={formatDate(user.date_joined)} />
          <InfoRow icon={<CalendarDays className="h-5 w-5 text-text-secondary" />} label="Остання активність" value={formatDate(user.last_activity_date)} />
        </SectionCard>

        {/* Account */}
        <SectionCard title="Акаунт">
          <InfoRow
            icon={<Mail className="h-5 w-5 text-text-secondary" />}
            label="Email"
            value={user.email}
            verified={user.is_email_verified}
          />
          {user.phone && (
            <InfoRow
              icon={<Smartphone className="h-5 w-5 text-text-secondary" />}
              label="Телефон"
              value={user.phone}
              verified={user.is_phone_verified}
            />
          )}
          <InfoRow
            icon={provider.icon}
            label="Метод входу"
            value={provider.label}
          />
        </SectionCard>

        {/* Hearts refill */}
        {user.lives < 5 && user.hearts_refill_at && (
          <div className="flex items-center gap-3 rounded-xl border border-wrong-light bg-wrong-light px-4 py-3">
            <Heart className="h-6 w-6 shrink-0 text-wrong" />
            <div>
              <p className="font-display text-sm font-700 text-wrong-dark">Серця поповнюються</p>
              <p className="font-body text-xs text-wrong-dark/80">
                Наступне серце о {new Date(user.hearts_refill_at).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        )}

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
