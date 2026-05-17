"use client";
import { Lightbulb, PartyPopper, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

type FeedbackPanelProps = {
  type: "correct" | "wrong";
  explanation?: string;
  xpGained?: number;
  onContinue: () => void;
};

export function FeedbackPanel({ type, explanation, xpGained, onContinue }: FeedbackPanelProps) {
  const isCorrect = type === "correct";

  return (
    <div
      className={cn(
        "border-t-2 px-4 pb-6 pt-4",
        isCorrect ? "border-correct bg-correct-light" : "border-wrong bg-wrong-light",
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 shrink-0">
          {isCorrect
            ? <PartyPopper className="h-6 w-6 text-correct-dark" />
            : <Lightbulb className="h-6 w-6 text-wrong-dark" />
          }
        </span>
        <div className="flex-1">
          <p
            className={cn(
              "font-display text-md font-700",
              isCorrect ? "text-correct-dark" : "text-wrong-dark",
            )}
          >
            {isCorrect ? "Правильно!" : "Не зовсім..."}
          </p>
          {explanation && (
            <p
              className={cn(
                "mt-1 font-body text-sm leading-relaxed",
                isCorrect ? "text-correct-dark/80" : "text-wrong-dark/80",
              )}
            >
              {explanation}
            </p>
          )}
          {xpGained !== undefined && xpGained > 0 && isCorrect && (
            <span className="mt-1.5 inline-flex items-center gap-1 font-display text-sm font-700 text-reward">
              <Zap className="h-3.5 w-3.5" /> +{xpGained} XP
            </span>
          )}
        </div>
      </div>

      <Button
        onClick={onContinue}
        size="lg"
        className={cn(
          "w-full",
          isCorrect
            ? "bg-correct shadow-[0_4px_0_#165C3A] hover:bg-correct-dark"
            : "bg-wrong shadow-[0_4px_0_#7A1C1C] hover:bg-wrong-dark",
        )}
      >
        Продовжити
      </Button>
    </div>
  );
}
