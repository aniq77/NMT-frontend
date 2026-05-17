"use client";
import { BookOpen, Trophy, User } from "lucide-react";
import { Link, usePathname } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { withToken } from "@/lib/dev";

type IconComp = React.ComponentType<{ className?: string }>;

const NAV_ITEMS: { href: string; Icon: IconComp; label: string }[] = [
  { href: "/home",        Icon: BookOpen, label: "Навчання" },
  { href: "/leaderboard", Icon: Trophy,   label: "Рейтинг" },
  { href: "/profile",     Icon: User,     label: "Профіль" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-app">
        {NAV_ITEMS.map(({ href, Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={withToken(href)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors",
                isActive ? "text-primary" : "text-text-secondary hover:text-text-primary",
              )}
            >
              <Icon className="h-6 w-6" />
              <span className={cn("font-display text-xs", isActive ? "font-700" : "font-600")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
