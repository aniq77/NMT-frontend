export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export type AchievementConditionType =
  | "lessons_completed"
  | "courses_completed"
  | "streak_days"
  | "exp_earned"
  | "first_island_completed"
  | "algebra_completed"
  | "geometry_completed"
  | "golden_level"
  | "math_course_completed"
  | "perfect_level"
  | "correct_answers"
  | "first_boss"
  | "boss_untouched"
  | "pvp_completed"
  | "pvp_wins"
  | "friends_count"
  | "pvp_friend_completed"
  | "purchases_completed"
  | "gems_spent"
  | "legendary_item"
  | "all_daily_completed"
  | "quests_completed"
  | "quest_active_week"
  | "level_reached";

export type AchievementCategory =
  | "learning"
  | "mastery"
  | "bosses"
  | "pvp"
  | "friends"
  | "levels"
  | "shop"
  | "quests";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export type Achievement = {
  id: string;
  slug: string;
  code: string;
  name: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  tier: AchievementTier;
  condition_type: AchievementConditionType;
  target_value: number;
  condition_value: number;
  exp_reward: number;
  gems_reward: number;
  icon: string;
  icon_url: string | null;
  is_unlocked: boolean;
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
  user_progress: number;
  progress_label: string;
  is_hidden: boolean;
  sort_order: number;
};

export type AchievementStats = {
  unlocked: number;
  total: number;
  percentage: number;
};
