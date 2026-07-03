"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
};

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={cn(
          "glass relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl p-6 shadow-modal sm:rounded-3xl",
          SIZE_CLASSES[size],
        )}
      >
        {(title || onClose) && (
          <div className="mb-4 flex items-center justify-between">
            {title && (
              <h2 className="font-display text-lg font-700 text-text-primary">{title}</h2>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="ml-auto flex items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
                aria-label="Закрити"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
