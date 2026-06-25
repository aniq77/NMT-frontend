"use client";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/lib/navigation";

export default function PaymentResultPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <div className="mx-auto w-full max-w-app text-center">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="h-20 w-20 text-reward-dark" />
        </div>

        <h1 className="font-display text-2xl font-800 text-text-primary">
          Платежі тимчасово недоступні
        </h1>
        <p className="mt-2 font-body text-base text-text-secondary">
          Backend payments API ще не підключено, тому перевірку платежу вимкнено.
        </p>

        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-surface-alt px-6 py-3">
          <Lock className="h-5 w-5 text-text-secondary" />
          <span className="font-display text-base font-700 text-text-secondary">
            Coming soon
          </span>
        </div>

        <div className="mt-8 space-y-3">
          <Button size="lg" className="w-full" onClick={() => router.push("/home")}>
            На головну
          </Button>
        </div>
      </div>
    </div>
  );
}
