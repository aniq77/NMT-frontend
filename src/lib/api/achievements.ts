import { api } from "./client";
import type { Achievement, AchievementStats } from "@/types/achievements";

export const achievementsApi = {
  list: () => api.get<Achievement[]>("/api/v1/achievements/"),
  profile: () => api.get<Achievement[]>("/api/v1/achievements/profile/"),
  stats: () => api.get<AchievementStats>("/api/v1/achievements/stats/"),
};
