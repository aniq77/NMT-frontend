"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DarkThemeBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(900px_560px_at_84%_6%,rgba(150,200,255,0.22),transparent_60%),radial-gradient(760px_520px_at_12%_92%,rgba(40,167,196,0.16),transparent_55%),linear-gradient(180deg,#0a1830_0%,#0c2a39_50%,#0e3a3a_100%)]" />
      <div className="absolute inset-x-0 top-[-12%] h-[70vh] animate-[darkAuroraOne_18s_ease-in-out_infinite] bg-[radial-gradient(60%_40%_at_30%_30%,rgba(51,214,194,0.45),transparent_70%)] blur-[46px]" />
      <div className="absolute inset-x-0 top-[-10%] h-[70vh] animate-[darkAuroraTwo_22s_ease-in-out_infinite] bg-[radial-gradient(50%_40%_at_70%_20%,rgba(155,140,255,0.34),transparent_70%)] blur-[52px]" />
      <div className="absolute right-[9vw] top-[7vh] h-24 w-24 rounded-full bg-[radial-gradient(circle_at_38%_34%,#fff,#dfe9ff_60%,#bcd0ff)] shadow-[0_0_60px_20px_rgba(190,210,255,0.22)] md:h-32 md:w-32" />
      <div className="absolute left-[-8vw] top-[32vh] h-20 w-52 animate-[darkCloudLeft_90s_linear_infinite] rounded-full bg-[radial-gradient(closest-side,rgba(180,220,255,0.5),transparent)] opacity-20 blur-sm" />
      <div className="absolute bottom-[18vh] right-[-10vw] h-24 w-64 animate-[darkCloudRight_120s_linear_infinite] rounded-full bg-[radial-gradient(closest-side,rgba(180,220,255,0.45),transparent)] opacity-15 blur-sm" />
    </div>
  );
}

export function DarkThemePage({
  children,
  header,
  className,
}: {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-screen text-text-primary">
      <DarkThemeBackdrop />
      <div className="relative z-10">
        {header}
        <main className={cn("mx-auto max-w-[820px] px-4 pb-32 pt-6 md:px-6", className)}>{children}</main>
      </div>
    </div>
  );
}

export function DarkGlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[26px] border border-[rgba(120,210,200,0.22)] bg-[rgba(16,40,50,0.55)] shadow-[0_24px_60px_-22px_rgba(0,0,0,0.7)] backdrop-blur-[14px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DarkSectionTitle({
  title,
  caption,
}: {
  title: string;
  caption?: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="font-display text-[30px] font-800 leading-none text-text-primary">{title}</h2>
      {caption ? (
        <span className="rounded-full border border-border bg-surface px-3 py-1 font-body text-xs font-700 text-text-secondary">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
