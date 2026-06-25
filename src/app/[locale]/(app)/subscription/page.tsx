"use client";
import {
  BadgeCheck,
  BookOpen,
  Crown,
  Flame,
  Gem,
  Lock,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/lib/navigation";

const FEATURES = [
  { icon: <BookOpen className="h-5 w-5 text-primary" />, text: "Необмежений доступ до всіх курсів" },
  { icon: <Zap       className="h-5 w-5 text-reward"  />, text: "Подвійний множник XP на уроках" },
  { icon: <Flame     className="h-5 w-5 text-reward"  />, text: "Захист серії при пропущеному дні" },
  { icon: <Gem       className="h-5 w-5 text-primary" />, text: "50 кристалів щомісяця" },
  { icon: <Crown     className="h-5 w-5 text-reward"  />, text: "Значок Premium у рейтингу" },
];

export default function SubscriptionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-app items-center px-4 py-3">
          <h1 className="font-display text-base font-700 text-text-primary">Підписка</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-button">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-2 font-display text-2xl font-800 text-text-primary">Premium</h2>
          <p className="font-body text-base text-text-secondary">
            Платежі поки що недоступні. Ми увімкнемо підписку після запуску backend payments API.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-primary bg-surface shadow-card">
          <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-5 text-center">
            <p className="font-display text-sm font-600 uppercase tracking-widest text-white/70">
              Скоро
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-white/90" />
              <span className="font-display text-3xl font-800 text-white">
                Підписка готується
              </span>
            </div>
            <p className="mt-1.5 font-display text-xs font-600 text-white/60">
              Оплату тимчасово вимкнено, щоб не викликати відсутні API endpoints.
            </p>
          </div>

          <div className="divide-y divide-border">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <span className="shrink-0">{f.icon}</span>
                <span className="font-body text-sm text-text-primary">{f.text}</span>
                <BadgeCheck className="ml-auto h-4 w-4 shrink-0 text-correct" />
              </div>
            ))}
          </div>

          <div className="px-5 pb-5 pt-4">
            <Button size="lg" className="w-full" disabled>
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-5 w-5" />
                Платежі скоро
              </span>
            </Button>
            <Button
              size="md"
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => router.push("/home")}
            >
              На головну
            </Button>
            <div className="mt-3 flex items-center justify-center gap-2 text-text-secondary">
              <Shield className="h-3.5 w-3.5" />
              <span className="font-body text-xs">Оплата буде доступна після backend integration</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
