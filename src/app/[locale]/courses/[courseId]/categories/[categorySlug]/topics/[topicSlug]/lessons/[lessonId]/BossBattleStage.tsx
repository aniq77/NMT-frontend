"use client";
import { useEffect, useState } from "react";
import { Heart, Zap } from "lucide-react";

/**
 * Boss battle stage — placeholder visuals only.
 *
 * Layout mirrors a classic RPG fight: hero + HP top-left, boss + HP top-right,
 * the two fighters facing each other on a scene below; the question card lives
 * under this component (in LessonPageClient). Fighters are emoji placeholders
 * behind a stable hero/boss + animation-state contract, so real sprites/skins
 * can replace them later without touching the battle logic.
 */

export const BOSS_MAX_HP = 15;
export const HERO_MAX_HP = 5;
export const COMBO_FOR_CRIT = 3;

export type BattleTurn = {
  key: number; // bumps every resolved turn so the animation retriggers
  attacker: "hero" | "boss";
  crit: boolean;
};

type Props = {
  bossName: string;
  bossHp: number;
  heroHp: number;
  combo: number; // 0..COMBO_FOR_CRIT-1, resets after a crit
  turn: BattleTurn | null;
};

function Hearts({ filled, total, size = "sm" }: { filled: number; total: number; size?: "sm" | "xs" }) {
  const cls = size === "xs" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex flex-wrap items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Heart
          key={i}
          className={i < filled ? `${cls} text-wrong` : `${cls} text-border`}
          fill={i < filled ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

export function BossBattleStage({ bossName, bossHp, heroHp, combo, turn }: Props) {
  const [fx, setFx] = useState<{ attacker: "hero" | "boss"; crit: boolean } | null>(null);

  useEffect(() => {
    if (!turn) return;
    setFx({ attacker: turn.attacker, crit: turn.crit });
    const t = setTimeout(() => setFx(null), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn?.key]);

  const heroAttacking = fx?.attacker === "hero";
  const bossAttacking = fx?.attacker === "boss";

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      {/* HP panels */}
      <div className="flex items-start justify-between gap-2 bg-surface px-3 py-2">
        <div className="rounded-xl bg-canvas px-2.5 py-1.5">
          <p className="font-display text-xs font-700 text-text-primary">🧑‍🦱 Герой</p>
          <div className="mt-1">
            <Hearts filled={heroHp} total={HERO_MAX_HP} />
          </div>
        </div>
        <div className="max-w-[62%] rounded-xl bg-canvas px-2.5 py-1.5">
          <p className="truncate text-right font-display text-xs font-700 text-text-primary">
            👹 {bossName}
          </p>
          <div className="mt-1 flex justify-end">
            <Hearts filled={bossHp} total={BOSS_MAX_HP} size="xs" />
          </div>
        </div>
      </div>

      {/* Battle scene */}
      <div
        className="relative h-40 w-full"
        style={{
          background:
            "linear-gradient(to bottom, #8fd3ff 0%, #c3ecff 44%, #8bd17a 45%, #5aa84a 100%)",
        }}
      >
        <div className="absolute left-1/2 top-3 -translate-x-1/2 text-3xl opacity-70" aria-hidden>
          🏰
        </div>

        {/* Hero (left, faces right) */}
        <div
          className="absolute bottom-2 left-4 text-5xl transition-transform duration-200"
          style={{
            transform: heroAttacking
              ? "translateX(30px) scale(1.08)"
              : bossAttacking
                ? "translateX(-4px) rotate(-6deg)"
                : "none",
            filter: bossAttacking ? "brightness(0.7) saturate(0.6)" : "none",
          }}
          aria-hidden
        >
          🧙
        </div>

        {/* Boss (right) */}
        <div
          className="absolute bottom-2 right-4 text-5xl transition-transform duration-200"
          style={{
            transform: bossAttacking
              ? "translateX(-30px) scale(1.08)"
              : heroAttacking
                ? "translateX(4px) rotate(6deg)"
                : "none",
            filter: heroAttacking ? "brightness(1.5) saturate(1.4)" : "none",
          }}
          aria-hidden
        >
          👹
        </div>

        {/* Clash effect */}
        {fx && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse font-display text-2xl font-800"
            style={{
              color: fx.crit ? "#FFB800" : "#ffffff",
              textShadow: "0 1px 4px rgba(0,0,0,0.55)",
            }}
          >
            {heroAttacking ? (fx.crit ? "⚡ КРИТ! ⚔️" : "⚔️") : "💥"}
          </div>
        )}

        {/* Combo pips */}
        <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 px-2 py-0.5">
          <span className="font-display text-[10px] font-700 text-white/90">Серія</span>
          {Array.from({ length: COMBO_FOR_CRIT }).map((_, i) => (
            <Zap
              key={i}
              className={i < combo ? "h-3 w-3 text-reward" : "h-3 w-3 text-white/40"}
              fill={i < combo ? "currentColor" : "none"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
