import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const SIZES: Record<AvatarSize, { wrapper: string; text: string; badge: string }> = {
  sm: { wrapper: "h-8 w-8",   text: "text-xs",   badge: "h-4 w-4 text-[9px]" },
  md: { wrapper: "h-11 w-11", text: "text-sm",   badge: "h-5 w-5 text-xs" },
  lg: { wrapper: "h-16 w-16", text: "text-md",   badge: "h-6 w-6 text-sm" },
};

type AvatarProps = {
  src?: string;
  name?: string;
  level?: number;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ src, name, level, size = "md", className }: AvatarProps) {
  const s = SIZES[size];
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full border-2 border-border bg-primary-light",
          s.wrapper,
        )}
      >
        {src ? (
          <img src={src} alt={name ?? "avatar"} className="h-full w-full object-cover" />
        ) : (
          <span className={cn("font-display font-700 text-primary", s.text)}>{initials}</span>
        )}
      </div>
      {level !== undefined && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-surface bg-reward font-display font-700 leading-none text-white",
            s.badge,
          )}
        >
          {level}
        </span>
      )}
    </div>
  );
}
