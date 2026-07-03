import { api } from "./client";

export type QuestionOption = {
  id: string;
  text: string;
  order_index: number;
};

export type Question = {
  id: string;
  text: string;
  type: string;
  order_index: number;
  options: QuestionOption[];
};

export type AnswerPayload = {
  question_id: string;
  selected_option_ids: string[];
};

export type QuestionResult = {
  question_id: string;
  is_correct: boolean;
  correct_option_ids: string[];
  explanation: string;
};

export type StartLessonResult = {
  id: string;
  title: string;
  is_boss: boolean;
  exp_reward: number;
  energy_remaining: number;
};

export type CompleteLessonPayload = {
  answers: AnswerPayload[];
};

export type CompleteLessonResult = {
  already_completed: boolean;
  completion_count: number;
  is_gold: boolean;
  status: string;
  score: number | null;
  exp: number;
  level: number;
  lives: number;
  gems: number;
  combo_multiplier: number;
  exp_boost_active: boolean;
  unlocked_achievements: Array<{ code: string; title: string; tier: string }>;
  question_results: QuestionResult[];
};

export const lessonsApi = {
  start: (lessonId: string) =>
    api.post<StartLessonResult>(`/api/v1/lessons/${lessonId}/start/`),

  answer: (lessonId: string, payload: AnswerPayload) =>
    api.post<QuestionResult>(`/api/v1/lessons/${lessonId}/answer/`, payload),

  complete: (lessonId: string, payload: CompleteLessonPayload) =>
    api.post<CompleteLessonResult>(`/api/v1/lessons/${lessonId}/complete/`, payload),

  questions: (lessonId: string) =>
    api.get<Question[]>(`/api/v1/lessons/${lessonId}/questions/`),
};
