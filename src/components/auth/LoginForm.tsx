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
import { useAuthStore } from "@/store/auth.store";
import { useRouter, Link } from "@/lib/navigation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFields = z.infer<typeof loginSchema>;

export function LoginForm() {
  const t = useTranslations("auth");
  const [formError, setFormError] = useState("");
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFields) => {
    setFormError("");
    try {
      const user = await authApi.login(data);
      setUser(user);
      router.replace(user.is_onboarded ? "/" : "/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        const { data: apiErrors } = err;
        (["email", "password"] as const).forEach((field) => {
          if (apiErrors[field]) {
            setError(field, { message: [apiErrors[field]].flat().join(" ") });
          }
        });
        const general =
          apiErrors.non_field_errors ?? apiErrors.detail ?? t("errors.invalidCredentials");
        setFormError([general].flat().join(" "));
      } else {
        setFormError(t("errors.generic"));
      }
    }
  };

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
        {...register("password")}
        label={t("fields.password")}
        type="password"
        autoComplete="current-password"
        placeholder="Введіть пароль"
        error={errors.password?.message}
      />
      <div style={{ textAlign: "right", marginTop: -6, marginBottom: 12 }}>
        <Link href="/forgot-password" className="auth-footer" style={{ margin: 0, fontSize: 13 }}>
          Забули пароль?
        </Link>
      </div>

      <button type="submit" className="auth-btn" disabled={isSubmitting}>
        {isSubmitting ? "…" : t("login.submit")}
      </button>

      <div className="auth-divider">{t("or")}</div>

      <GoogleButton onError={setFormError} />

      <div className="auth-footer">
        {t("login.noAccount")} <Link href="/register">{t("login.registerLink")}</Link>
      </div>
    </form>
  );
}
