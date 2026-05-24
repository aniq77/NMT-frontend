"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="font-display text-xs font-600 uppercase tracking-[0.04em] text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-12 w-full rounded-md border bg-surface px-4 font-body text-base text-text-primary placeholder:text-text-secondary/60 transition-colors",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            error ? "border-wrong focus:border-wrong focus:ring-wrong/20" : "border-border",
            className,
          )}
          {...props}
        />
        {error && <p className="font-body text-sm text-wrong">{error}</p>}
        {hint && !error && <p className="font-body text-sm text-text-secondary">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
