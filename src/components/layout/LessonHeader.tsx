"use client";
import { Heart, X, Zap } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

type LessonHeaderProps = {
  progress: number;
  onClose: () => void;
  xpEarned?: number;
  lives?: number;
  /** Boss mode: hide the progress bar and lives — the battle stage owns HP. */
  minimal?: boolean;
};

export function LessonHeader({ progress, onClose, xpEarned = 0, lives = 5, minimal = false }: LessonHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto max-w-app px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
            aria-label="Закрити урок"
          >
            <X className="h-5 w-5" />
          </button>
          {minimal ? (
            <div className="flex-1" />
          ) : (
            <>
              <div className="flex-1">
                <ProgressBar value={progress} size="sm" animated />
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      "h-4 w-4 transition-colors duration-300",
                      i < lives ? "fill-wrong text-wrong" : "text-border",
                    )}
                  />
                ))}
              </div>
            </>
          )}
          {xpEarned > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 font-display text-sm font-700 text-reward">
              <Zap className="h-3.5 w-3.5" /> {xpEarned}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
