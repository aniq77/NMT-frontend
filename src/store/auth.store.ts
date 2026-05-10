"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth";
import { authApi } from "@/lib/api/auth";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      logout: async () => {
        await authApi.logout().catch(() => {});
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
