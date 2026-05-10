import type {
  User,
  LoginPayload,
  RegisterPayload,
  GooglePayload,
  OtpSendPayload,
  OtpVerifyPayload,
} from "@/types/auth";
import { api } from "./client";

export const authApi = {
  login: (payload: LoginPayload) => api.post<User>("/api/v1/auth/login/", payload),

  register: (payload: RegisterPayload) => api.post<void>("/api/v1/auth/register/", payload),

  logout: () => api.post<void>("/api/v1/auth/logout/"),

  refreshToken: () => api.post<void>("/api/v1/auth/token/refresh/"),

  loginWithGoogle: (payload: GooglePayload) => api.post<User>("/api/v1/auth/google/", payload),

  sendOtp: (payload: OtpSendPayload) => api.post<void>("/api/v1/auth/otp/send/", payload),

  verifyOtp: (payload: OtpVerifyPayload) => api.post<User>("/api/v1/auth/otp/verify/", payload),

  verifyEmail: (token: string) =>
    api.get<User>(`/api/v1/auth/verify-email/?token=${encodeURIComponent(token)}`),
};
