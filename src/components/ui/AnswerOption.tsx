"use client";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AnswerState = "default" | "selected" | "correct" | "wrong";

const LETTERS = ["A", "B", "C", "D", "E"];

const STATE_STYLES: Record<AnswerState, { wrapper: string; badge: string; text: string }> = {
  default: {
    wrapper: "border-border bg-surface hover:border-primary-mid hover:bg-primary-light/30 active:scale-[0.99]",
    badge:   "bg-border text-text-secondary",
    text:    "text-text-primary",
  },
  selected: {
    wrapper: "border-primary bg-primary-light",
    badge:   "bg-primary text-white",
    text:    "text-primary-dark",
  },
  correct: {
    wrapper: "border-correct bg-correct-light",
    badge:   "bg-correct text-white",
    text:    "text-correct-dark",
  },
  wrong: {
    wrapper: "border-wrong bg-wrong-light",
    badge:   "bg-wrong text-white",
    text:    "text-wrong-dark",
  },
};

type AnswerOptionProps = {
  index: number;
  content: string;
  state?: AnswerState;
  onClick?: () => void;
  disabled?: boolean;
};

export function AnswerOption({ index, content, state = "default", onClick, disabled }: AnswerOptionProps) {
  const s = STATE_STYLES[state];
  const letter = LETTERS[index] ?? String(index + 1);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150",
        s.wrapper,
        disabled && "cursor-default",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-sm font-700 transition-colors",
          s.badge,
        )}
      >
        {letter}
      </span>
      <span className={cn("flex-1 font-body text-base font-medium", s.text)}>{content}</span>
      {state === "correct" && <Check className="h-5 w-5 shrink-0 text-correct" />}
      {state === "wrong"   && <X    className="h-5 w-5 shrink-0 text-wrong" />}
    </button>
  );
}
