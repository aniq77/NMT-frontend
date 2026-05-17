import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

type AlgorithmStep = {
  title: string;
  description?: string;
  formula?: string;
};

type AlgorithmBlockProps = {
  title?: string;
  steps: AlgorithmStep[];
  className?: string;
};

export function AlgorithmBlock({
  title = "Алгоритм розв'язання",
  steps,
  className,
}: AlgorithmBlockProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface shadow-card", className)}>
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-text-secondary" />
          <h3 className="font-display text-md font-700 text-text-primary">{title}</h3>
        </div>
      </div>
      <ol className="divide-y divide-border">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4 px-5 py-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-700 text-white">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="font-display text-base font-600 text-text-primary">{step.title}</p>
              {step.description && (
                <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              )}
              {step.formula && (
                <div className="mt-2 rounded-lg border border-border-strong bg-primary-light px-3 py-2">
                  <p className="font-mono text-sm font-600 text-primary-dark">{step.formula}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
