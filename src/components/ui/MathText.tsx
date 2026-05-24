"use client";
import React from "react";

// Renders inline math fractions: "1/2" → proper fraction, "-3/4" → proper fraction
// Supports integers and simple variables: 1/2, -1/8, a/b, 1/a
// Does NOT match decimals (1.5/2) or dates

const FRACTION_RE = /(-?\d+|[a-zA-Z])\/(\d+|[a-zA-Z])/g;

type Part =
  | { type: "text"; value: string }
  | { type: "fraction"; num: string; den: string };

function parse(text: string): Part[] {
  const parts: Part[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  FRACTION_RE.lastIndex = 0;
  while ((match = FRACTION_RE.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    parts.push({ type: "fraction", num: match[1], den: match[2] });
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }

  return parts;
}

type MathTextProps = {
  text: string;
  className?: string;
};

export function MathText({ text, className }: MathTextProps) {
  const parts = parse(text);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "text") return <span key={i}>{part.value}</span>;
        return (
          <span
            key={i}
            className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.8em] leading-none"
          >
            <span className="border-b border-current px-0.5 text-center leading-tight">
              {part.num}
            </span>
            <span className="px-0.5 text-center leading-tight">{part.den}</span>
          </span>
        );
      })}
    </span>
  );
}
