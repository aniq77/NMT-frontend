"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
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
import { useAuthStore } from "@/store/auth.store";
import { paymentApi, type Pricing, type Subscription } from "@/lib/api/payment";
import { ApiError } from "@/lib/api/client";

const FEATURES = [
  { icon: <BookOpen className="h-5 w-5 text-primary" />, text: "Необмежений доступ до всіх курсів" },
  { icon: <Zap       className="h-5 w-5 text-reward"  />, text: "Подвійний множник XP на уроках" },
  { icon: <Flame     className="h-5 w-5 text-reward"  />, text: "Захист серії при пропущеному дні" },
  { icon: <Gem       className="h-5 w-5 text-primary" />, text: "50 кристалів щомісяця" },
  { icon: <Crown     className="h-5 w-5 text-reward"  />, text: "Значок Premium у рейтингу" },
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    paymentApi.getPricing().then(setPricing).catch(() => {});
    paymentApi.getSubscription()
      .then(setSubscription)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setSubscription({ id: "", status: "inactive", is_active: false, started_at: null, expires_at: null, cancelled_at: null });
        }
      });
  }, []);

  async function handleSubscribe() {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await paymentApi.createInvoice();
      sessionStorage.setItem("payment_invoice_id", data.invoice_id);
      window.location.href = data.page_url;
    } catch (err) {
      const msg = err instanceof ApiError
        ? (err.data?.detail as string | undefined) ?? "Помилка при створенні платежу"
        : "Щось пішло не так. Спробуйте ще раз.";
      setError(msg);
      setLoading(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setError("");
    try {
      const updated = await paymentApi.cancelSubscription();
      setSubscription(updated);
    } catch {
      setError("Не вдалося скасувати підписку. Спробуйте ще раз.");
    } finally {
      setCancelling(false);
    }
  }

  const priceUah = pricing?.price_uah ?? 199;
  const isActive = subscription?.is_active === true;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-app items-center px-4 py-3">
          <h1 className="font-display text-base font-700 text-text-primary">Підписка</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">

        {/* Hero */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-button">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-2 font-display text-2xl font-800 text-text-primary">Premium</h2>
          <p className="font-body text-base text-text-secondary">
            Розблокуй повний потенціал підготовки до НМТ
          </p>
        </div>

        {/* Active subscription banner */}
        {isActive && (
          <div className="mb-4 rounded-xl border border-correct/30 bg-correct-light p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 shrink-0 text-correct-dark" />
              <div className="flex-1">
                <p className="font-display text-sm font-700 text-correct-dark">Premium активний</p>
                {subscription?.expires_at && (
                  <p className="mt-0.5 font-body text-xs text-correct-dark/80">
                    Діє до {formatDate(subscription.expires_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plan card */}
        <div className="overflow-hidden rounded-2xl border-2 border-primary bg-surface shadow-card">
          {/* Price header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-5 text-center">
            <p className="font-display text-sm font-600 uppercase tracking-widest text-white/70">
              Місячна підписка
            </p>
            <div className="mt-2 flex items-end justify-center gap-1">
              <span className="font-display text-5xl font-800 text-white">
                {Math.round(priceUah)}
              </span>
              <div className="mb-1.5 text-left">
                <span className="block font-display text-xl font-600 text-white/90">₴</span>
                <span className="block font-display text-xs font-600 text-white/70">/ місяць</span>
              </div>
            </div>
            <p className="mt-1.5 font-display text-xs font-600 text-white/60">
              Можна скасувати в будь-який момент
            </p>
          </div>

          {/* Features */}
          <div className="divide-y divide-border">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <span className="shrink-0">{f.icon}</span>
                <span className="font-body text-sm text-text-primary">{f.text}</span>
                <BadgeCheck className="ml-auto h-4 w-4 shrink-0 text-correct" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-5 pb-5 pt-4">
            {error && (
              <p className="mb-3 rounded-lg bg-wrong-light px-4 py-2.5 font-body text-sm text-wrong-dark">
                {error}
              </p>
            )}
            {isActive ? (
              <>
                <p className="mb-3 text-center font-body text-sm text-text-secondary">
                  Підписка активна. Ви можете скасувати її нижче.
                </p>
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full text-wrong hover:bg-wrong-light"
                  loading={cancelling}
                  onClick={handleCancel}
                >
                  Скасувати підписку
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                className="w-full"
                loading={loading}
                onClick={handleSubscribe}
              >
                <span className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5" />
                  Купити підписку
                </span>
              </Button>
            )}
            <div className="mt-3 flex items-center justify-center gap-2 text-text-secondary">
              <Lock className="h-3.5 w-3.5" />
              <span className="font-body text-xs">Захищена оплата через Monobank</span>
              <Shield className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-6 space-y-3">
          <p className="font-display text-sm font-700 uppercase tracking-widest text-text-secondary">
            Часті запитання
          </p>
          {[
            {
              q: "Як скасувати підписку?",
              a: "Скасувати підписку можна в будь-який момент у налаштуваннях профілю. Доступ зберігається до кінця оплаченого місяця.",
            },
            {
              q: "Як відбувається оплата?",
              a: "Оплата проходить через захищений платіжний шлюз Monobank. Картка зберігається для автоматичного списання щомісяця.",
            },
            {
              q: "Чи є безкоштовний пробний період?",
              a: "Перший тиждень безкоштовно — введи картку та спробуй всі функції Premium без оплати.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-display text-sm font-700 text-text-primary">{item.q}</p>
              <p className="mt-1.5 font-body text-sm text-text-secondary">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
