"use client";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useToastStore, type ToastType } from "@/store/toast.store";
import { cn } from "@/lib/utils";

const ICON: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const TINT: Record<ToastType, string> = {
  success: "text-correct-dark",
  error: "text-wrong-dark",
  info: "text-primary-dark",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[9000] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = ICON[t.type];
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            className="glass pop-in pointer-events-auto flex max-w-app items-center gap-2.5 rounded-full px-4 py-2.5 shadow-modal"
          >
            <Icon className={cn("h-5 w-5 shrink-0", TINT[t.type])} />
            <span className="font-display text-sm font-700 text-text-primary">{t.message}</span>
          </button>
        );
      })}
    </div>
  );
}
