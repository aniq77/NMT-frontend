"use client";
import { BookOpen, Trophy, User } from "lucide-react";
import { Link, usePathname } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type IconComp = React.ComponentType<{ className?: string }>;

const NAV_ITEMS: { href: string; Icon: IconComp; label: string }[] = [
  { href: "/home",        Icon: BookOpen, label: "Навчання" },
  { href: "/leaderboard", Icon: Trophy,   label: "Рейтинг" },
  { href: "/profile",     Icon: User,     label: "Профіль" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="glass flex items-center gap-1 rounded-full p-1.5">
        {NAV_ITEMS.map(({ href, Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-full px-5 py-2 transition-all duration-200",
                isActive
                  ? "btn-grad-primary shadow-button"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className={cn("font-display text-[11px]", isActive ? "font-700" : "font-600")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
