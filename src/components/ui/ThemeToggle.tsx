"use client";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", Icon: Sun, label: "Світла" },
  { value: "dark", Icon: Moon, label: "Темна" },
  { value: "system", Icon: Monitor, label: "Авто" },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes is client-only; avoid hydration mismatch by reading theme after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const active = mounted ? (theme ?? "system") : "system";

  return (
    <div className={cn("glass-soft inline-flex items-center gap-1 rounded-full p-1", className)}>
      {OPTIONS.map(({ value, Icon, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs font-700 transition-all",
              isActive
                ? "btn-grad-primary shadow-button"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
