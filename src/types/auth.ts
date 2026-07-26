export type EquippedSkin = {
  code: string;
  name: string;
  gradient: string;
  rarity: string;
};

export type User = {
  id: string;
  // Short, human-friendly friend code (8 chars, e.g. "K7QX9MRP" — no 0/O/1/I/L).
  // Shareable identifier used to add friends / send PvP challenges.
  player_code: string;
  email: string;
  nickname: string | null;
  auth_provider: "email" | "google";
  active_avatar_type: "custom" | "character";
  equipped_skin: EquippedSkin | null;
  energy: number;
  exp: number;
  exp_in_current_level: number;
  exp_required_for_next_level: number;
  exp_to_next_level: number;
  level: number;
  gems: number;
  lives: number;
  streak_days: number;
  best_streak_days: number;
  lost_streak_days: number;
  last_activity_date: string | null;
  is_email_verified: boolean;
  is_onboarded: boolean;
  daily_goal_minutes: number | null;
  unlocked_achievement_count: number;
  created_at: string;
  updated_at: string;
  date_joined: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  nickname: string;
  password: string;
  password_confirm: string;
};

export type GooglePayload = {
  id_token: string;
};

// Django REST Framework field error shape
export type ApiFieldErrors = Record<string, string[]>;
