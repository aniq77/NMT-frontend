import { api } from "./client";

export type QuestGoalType = "lessons_completed" | "exp_earned" | "gems_earned";

export type QuestStatus = "assigned" | "completed" | "claimed";

export type DailyQuest = {
  id: string;
  title: string;
  description: string;
  goal_type: QuestGoalType;
  target_value: number;
  reward_gems: number;
  reward_exp: number;
};

export type UserQuestProgress = {
  id: string;
  quest: DailyQuest;
  progress: number;
  status: QuestStatus;
  assigned_date: string;
  claimed_at: string | null;
  is_complete: boolean;
};

export type QuestClaimResponse = {
  quest_id: string;
  title: string;
  reward_gems: number;
  reward_exp: number;
  gems: number;
  exp: number;
};

export const questsApi = {
  list: () => api.get<UserQuestProgress[]>("/api/v1/quests/"),

  claim: (questProgressId: string) =>
    api.post<QuestClaimResponse>(`/api/v1/quests/${questProgressId}/claim/`),
};
