"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-correct-light">
          <Mail className="h-8 w-8 text-correct-dark" />
        </div>
        <h2 className="font-display text-md font-700 text-text-primary">
          {t("register.checkEmail")}
        </h2>
        <p className="font-body text-sm text-text-secondary">{t("register.verifyHint")}</p>
        <button
          onClick={() => router.push("/login")}
          className="font-display text-sm font-600 text-primary hover:underline"
        >
          {t("register.backToLogin")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {formError && (
        <p className="rounded-md bg-wrong-light px-4 py-3 font-body text-sm text-wrong-dark">
          {formError}
        </p>
      )}

      <Input
        {...register("email")}
        label={t("fields.email")}
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
      />
      <Input
        {...register("nickname")}
        label={t("fields.nickname")}
        type="text"
        autoComplete="nickname"
        error={errors.nickname?.message}
      />
      <Input
        {...register("password")}
        label={t("fields.password")}
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        hint={t("register.passwordHint")}
      />
      <Input
        {...register("password_confirm")}
        label={t("fields.passwordConfirm")}
        type="password"
        autoComplete="new-password"
        error={errors.password_confirm?.message}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
        {t("register.submit")}
      </Button>

      <div className="relative flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="font-body text-sm text-text-secondary">{t("or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onError={setFormError} />

      <p className="text-center font-body text-sm text-text-secondary">
        {t("register.hasAccount")}{" "}
        <Link href="/login" className="font-600 text-primary hover:underline">
          {t("register.loginLink")}
        </Link>
      </p>
    </form>
  );
}
