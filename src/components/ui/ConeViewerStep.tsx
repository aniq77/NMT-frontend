"use client";
import dynamic from "next/dynamic";
import { RotateCcw } from "lucide-react";

const ConeCanvas = dynamic(
  () => import("./ConeCanvas").then((m) => ({ default: m.ConeCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
  },
);

const FORMULAS = [
  { label: "Об'єм",              formula: "V = ⅓ · π · R² · H" },
  { label: "Бічна поверхня",     formula: "S꜀ = π · R · L"      },
  { label: "Повна поверхня",     formula: "S = π·R·(R + L)"    },
  { label: "Твірна (апофема)",   formula: "L = √(R² + H²)"     },
];

export function ConeViewerStep() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      {/* Header */}
      <div className="bg-primary px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-700 text-white">Конус у розрізі</h2>
            <p className="mt-0.5 font-body text-sm text-white/65">
              Бачимо R, H і твірну L одночасно
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
            <RotateCcw className="h-3.5 w-3.5 text-white/80" />
            <span className="font-body text-xs text-white/80">Крути мишею</span>
          </div>
        </div>
      </div>

      {/* 3-D canvas */}
      <div className="relative" style={{ height: 310 }}>
        <ConeCanvas />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 backdrop-blur-sm">
          <p className="font-body text-xs text-white/80">☝ Тягни для обертання</p>
        </div>
      </div>

      {/* Formula grid */}
      <div className="grid grid-cols-2 gap-2 p-4">
        {FORMULAS.map(({ label, formula }) => (
          <div key={label} className="rounded-lg bg-surface-alt px-3 py-2.5">
            <p className="font-body text-[10px] uppercase tracking-wide text-text-secondary">{label}</p>
            <p className="mt-0.5 font-mono text-sm font-700 text-primary-dark">{formula}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
