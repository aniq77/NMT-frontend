"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthField } from "@/components/auth/AuthField";
import { Link } from "@/lib/navigation";
import { authApi } from "@/lib/api/auth";

const schema = z.object({
  email: z.string().email("Введіть коректний email"),
});

type Fields = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Fields) {
    // Always show success — backend never reveals whether email exists
    await authApi.requestPasswordReset(data.email).catch(() => {});
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>📧</div>
        <div className="auth-title" style={{ fontSize: 20 }}>
          Перевірте пошту
        </div>
        <div className="auth-sub">
          Якщо цей email зареєстрований, ми надіслали посилання для відновлення пароля.
        </div>
        <div className="auth-footer">
          <Link href="/login">Повернутись до входу</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="auth-sub" style={{ marginBottom: 22 }}>
        Введіть email акаунту — надішлемо посилання для скидання пароля.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          {...register("email")}
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="your@email.com"
          error={errors.email?.message}
        />

        <button type="submit" className="auth-btn" disabled={isSubmitting}>
          {isSubmitting ? "…" : "Надіслати посилання"}
        </button>

        <div className="auth-footer">
          <Link href="/login">Повернутись до входу</Link>
        </div>
      </form>
    </>
  );
}
