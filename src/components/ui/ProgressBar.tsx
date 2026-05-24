"use client";
import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  max?: number;
  color?: "primary" | "correct" | "reward" | "wrong";
  size?: "xs" | "sm" | "md";
  animated?: boolean;
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  color = "primary",
  size = "md",
  animated = true,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-border",
        size === "xs" && "h-1.5",
        size === "sm" && "h-2.5",
        size === "md" && "h-3.5",
        className,
      )}
    >
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        className={cn(
          "h-full rounded-full",
          color === "primary" && "bg-primary",
          color === "correct" && "bg-correct",
          color === "reward" && "bg-reward",
          color === "wrong" && "bg-wrong",
          animated && "transition-[width] duration-500 ease-out",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
