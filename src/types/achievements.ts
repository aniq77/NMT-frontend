export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export type AchievementConditionType =
  | "lessons_completed"
  | "courses_completed"
  | "streak_days"
  | "exp_earned"
  | "level_reached";

export type Achievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  tier: AchievementTier;
  condition_type: AchievementConditionType;
  condition_value: number;
  exp_reward: number;
  gems_reward: number;
  icon_url: string | null;
  unlocked: boolean;
  unlocked_at: string | null;
  user_progress: number;
};
