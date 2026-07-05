"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth";
import { authApi } from "@/lib/api/auth";
import { usersApi } from "@/lib/api/users";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  updateNickname: (nickname: string) => Promise<void>;
  restoreStreak: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      fetchMe: async () => {
        const user = await usersApi.getMe();
        set({ user, isAuthenticated: true });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),

      updateNickname: async (nickname) => {
        const user = await usersApi.updateMe({ nickname });
        set({ user });
      },

      restoreStreak: async () => {
        const user = await usersApi.restoreStreak();
        set({ user });
      },

      logout: async () => {
        await authApi.logout().catch(() => {});
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth",
      // Bump when the persisted `user` shape gains fields the UI now relies on.
      // v1: `player_code` was added — caches written before it lack the field,
      // which made the profile fall back to the 36-char UUID. The migration
      // drops the stale user (keeping the session) so `fetchMe()` repopulates a
      // complete profile from the backend on the next load.
      version: 1,
      migrate: (persisted, version) => {
        if (version < 1) {
          const prev = persisted as Partial<AuthState> | undefined;
          return { user: null, isAuthenticated: !!prev?.isAuthenticated };
        }
        return persisted as { user: User | null; isAuthenticated: boolean };
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
