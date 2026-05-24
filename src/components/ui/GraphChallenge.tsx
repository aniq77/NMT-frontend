"use client";
import { useRef, useEffect, useLayoutEffect, useState } from "react";

// SVG viewport: 320 × 300, data range: x ∈ [−5, 5], y ∈ [−5, 5]
const W = 320;
const H = 300;
const SX = W / 10; // 32 px per unit
const SY = H / 10; // 30 px per unit

const toSX = (x: number) => (x + 5) * SX;
const toSY = (y: number) => (5 - y) * SY;
const fromSY = (svgY: number) => 5 - svgY / SY;

const GRID = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
const LABELS = [-4, -2, 2, 4];

function buildPath(c: number): string {
  let path = "";
  let penDown = false;
  for (let i = 0; i <= 300; i++) {
    const x = -5 + (i / 300) * 10;
    const y = x * x + c;
    if (y >= -5.4 && y <= 5.4) {
      const px = toSX(x).toFixed(1);
      const py = toSY(Math.max(-5, Math.min(5, y))).toFixed(1);
      path += penDown ? ` L${px},${py}` : `M${px},${py}`;
      penDown = true;
    } else {
      penDown = false;
    }
  }
  return path;
}

type Props = {
  prompt: string;
  subprompt: string;
  checked: boolean;
  isCorrect: boolean;
  c: number;
  onCChange: (c: number) => void;
};

export function GraphChallenge({ prompt, subprompt, checked, isCorrect, c, onCChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const onCChangeRef = useRef(onCChange);
  useLayoutEffect(() => {
    onCChangeRef.current = onCChange;
  });

  const clampedC = Math.max(-4.5, Math.min(4.5, c));
  const discriminant = -4 * clampedC;
  const rootCount = clampedC < -0.06 ? 2 : clampedC > 0.06 ? 0 : 1;
  const roots: number[] =
    rootCount === 2 ? [Math.sqrt(-clampedC), -Math.sqrt(-clampedC)] : rootCount === 1 ? [0] : [];

  const vertexSY = toSY(clampedC);
  const curveColor = checked ? (isCorrect ? "#16a34a" : "#dc2626") : "#6366f1";

  useEffect(() => {
    function getY(e: MouseEvent | TouchEvent) {
      return "touches" in e
        ? (e as TouchEvent).touches[0]?.clientY ?? 0
        : (e as MouseEvent).clientY;
    }
    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging.current || !svgRef.current) return;
      if (e.cancelable) e.preventDefault();
      const rect = svgRef.current.getBoundingClientRect();
      const relY = (getY(e) - rect.top) * (H / rect.height);
      const newC = fromSY(relY);
      onCChangeRef.current(Math.max(-4.5, Math.min(4.5, newC)));
    }
    function onEnd() {
      dragging.current = false;
      setIsDragging(false);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  function startDrag(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
  }

  const dColor =
    rootCount === 2 ? "text-correct-dark" : rootCount === 0 ? "text-wrong-dark" : "text-reward-dark";

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <p className="font-display text-xs font-600 uppercase tracking-widest text-text-secondary">
        Інтерактивне завдання
      </p>
      <h2 className="mt-2 font-display text-base font-700 text-text-primary">{prompt}</h2>
      <p className="mt-1 font-body text-sm text-text-secondary">{subprompt}</p>

      <div className="relative mt-4 select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none rounded-lg"
          style={{
            background: "#f8f9fb",
            cursor: isDragging ? "grabbing" : "default",
          }}
        >
          {/* Grid lines */}
          {GRID.map((i) => (
            <g key={i}>
              <line
                x1={toSX(i)} y1={0} x2={toSX(i)} y2={H}
                stroke={i === 0 ? "#9ca3af" : "#e5e7eb"}
                strokeWidth={i === 0 ? 1.5 : 0.5}
              />
              <line
                x1={0} y1={toSY(i)} x2={W} y2={toSY(i)}
                stroke={i === 0 ? "#9ca3af" : "#e5e7eb"}
                strokeWidth={i === 0 ? 1.5 : 0.5}
              />
            </g>
          ))}

          {/* Axis labels */}
          {LABELS.map((i) => (
            <g key={i}>
              <text x={toSX(i)} y={toSY(0) + 14} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="monospace">
                {i}
              </text>
              <text x={toSX(0) - 6} y={toSY(i) + 3} textAnchor="end" fontSize={9} fill="#9ca3af" fontFamily="monospace">
                {i}
              </text>
            </g>
          ))}
          <text x={W - 6} y={toSY(0) - 4} textAnchor="end" fontSize={10} fill="#9ca3af" fontFamily="monospace">x</text>
          <text x={toSX(0) + 5} y={11} textAnchor="start" fontSize={10} fill="#9ca3af" fontFamily="monospace">y</text>

          {/* Parabola curve */}
          <path
            d={buildPath(clampedC)}
            fill="none"
            stroke={curveColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Root dots */}
          {roots.map((rx, i) => (
            <circle
              key={i}
              cx={toSX(rx)}
              cy={toSY(0)}
              r={5}
              fill="#16a34a"
              stroke="white"
              strokeWidth={2}
            />
          ))}

          {/* Vertex — draggable handle */}
          <circle
            cx={toSX(0)}
            cy={vertexSY}
            r={11}
            fill={curveColor}
            stroke="white"
            strokeWidth={2.5}
            style={{ cursor: "grab" }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          />

          {/* Vertex coordinate label */}
          <text
            x={toSX(0) + 16}
            y={vertexSY + 4}
            fontSize={10}
            fill={curveColor}
            fontFamily="monospace"
            fontWeight="bold"
          >
            (0,{" "}
            {clampedC >= 0 ? clampedC.toFixed(1) : clampedC.toFixed(1)})
          </text>
        </svg>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-surface-alt px-2 py-2 text-center">
          <p className="font-body text-[10px] text-text-secondary">Вершина</p>
          <p className="font-display text-sm font-700 text-text-primary">
            (0,&nbsp;{clampedC.toFixed(1)})
          </p>
        </div>
        <div className="rounded-lg bg-surface-alt px-2 py-2 text-center">
          <p className="font-body text-[10px] text-text-secondary">D = −4c</p>
          <p className={`font-display text-sm font-700 ${dColor}`}>{discriminant.toFixed(1)}</p>
        </div>
        <div className="rounded-lg bg-surface-alt px-2 py-2 text-center">
          <p className="font-body text-[10px] text-text-secondary">Коренів</p>
          <p className={`font-display text-sm font-700 ${dColor}`}>{rootCount}</p>
        </div>
      </div>
    </div>
  );
}
