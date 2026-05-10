export type User = {
  id: number;
  email: string;
  username: string;
  auth_provider: "email" | "google" | "phone";
  xp: number;
  xp_to_next_level: number;
  level: number;
  gems: number;
  lives: number;
  streak_days: number;
  last_activity_date: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  date_joined: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
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
