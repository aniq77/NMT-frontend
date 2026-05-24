import { api } from "./client";

export type LeaderboardSeason = {
  id: string;
  title: string;
  type: "weekly" | "seasonal";
  starts_at: string;
  ends_at: string;
};

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  nickname: string | null;
  level: number;
  points: number;
};

export type LeaderboardResponse = {
  season: LeaderboardSeason;
  entries: LeaderboardEntry[];
};

export const leaderboardApi = {
  get: (limit = 50) =>
    api.get<LeaderboardResponse>(`/api/v1/leaderboard/?limit=${limit}`),
};
