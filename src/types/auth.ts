export type User = {
  id: string;
  email: string;
  nickname: string | null;
  auth_provider: "email" | "google" | "phone";
  active_avatar_type: "custom" | "character";
  energy: number;
  exp: number;
  exp_to_next_level: number;
  level: number;
  gems: number;
  lives: number;
  streak_days: number;
  best_streak_days: number;
  lost_streak_days: number;
  last_activity_date: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
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

export type OtpSendPayload = {
  phone: string;
};

export type OtpVerifyPayload = {
  phone: string;
  code: string;
};

// Django REST Framework field error shape
export type ApiFieldErrors = Record<string, string[]>;
