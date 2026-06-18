import { api } from "./client";
import type { Question } from "./lessons";
import type { PvPDifficulty } from "./friends";

export type BattleStatus = "waiting" | "active" | "finished" | "cancelled";

export type BattlePlayer = {
  user_id: string;
  nickname: string | null;
  level: number;
  score: number;
  max_combo: number;
  correct_answers: number;
  wrong_answers: number;
  submitted_at: string | null;
  has_forfeited: boolean;
  exp_reward: number;
  gems_reward: number;
};

export type BattleLesson = {
  id: string;
  title: string;
  difficulty: string;
  exp_reward: number;
  is_boss: boolean;
  questions: Question[];
};

export type BattleDetail = {
  id: string;
  status: BattleStatus;
  mode: string;
  difficulty: PvPDifficulty;
  wager_gems: number;
  deadline: string | null;
  time_limit_seconds: number | null;
  seconds_remaining: number | null;
  lesson: BattleLesson | null;
  players: BattlePlayer[];
  winner_user_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

export type BattleSummary = {
  id: string;
  status: BattleStatus;
  difficulty: PvPDifficulty;
  wager_gems: number;
  opponent_id: string | null;
  opponent_nickname: string | null;
  winner_user_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

export type BattleOutcome = "won" | "lost" | "draw" | "waiting_for_opponent";

export type BattleResult = {
  outcome: BattleOutcome;
  winner_user_id?: string | null;
  rewards: Record<string, number> | null;
};

export type SubmitScorePayload = {
  score: number;
  max_combo: number;
};

export const pvpApi = {
  acceptChallenge: (challengeId: string) =>
    api.post<BattleDetail>(`/api/v1/pvp/challenges/${challengeId}/accept/`),

  declineChallenge: (challengeId: string) =>
    api.post<unknown>(`/api/v1/pvp/challenges/${challengeId}/decline/`),

  listBattles: () => api.get<BattleSummary[]>("/api/v1/pvp/battles/"),

  getBattle: (battleId: string) =>
    api.get<BattleDetail>(`/api/v1/pvp/battles/${battleId}/`),

  submit: (battleId: string, payload: SubmitScorePayload) =>
    api.post<BattleResult>(`/api/v1/pvp/battles/${battleId}/submit/`, payload),

  forfeit: (battleId: string) =>
    api.post<BattleResult>(`/api/v1/pvp/battles/${battleId}/forfeit/`),
};
