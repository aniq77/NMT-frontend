"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { AuthField, AuthError } from "./AuthField";
import { GoogleButton } from "./GoogleButton";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useRouter, Link } from "@/lib/navigation";

const registerSchema = z
  .object({
    email: z.string().email(),
    nickname: z.string().min(2).max(50),
    password: z.string().min(8),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Паролі не співпадають",
    path: ["password_confirm"],
  });

type RegisterFields = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const t = useTranslations("auth");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFields) => {
    setFormError("");
    try {
      await authApi.register(data);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        const { data: apiErrors } = err;
        (["email", "nickname", "password", "password_confirm"] as const).forEach((field) => {
          if (apiErrors[field]) {
            setError(field, { message: [apiErrors[field]].flat().join(" ") });
          }
        });
        const general = apiErrors.non_field_errors ?? apiErrors.detail;
        if (general) setFormError([general].flat().join(" "));
      } else {
        setFormError(t("errors.generic"));
      }
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>📧</div>
        <div className="auth-title" style={{ fontSize: 20 }}>
          {t("register.checkEmail")}
        </div>
        <div className="auth-sub">{t("register.verifyHint")}</div>
        <button type="button" className="auth-btn" onClick={() => router.push("/login")}>
          {t("register.backToLogin")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError && <AuthError>{formError}</AuthError>}

      <AuthField
        {...register("email")}
        label={t("fields.email")}
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="your@email.com"
        error={errors.email?.message}
      />
      <AuthField
        {...register("nickname")}
        label={t("fields.nickname")}
        type="text"
        autoComplete="nickname"
        error={errors.nickname?.message}
      />
      <AuthField
        {...register("password")}
        label={t("fields.password")}
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        hint={t("register.passwordHint")}
      />
      <AuthField
        {...register("password_confirm")}
        label={t("fields.passwordConfirm")}
        type="password"
        autoComplete="new-password"
        error={errors.password_confirm?.message}
      />

      <button type="submit" className="auth-btn" disabled={isSubmitting}>
        {isSubmitting ? "…" : t("register.submit")}
      </button>

      <div className="auth-divider">{t("or")}</div>

      <GoogleButton onError={setFormError} />

      <div className="auth-footer">
        {t("register.hasAccount")} <Link href="/login">{t("register.loginLink")}</Link>
      </div>
    </form>
  );
}
