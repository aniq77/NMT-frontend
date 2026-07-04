"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthField, AuthError } from "@/components/auth/AuthField";
import { Link } from "@/lib/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const schema = z
  .object({
    new_password: z.string().min(8, "Мінімум 8 символів"),
    new_password_confirm: z.string().min(1, "Підтвердіть пароль"),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    path: ["new_password_confirm"],
    message: "Паролі не збігаються",
  });

type Fields = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Fields) {
    setFormError("");
    try {
      await authApi.confirmPasswordReset({ token, ...data });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = [err.data?.detail ?? "Помилка. Спробуйте ще раз."].flat().join(" ");
        setFormError(msg);
      } else {
        setFormError("Помилка. Спробуйте ще раз.");
      }
    }
  }

  // Success state
  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
        <div className="auth-title" style={{ fontSize: 20 }}>
          Пароль змінено!
        </div>
        <div className="auth-sub">Тепер можеш увійти з новим паролем.</div>
        <Link href="/login" className="auth-btn" style={{ display: "block", textDecoration: "none" }}>
          Увійти
        </Link>
      </div>
    );
  }

  // Invalid / missing token — show error without the form
  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>✕</div>
        <div className="auth-title" style={{ fontSize: 20 }}>
          Посилання недійсне
        </div>
        <div className="auth-sub">
          Посилання для відновлення пароля недійсне або вже використане.
        </div>
        <div className="auth-footer">
          <Link href="/forgot-password">Запросити нове посилання</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="auth-sub" style={{ marginBottom: 22 }}>
        Введіть новий пароль для свого акаунту.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && <AuthError>{formError}</AuthError>}

        <AuthField
          {...register("new_password")}
          label="Новий пароль"
          type="password"
          autoComplete="new-password"
          error={errors.new_password?.message}
        />
        <AuthField
          {...register("new_password_confirm")}
          label="Підтвердіть пароль"
          type="password"
          autoComplete="new-password"
          error={errors.new_password_confirm?.message}
        />

        <button type="submit" className="auth-btn" disabled={isSubmitting}>
          {isSubmitting ? "…" : "Змінити пароль"}
        </button>

        <div className="auth-footer">
          <Link href="/forgot-password">Запросити нове посилання</Link>
        </div>
      </form>
    </>
  );
}
