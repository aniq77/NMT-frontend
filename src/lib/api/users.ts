import type { User } from "@/types/auth";
import { api } from "./client";

export type OnboardingPayload = {
  nickname?: string;
  course_id: string;
  daily_goal_minutes: 5 | 10 | 15 | 20;
};

export const usersApi = {
  getMe: () => api.get<User>("/api/v1/users/me/"),

  updateMe: (payload: { nickname: string }) =>
    api.patch<User>("/api/v1/users/me/", payload),

  restoreStreak: () => api.post<User>("/api/v1/users/me/restore-streak/"),

  completeOnboarding: (payload: OnboardingPayload) =>
    api.post<User>("/api/v1/users/me/onboarding/", payload),
};
