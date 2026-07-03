"use client";
import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastState = {
  toasts: Toast[];
  push: (message: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
};

let counter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, type = "info") => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().dismiss(id), 2800);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helper usable outside React components.
export const toast = {
  success: (message: string) => useToastStore.getState().push(message, "success"),
  error: (message: string) => useToastStore.getState().push(message, "error"),
  info: (message: string) => useToastStore.getState().push(message, "info"),
};
