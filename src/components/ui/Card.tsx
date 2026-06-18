import { cn } from "@/lib/utils";

type CardPadding = "sm" | "md" | "lg";

const PADDING: Record<CardPadding, string> = { sm: "p-3", md: "p-4", lg: "p-6" };

type CardProps = {
  children: React.ReactNode;
  padding?: CardPadding;
  elevated?: boolean;
  className?: string;
};

export function Card({ children, padding = "md", elevated = false, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        elevated ? "glass" : "glass-soft",
        PADDING[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
