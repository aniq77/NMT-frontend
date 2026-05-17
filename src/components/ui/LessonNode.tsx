"use client";
import { Check, Circle, Lock, Star, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeStatus = "completed" | "current" | "available" | "locked";
type NodeType = "standard" | "challenge" | "checkpoint";

type IconComp = React.ComponentType<{ className?: string }>;

const ICONS: Record<NodeStatus, IconComp> = {
  completed: Check,
  current:   Star,
  available: Circle,
  locked:    Lock,
};

const TYPE_OVERRIDES: Partial<Record<NodeType, Partial<Record<NodeStatus, IconComp>>>> = {
  challenge:  { current: Zap,    available: Zap },
  checkpoint: { current: Trophy, available: Trophy },
};

type LessonNodeProps = {
  status: NodeStatus;
  type?: NodeType;
  lessonNumber: number;
  title?: string;
  xp?: number;
  onClick?: () => void;
};

export function LessonNode({ status, type = "standard", lessonNumber, title, xp, onClick }: LessonNodeProps) {
  const Icon = TYPE_OVERRIDES[type]?.[status] ?? ICONS[status];
  const isClickable = status !== "locked";

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={isClickable ? onClick : undefined}
        disabled={status === "locked"}
        aria-label={title ?? `Урок ${lessonNumber}`}
        className={cn(
          "flex h-16 w-16 select-none items-center justify-center rounded-full border-4 font-display text-xl font-700 transition-all duration-200",
          status === "completed" && "border-correct-dark bg-correct text-white shadow-[0_4px_0_#165C3A]",
          status === "current"   && "animate-pulse cursor-pointer border-primary-dark bg-primary text-white shadow-button hover:scale-105",
          status === "available" && "cursor-pointer border-border bg-surface text-text-primary shadow-card hover:scale-105 hover:border-primary",
          status === "locked"    && "cursor-not-allowed border-border bg-surface-alt text-text-secondary opacity-60",
        )}
      >
        <Icon className="h-7 w-7" />
      </button>

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
