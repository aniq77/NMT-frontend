"use client";
import { Lock, Star, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type RoadmapStatus = "locked" | "available" | "progress33" | "progress66" | "mastered";
export type LessonNodeType = "standard" | "challenge" | "boss";

type LessonNodeProps = {
  status: RoadmapStatus;
  lessonType?: LessonNodeType;
  title?: string;
  onClick?: () => void;
};

const R = 36;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ArcRing({ percent }: { percent: number }) {
  const dash = CIRCUMFERENCE * (percent / 100);
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={80}
      height={80}
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden
    >
      <circle
        cx={40}
        cy={40}
        r={R}
        fill="none"
        stroke="#FFB800"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
      />
    </svg>
  );
}

export function LessonNode({ status, lessonType = "standard", title, onClick }: LessonNodeProps) {
  const isLocked = status === "locked";
  const isMastered = status === "mastered";

  const Icon = isLocked
    ? Lock
    : lessonType === "boss"
    ? Trophy
    : lessonType === "challenge"
    ? Zap
    : Star;

  const arcPercent =
    status === "progress33" ? 33
    : status === "progress66" ? 66
    : isMastered ? 100
    : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {arcPercent > 0 && <ArcRing percent={arcPercent} />}
        <button
          type="button"
          onClick={!isLocked ? onClick : undefined}
          disabled={isLocked}
          aria-label={title}
          className={cn(
            "flex h-16 w-16 select-none items-center justify-center rounded-full border-4 transition-all duration-200",
            isLocked && "cursor-not-allowed border-border bg-surface-alt text-text-secondary opacity-60",
            status === "available" && "animate-pulse cursor-pointer border-primary bg-primary text-white shadow-button hover:scale-105",
            (status === "progress33" || status === "progress66") && "cursor-pointer border-border bg-surface text-text-secondary shadow-card hover:scale-105 hover:border-primary",
            isMastered && "cursor-pointer border-reward bg-surface text-reward shadow-card hover:scale-105",
          )}
        >
          <Icon className="h-7 w-7" />
        </button>
      </div>

      {title && (
        <span
          className={cn(
            "max-w-[80px] text-center font-display text-xs font-600 leading-tight",
            isLocked ? "text-text-secondary/60" : "text-text-secondary",
          )}
        >
          {title}
        </span>
      )}
    </div>
  );
}
