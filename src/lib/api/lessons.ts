import { api } from "./client";

export type StartLessonResult = {
  id: string;
  title: string;
  is_boss: boolean;
  exp_reward: number;
  energy_remaining: number;
};

export type CompleteLessonPayload = {
  score: number;
  passed: boolean;
  max_combo: number;
};

export type CompleteLessonResult = {
  already_completed: boolean;
  status: string;
  score: number | null;
  exp: number;
  level: number;
  lives: number;
  gems: number;
  combo_multiplier: number;
  exp_boost_active: boolean;
  unlocked_achievements: Array<{ code: string; title: string; tier: string }>;
};

export const lessonsApi = {
  start: (lessonId: string) =>
    api.post<StartLessonResult>(`/api/v1/lessons/${lessonId}/start/`),

  complete: (lessonId: string, payload: CompleteLessonPayload) =>
    api.post<CompleteLessonResult>(`/api/v1/lessons/${lessonId}/complete/`, payload),
};
