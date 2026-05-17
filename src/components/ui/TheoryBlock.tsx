import { cn } from "@/lib/utils";

type TheoryBlockProps = {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function TheoryBlock({ icon, title, children, className }: TheoryBlockProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface shadow-card", className)}>
      <div className="bg-primary px-5 py-4">
        <div className="flex items-center gap-3">
          {icon && <span className="flex items-center text-white/90">{icon}</span>}
          <h2 className="font-display text-lg font-700 text-white">{title}</h2>
        </div>
      </div>
      <div className="space-y-3 px-5 py-5 font-body text-base leading-relaxed text-text-primary">
        {children}
      </div>
    </div>
  );
}

export function Formula({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("my-2 rounded-lg border border-border-strong bg-primary-light px-4 py-3", className)}>
      <p className="text-center font-mono text-base font-600 text-primary-dark">{children}</p>
    </div>
  );
}
