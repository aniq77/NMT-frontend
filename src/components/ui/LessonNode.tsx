"use client";
import { Check, Circle, Lock, Star, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeStatus = "golden" | "completed" | "current" | "available" | "locked";
type NodeType = "standard" | "challenge" | "checkpoint";

type IconComp = React.ComponentType<{ className?: string }>;

// SVG ring: r=34, circumference = 2π×34 ≈ 213.6
const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;
const GOLD_CAP = 3;

const ICONS: Record<NodeStatus, IconComp> = {
  golden:    Star,
  completed: Check,
  current:   Star,
  available: Circle,
  locked:    Lock,
};

const TYPE_OVERRIDES: Partial<Record<NodeType, Partial<Record<NodeStatus, IconComp>>>> = {
  challenge:  { current: Zap,    available: Zap },
  checkpoint: { current: Trophy, available: Trophy, golden: Trophy },
};

type LessonNodeProps = {
  status: NodeStatus;
  type?: NodeType;
  lessonNumber: number;
  title?: string;
  xp?: number;
  completionCount?: number;
  onClick?: () => void;
};

export function LessonNode({
  status,
  type = "standard",
  lessonNumber,
  title,
  xp,
  completionCount = 0,
  onClick,
}: LessonNodeProps) {
  const Icon = TYPE_OVERRIDES[type]?.[status] ?? ICONS[status];
  const isClickable = status !== "locked";
  const showRing = status === "completed" && completionCount > 0 && completionCount < GOLD_CAP;
  const ringProgress = showRing ? (RING_C * completionCount) / GOLD_CAP : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={isClickable ? onClick : undefined}
        onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick?.() : undefined}
        aria-label={title ?? `Урок ${lessonNumber}`}
        className={cn(
          "relative select-none transition-all duration-200",
          isClickable && "cursor-pointer hover:scale-105",
          status === "locked" && "cursor-not-allowed opacity-60",
        )}
      >
        {showRing && (
          <svg
            className="absolute -top-1 -left-1 -rotate-90"
            viewBox="0 0 72 72"
            width="72"
            height="72"
            aria-hidden="true"
          >
            <circle
              cx="36" cy="36" r={RING_R}
              fill="none"
              stroke="#FFB800"
              strokeWidth="3.5"
              strokeDasharray={`${ringProgress} ${RING_C}`}
              strokeLinecap="round"
            />
          </svg>
        )}
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full border-4 font-display text-xl font-700",
            status === "golden"    && "border-[#C8860A] bg-reward text-white shadow-[0_4px_0_#C8860A]",
            status === "completed" && "border-correct-dark bg-correct text-white shadow-[0_4px_0_#165C3A]",
            status === "current"   && "animate-pulse border-primary-dark bg-primary text-white shadow-button",
            status === "available" && "border-border bg-surface text-text-primary shadow-card hover:border-primary",
            status === "locked"    && "border-border bg-surface-alt text-text-secondary",
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>

      {title && (
        <span
          className={cn(
            "max-w-[80px] text-center font-display text-xs font-600 leading-tight",
            status === "locked" ? "text-text-secondary/60" : "text-text-secondary",
          )}
        >
          {title}
        </span>
      )}

      {xp !== undefined && status !== "locked" && (
        <span className="font-display text-xs font-700 text-reward">+{xp} XP</span>
      )}
    </div>
  );
}
