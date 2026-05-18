import type { User } from "@/types/auth";
import { api } from "./client";

export const usersApi = {
  getMe: () => api.get<User>("/api/v1/users/me/"),

  updateMe: (payload: { nickname: string }) =>
    api.patch<User>("/api/v1/users/me/", payload),

  restoreStreak: () => api.post<User>("/api/v1/users/me/restore-streak/"),
};
