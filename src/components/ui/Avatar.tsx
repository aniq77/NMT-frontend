import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const SIZES: Record<AvatarSize, { wrapper: string; text: string; badge: string; icon: string }> = {
  sm: { wrapper: "h-8 w-8",   text: "text-xs",   badge: "h-4 w-4 text-[9px]", icon: "h-4 w-4"   },
  md: { wrapper: "h-11 w-11", text: "text-sm",   badge: "h-5 w-5 text-xs",    icon: "h-6 w-6"   },
  lg: { wrapper: "h-16 w-16", text: "text-md",   badge: "h-6 w-6 text-sm",    icon: "h-8 w-8"   },
};

type AvatarProps = {
  src?: string;
  name?: string;
  level?: number;
  size?: AvatarSize;
  className?: string;
  /** CSS gradient string. Overrides the default mint→primary gradient. */
  gradient?: string;
  /** Optional icon rendered instead of initials (e.g. a SkinIcon). */
  icon?: React.ReactNode;
};

export function Avatar({ src, name, level, size = "md", className, gradient, icon }: AvatarProps) {
  const s = SIZES[size];
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--glass-line)] shadow-soft",
          !gradient && "bg-[image:radial-gradient(circle_at_35%_30%,var(--color-mint),var(--color-primary))]",
          s.wrapper,
        )}
        style={gradient ? { backgroundImage: gradient } : undefined}
      >
        {src ? (
          <img src={src} alt={name ?? "avatar"} className="h-full w-full object-cover" />
        ) : icon ? (
          <span className={cn("flex items-center justify-center", s.icon)}>{icon}</span>
        ) : (
          <span className={cn("font-display font-700 text-white", s.text)}>{initials}</span>
        )}
      </div>
      {level !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-[var(--glass-line)] bg-[image:var(--grad-reward)] font-display font-700 leading-none text-[#5a3a00]",
            s.badge,
          )}
        >
          {level}
        </span>
      )}
    </div>
  );
}
