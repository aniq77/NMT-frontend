import type { User, LoginPayload, RegisterPayload, GooglePayload } from "@/types/auth";
import { api } from "./client";

export const authApi = {
  login: (payload: LoginPayload) => api.post<User>("/api/v1/auth/login/", payload),

  register: (payload: RegisterPayload) => api.post<void>("/api/v1/auth/register/", payload),

  logout: () => api.post<void>("/api/v1/auth/logout/"),

  refreshToken: () => api.post<void>("/api/v1/auth/token/refresh/"),

  loginWithGoogle: (payload: GooglePayload) => api.post<User>("/api/v1/auth/google/", payload),

  verifyEmail: (token: string) =>
    api.get<User>(`/api/v1/auth/verify-email/?token=${encodeURIComponent(token)}`),

  requestPasswordReset: (email: string) =>
    api.post<{ detail: string }>("/api/v1/auth/password/reset/request/", { email }),

  confirmPasswordReset: (payload: { token: string; new_password: string; new_password_confirm: string }) =>
    api.post<{ detail: string }>("/api/v1/auth/password/reset/confirm/", payload),
};
