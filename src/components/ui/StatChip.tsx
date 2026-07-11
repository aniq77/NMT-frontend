import { Flame, Gem, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type StatType = "xp" | "gems" | "lives" | "streak" | "energy";

type IconComp = React.ComponentType<{ className?: string }>;

const STAT_CONFIG: Record<StatType, { Icon: IconComp; text: string; bg: string }> = {
  xp:     { Icon: Zap,   text: "text-reward-dark", bg: "bg-reward-light" },
  gems:   { Icon: Gem,   text: "text-primary-dark", bg: "bg-primary-light" },
  lives:  { Icon: Heart, text: "text-wrong-dark",   bg: "bg-wrong-light" },
  streak: { Icon: Flame, text: "text-reward-dark",  bg: "bg-reward-light" },
  energy: { Icon: Zap,   text: "text-reward-dark",  bg: "bg-reward-light" },
};

type StatChipProps = {
  type: StatType;
  value: number;
  size?: "sm" | "md";
  className?: string;
};

export function StatChip({ type, value, size = "md", className }: StatChipProps) {
  const { Icon, text, bg } = STAT_CONFIG[type];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        bg,
        size === "sm" ? "px-2 py-0.5" : "px-3 py-1.5",
        className,
      )}
    >
      <Icon className={cn(text, size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <span
        className={cn(
          "font-display font-700 tabular-nums",
          text,
          size === "sm" ? "text-xs" : "text-sm",
        )}
      >
        {value}
      </span>
    </div>
  );
}
