"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { paymentApi } from "@/lib/api/payment";
import { ApiError } from "@/lib/api/client";

type PaymentStatus =
  | "loading"
  | "success"
  | "processing"
  | "failure"
  | "reversed"
  | "expired"
  | "error";

const STATUS_CONFIG: Record<
  Exclude<PaymentStatus, "loading">,
  { icon: React.ReactNode; title: string; body: string; color: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-20 w-20 text-correct" />,
    title: "Оплата успішна!",
    body: "Підписку активовано. Насолоджуйся повним доступом до всіх матеріалів.",
    color: "text-correct-dark",
  },
  processing: {
    icon: <Clock className="h-20 w-20 text-reward" />,
    title: "Обробляється...",
    body: "Платіж приймається банком. Це може зайняти кілька хвилин.",
    color: "text-reward-dark",
  },
  failure: {
    icon: <XCircle className="h-20 w-20 text-wrong" />,
    title: "Оплата не пройшла",
    body: "Платіж відхилено. Перевір дані картки та спробуй ще раз.",
    color: "text-wrong-dark",
  },
  reversed: {
    icon: <AlertCircle className="h-20 w-20 text-reward-dark" />,
    title: "Платіж скасовано",
    body: "Кошти повернуться на картку протягом 1–3 банківських днів.",
    color: "text-reward-dark",
  },
  expired: {
    icon: <Clock className="h-20 w-20 text-text-secondary" />,
    title: "Сесія закінчилась",
    body: "Час для оплати вийшов. Спробуй ще раз.",
    color: "text-text-secondary",
  },
  error: {
    icon: <AlertCircle className="h-20 w-20 text-wrong" />,
    title: "Помилка перевірки",
    body: "Не вдалось перевірити статус платежу. Зверніться до підтримки.",
    color: "text-wrong-dark",
  },
};

export default function PaymentResultPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>(() =>
    typeof window !== "undefined" && !sessionStorage.getItem("payment_invoice_id")
      ? "error"
      : "loading",
  );
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const invoiceId = sessionStorage.getItem("payment_invoice_id");
    if (!invoiceId) return;

    let cancelled = false;

    async function checkStatus() {
      if (pollCount >= 20) {
        setStatus("error");
        return;
      }
      try {
        const sub = await paymentApi.getSubscription();

        if (sub.is_active) {
          sessionStorage.removeItem("payment_invoice_id");
          setStatus("success");
          return;
        }

        // Still pending — keep polling
        if (!cancelled) {
          setPollCount((p) => p + 1);
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError) {
          if (err.status === 404) {
            // No subscription yet — keep polling
            setPollCount((p) => p + 1);
            return;
          }
          if (err.status === 402) {
            sessionStorage.removeItem("payment_invoice_id");
            setStatus("failure");
            return;
          }
        }
        setStatus("error");
      }
    }

    checkStatus();
    return () => { cancelled = true; };
  }, [pollCount]);

  // Re-poll every 3s
  useEffect(() => {
    if (status !== "loading" && status !== "processing") return;

    const id = setTimeout(() => setPollCount((p) => p + 1), 3000);
    return () => clearTimeout(id);
  }, [status, pollCount]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-display text-base font-600 text-text-secondary">
          Перевіряємо статус платежу...
        </p>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[status];
  const isSuccess = status === "success";
  const canRetry = status === "failure" || status === "expired" || status === "error";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <div className="mx-auto w-full max-w-app text-center">

        <div className="mb-6 flex justify-center">{cfg.icon}</div>

        <h1 className={`font-display text-2xl font-800 ${cfg.color}`}>
          {cfg.title}
        </h1>
        <p className="mt-2 font-body text-base text-text-secondary">{cfg.body}</p>

        {isSuccess && (
          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-correct-light px-6 py-3">
            <Crown className="h-5 w-5 text-correct-dark" />
            <span className="font-display text-base font-700 text-correct-dark">Premium активовано</span>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {isSuccess && (
            <Button size="lg" className="w-full" onClick={() => router.push("/home")}>
              Перейти до навчання
            </Button>
          )}
          {canRetry && (
            <Button size="lg" className="w-full" onClick={() => router.push("/subscription")}>
              Спробувати ще раз
            </Button>
          )}
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => router.push("/home")}
          >
            На головну
          </Button>
        </div>
      </div>
    </div>
  );
}
