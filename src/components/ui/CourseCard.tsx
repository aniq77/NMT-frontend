"use client";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";
import { Tag } from "./Tag";

type Difficulty = "beginner" | "intermediate" | "advanced";

const DIFFICULTY: Record<Difficulty, { label: string; variant: "correct" | "reward" | "wrong" }> = {
  beginner:     { label: "Початковий", variant: "correct" },
  intermediate: { label: "Середній",  variant: "reward" },
  advanced:     { label: "Складний",  variant: "wrong" },
};

type CourseCardProps = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subject: string;
  description: string;
  progress: number;
  totalLessons?: number;
  completedLessons?: number;
  difficulty: Difficulty;
  isEnrolled: boolean;
  isLocked?: boolean;
  onClick?: () => void;
};

export function CourseCard({
  icon,
  title,
  subject,
  description,
  progress,
  totalLessons,
  completedLessons,
  difficulty,
  isEnrolled,
  isLocked = false,
  onClick,
}: CourseCardProps) {
  const diff = DIFFICULTY[difficulty];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border bg-surface text-left shadow-card",
        "transition-all duration-200",
        isLocked
          ? "cursor-not-allowed opacity-50"
          : "hover:border-primary-mid hover:shadow-modal active:scale-[0.99]",
        !onClick && !isLocked && "cursor-default",
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-light shadow-card">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-md font-700 text-text-primary">{title}</h3>
              <Tag variant={diff.variant} size="xs">{diff.label}</Tag>
            </div>
            <p className="mt-0.5 font-body text-sm text-text-secondary">{subject}</p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 font-body text-sm leading-relaxed text-text-secondary">
          {description}
        </p>

        {isEnrolled && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              {totalLessons != null && completedLessons != null ? (
                <span className="font-display text-xs font-600 text-text-secondary">
                  {completedLessons} / {totalLessons} уроків
                </span>
              ) : (
                <span className="font-display text-xs font-600 text-text-secondary">
                  Прогрес
                </span>
              )}
              <span className="font-display text-xs font-700 text-primary">{progress}%</span>
            </div>
            <ProgressBar
              value={progress}
              size="sm"
              color={progress === 100 ? "correct" : "primary"}
            />
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div
          className={cn(
            "rounded-lg py-2 text-center font-display text-sm font-700 transition-colors",
            isLocked
              ? "border border-border bg-surface-alt text-text-secondary"
              : isEnrolled
                ? "border border-border-strong bg-primary-light text-primary-dark"
                : "bg-primary text-white",
          )}
        >
          {isLocked ? "Незабаром" : isEnrolled ? (progress > 0 ? "Продовжити" : "Розпочати") : "Записатися"}
        </div>
      </div>
    </button>
  );
}
