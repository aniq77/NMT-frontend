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

export type ChainStatus = "in_progress" | "completed";

export type ChainStep = {
  order: number;
  quest: DailyQuest;
};

export type UserChainProgress = {
  chain_id: string;
  title: string;
  description: string;
  current_order: number;
  step_progress: number;
  current_target: number | null;
  status: ChainStatus;
  steps: ChainStep[];
};

export type ChainClaimResponse = {
  chain_id: string;
  claimed_step: number;
  reward_gems: number;
  reward_exp: number;
  chain_completed: boolean;
  current_order: number;
  gems: number;
  exp: number;
};

export const questsApi = {
  list: () => api.get<UserQuestProgress[]>("/api/v1/quests/"),

  weekly: () => api.get<UserQuestProgress[]>("/api/v1/quests/weekly/"),

  claim: (questProgressId: string) =>
    api.post<QuestClaimResponse>(`/api/v1/quests/${questProgressId}/claim/`),

  chains: () => api.get<UserChainProgress[]>("/api/v1/quests/chains/"),

  claimChain: (chainId: string) =>
    api.post<ChainClaimResponse>(`/api/v1/quests/chains/${chainId}/claim/`),
};
