"use client";
import { Link, usePathname } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/home",
    label: "Навчання",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V6a2 2 0 0 1 2-2h6v15H6a2 2 0 0 1-2-2z" /><path d="M12 4h6a2 2 0 0 1 2 2v13h-8z" /></svg>
    ),
  },
  {
    href: "/leaderboard",
    label: "Рейтинг",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M6 5h12v4a6 6 0 0 1-12 0z" /><path d="M9 21h6M12 15v6" /></svg>
    ),
  },
  {
    href: "/profile",
    label: "Профіль",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="dock">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link key={href} href={href} className={cn("tab", isActive && "active")}>
            {icon}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
