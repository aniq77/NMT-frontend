import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

type Props = { className?: string };

function StudentIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* mortarboard top */}
      <path d="M16 5L28 11L16 17L4 11Z" fill="white" opacity="0.95" />
      {/* brim */}
      <rect x="9" y="16.5" width="14" height="2" rx="1" fill="white" opacity="0.8" />
      {/* cap body */}
      <path d="M11 18.5L11 22Q11 25.5 16 25.5Q21 25.5 21 22L21 18.5Z" fill="white" opacity="0.75" />
      {/* tassel cord */}
      <line x1="27" y1="11" x2="27" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      {/* tassel bob */}
      <circle cx="27" cy="21.5" r="2" fill="white" opacity="0.8" />
    </svg>
  );
}

function StarIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* main star */}
      <path
        d="M16 4L18.9 12.2H27.5L20.8 17.3L23.7 25.5L16 20.4L8.3 25.5L11.2 17.3L4.5 12.2H13.1Z"
        fill="white"
        opacity="0.95"
      />
      {/* sparkle top-right */}
      <path d="M26 5L26.5 6.8L28.3 6.8L26.9 7.8L27.4 9.6L26 8.6L24.6 9.6L25.1 7.8L23.7 6.8L25.5 6.8Z"
        fill="white" opacity="0.6" />
      {/* sparkle cross top-left */}
      <line x1="5" y1="6" x2="5" y2="9" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <line x1="3.5" y1="7.5" x2="6.5" y2="7.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function PiIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* top bar of π */}
      <path d="M4 9H28" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      {/* left leg */}
      <path d="M10 9L9.5 25" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      {/* right leg (curves out at bottom like real π) */}
      <path d="M21 9L21 21Q21.5 25 24.5 25" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      {/* tiny formula dots underneath */}
      <circle cx="12" cy="28.5" r="1.1" fill="white" opacity="0.45" />
      <circle cx="16" cy="28.5" r="1.1" fill="white" opacity="0.45" />
      <circle cx="20" cy="28.5" r="1.1" fill="white" opacity="0.45" />
    </svg>
  );
}

function AtomIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* nucleus */}
      <circle cx="16" cy="16" r="2.5" fill="white" />
      {/* 3 orbital ellipses */}
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="white" strokeWidth="1.5" opacity="0.9" />
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="white" strokeWidth="1.5" opacity="0.9" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="white" strokeWidth="1.5" opacity="0.9" transform="rotate(120 16 16)" />
      {/* electron dots at tips of orbits */}
      <circle cx="29" cy="16" r="2.1" fill="white" />
      <circle cx="9.25" cy="6.97" r="2.1" fill="white" />
      <circle cx="9.25" cy="25.03" r="2.1" fill="white" />
    </svg>
  );
}

function TrophyIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* cup body */}
      <path d="M10 4H22V15Q22 22 16 22Q10 22 10 15Z" fill="white" opacity="0.9" />
      {/* left handle */}
      <path d="M10 6Q5 6 5 11Q5 16 10 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* right handle */}
      <path d="M22 6Q27 6 27 11Q27 16 22 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* stem */}
      <path d="M16 22V26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* narrow base */}
      <path d="M11.5 26H20.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* wide base */}
      <path d="M8 29H24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* star inside cup */}
      <path d="M16 8.5L17 11.3H20L17.5 13L18.5 15.8L16 14.1L13.5 15.8L14.5 13L12 11.3H15Z"
        fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

const ICONS: Record<string, (p: Props) => ReactElement> = {
  "student":      StudentIcon,
  "star-pupil":   StarIcon,
  "mathematician": PiIcon,
  "physicist":    AtomIcon,
  "olympian":     TrophyIcon,
};

export function SkinIcon({ code, className }: { code: string; className?: string }) {
  const Icon = ICONS[code];
  if (!Icon) return null;
  return <Icon className={cn("shrink-0", className)} />;
}

export function hasSkinIcon(code: string): boolean {
  return code in ICONS;
}
