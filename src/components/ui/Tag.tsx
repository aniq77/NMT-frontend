import { cn } from "@/lib/utils";

type TagVariant = "default" | "primary" | "correct" | "wrong" | "reward";

const VARIANTS: Record<TagVariant, string> = {
  default: "bg-surface-alt text-text-secondary border border-border",
  primary: "bg-primary-light text-primary-dark border border-border-strong",
  correct: "bg-correct-light text-correct-dark",
  wrong:   "bg-wrong-light text-wrong-dark",
  reward:  "bg-reward-light text-reward-dark",
};

type TagProps = {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: "xs" | "sm";
  icon?: React.ReactNode;
  className?: string;
};

export function Tag({ children, variant = "default", size = "sm", icon, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-display font-600",
        size === "xs" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        VARIANTS[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
