"use client";
import { useEffect, useState } from "react";
import { Heart, Zap } from "lucide-react";

/**
 * Presentational battle stage for boss lessons — placeholder visuals only.
 *
 * It knows nothing about questions or the API: it renders the current HP/combo
 * and plays a short attack/hit animation whenever `turn.key` changes. The
 * fighters are emoji placeholders behind a stable contract (hero/boss + their
 * states), so real sprites/skins can replace them later without touching the
 * battle logic in LessonPageClient.
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

export function BossBattleStage({ bossName, bossHp, heroHp, combo, turn }: Props) {
  const [fx, setFx] = useState<{ attacker: "hero" | "boss"; crit: boolean } | null>(null);

  useEffect(() => {
    if (!turn) return;
    setFx({ attacker: turn.attacker, crit: turn.crit });
    const t = setTimeout(() => setFx(null), 600);
    return () => clearTimeout(t);
  }, [turn?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const heroAttacking = fx?.attacker === "hero";
  const bossAttacking = fx?.attacker === "boss";
  const bossHpPct = Math.max(0, Math.round((bossHp / BOSS_MAX_HP) * 100));

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      {/* Boss */}
      <div className="flex items-center gap-3">
        <div
          className="text-4xl transition-transform duration-200"
          style={{
            transform: bossAttacking
              ? "translateY(8px) scale(1.05)"
              : heroAttacking
                ? "translateX(6px) rotate(4deg)" // recoil when hit
                : "none",
            filter: heroAttacking ? "brightness(1.6) saturate(1.4)" : "none",
          }}
          aria-hidden
        >
          👹
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-700 text-text-primary">{bossName}</p>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-wrong transition-[width] duration-500 ease-out"
              style={{ width: `${bossHpPct}%` }}
            />
          </div>
          <p className="mt-0.5 text-right font-display text-xs font-600 text-text-secondary">
            {Math.max(0, bossHp)} / {BOSS_MAX_HP} HP
          </p>
        </div>
      </div>

      {/* Clash indicator */}
      <div className="my-2 flex h-6 items-center justify-center">
        {fx && (
          <span
            className="font-display text-lg font-800"
            style={{ color: fx.crit ? "var(--color-reward, #FFB800)" : undefined }}
          >
            {heroAttacking ? (fx.crit ? "⚡ КРИТ! ⚔️" : "⚔️") : "💥"}
          </span>
        )}
      </div>

      {/* Hero */}
      <div className="flex items-center gap-3">
        <div
          className="text-4xl transition-transform duration-200"
          style={{
            transform: heroAttacking
              ? "translateY(-8px) scale(1.05)"
              : bossAttacking
                ? "translateX(-6px) rotate(-4deg)" // recoil when hit
                : "none",
            filter: bossAttacking ? "brightness(0.7) saturate(0.6)" : "none",
          }}
          aria-hidden
        >
          🧙
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-700 text-text-primary">Герой</p>
          <div className="mt-1 flex items-center gap-1">
            {Array.from({ length: HERO_MAX_HP }).map((_, i) => (
              <Heart
                key={i}
                className={
                  i < heroHp ? "h-5 w-5 text-wrong" : "h-5 w-5 text-border"
                }
                fill={i < heroHp ? "currentColor" : "none"}
              />
            ))}
          </div>
          {/* Combo pips → crit at COMBO_FOR_CRIT */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="font-display text-xs font-600 text-text-secondary">Серія</span>
            {Array.from({ length: COMBO_FOR_CRIT }).map((_, i) => (
              <Zap
                key={i}
                className={i < combo ? "h-4 w-4 text-reward" : "h-4 w-4 text-border"}
                fill={i < combo ? "currentColor" : "none"}
              />
            ))}
            <span className="font-display text-xs font-600 text-text-secondary">
              {combo}/{COMBO_FOR_CRIT}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
