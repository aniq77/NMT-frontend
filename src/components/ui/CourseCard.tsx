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
        "glass w-full overflow-hidden rounded-2xl text-left",
        "transition-all duration-200",
        isLocked
          ? "cursor-not-allowed opacity-55"
          : "hover:-translate-y-1 hover:shadow-modal active:scale-[0.99]",
        !onClick && !isLocked && "cursor-default",
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--grad-primary)] text-white shadow-soft">
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
            "rounded-full py-2.5 text-center font-display text-sm font-700 transition-colors",
            isLocked
              ? "border border-border bg-surface-alt text-text-secondary"
              : isEnrolled
                ? "border border-border-strong bg-primary-light text-primary-dark"
                : "btn-grad-primary shadow-button",
          )}
        >
          {isLocked ? "Незабаром" : isEnrolled ? (progress > 0 ? "Продовжити" : "Розпочати") : "Записатися"}
        </div>
      </div>
    </button>
  );
}
