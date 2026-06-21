import { api } from "./client";
import type { Achievement } from "@/types/achievements";

export const achievementsApi = {
  list: () => api.get<Achievement[]>("/api/v1/achievements/"),
};
