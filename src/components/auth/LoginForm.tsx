"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleButton } from "./GoogleButton";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, Link } from "@/lib/navigation";
import { withToken } from "@/lib/dev";

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
      router.replace(user.is_onboarded ? withToken("/") : "/onboarding");
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
        {...register("password")}
        label={t("fields.password")}
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
        {t("login.submit")}
      </Button>

      <div className="relative flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="font-body text-sm text-text-secondary">{t("or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onError={setFormError} />

      <p className="text-center font-body text-sm text-text-secondary">
        {t("login.noAccount")}{" "}
        <Link href={withToken("/register")} className="font-600 text-primary hover:underline">
          {t("login.registerLink")}
        </Link>
      </p>
    </form>
  );
}
