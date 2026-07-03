"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-correct/15">
          <CheckCircle className="h-8 w-8 text-correct" />
        </div>
        <h2 className="font-display text-md font-700 text-text-primary">Пароль змінено!</h2>
        <p className="font-body text-sm text-text-secondary">
          Тепер можеш увійти з новим паролем.
        </p>
        <Link href="/login" className="mt-2 w-full">
          <Button className="w-full">Увійти</Button>
        </Link>
      </div>
    );
  }

  // Invalid / missing token — show error without the form
  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-wrong-light">
          <XCircle className="h-8 w-8 text-wrong-dark" />
        </div>
        <h2 className="font-display text-md font-700 text-text-primary">Посилання недійсне</h2>
        <p className="font-body text-sm text-text-secondary">
          Посилання для відновлення пароля недійсне або вже використане.
        </p>
        <Link href="/forgot-password" className="font-display text-sm font-600 text-primary hover:underline">
          Запросити нове посилання
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-md font-700 text-text-primary">Новий пароль</h2>
        <p className="mt-1 font-body text-sm text-text-secondary">
          Введіть новий пароль для свого акаунту.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {formError && (
          <div className="rounded-md bg-wrong-light px-4 py-3">
            <p className="font-body text-sm text-wrong-dark">{formError}</p>
            {(formError.includes("expired") || formError.includes("Invalid")) && (
              <Link href="/forgot-password" className="mt-1 block font-display text-xs font-600 text-wrong-dark underline">
                Запросити нове посилання
              </Link>
            )}
          </div>
        )}

        <Input
          {...register("new_password")}
          label="Новий пароль"
          type="password"
          autoComplete="new-password"
          error={errors.new_password?.message}
        />
        <Input
          {...register("new_password_confirm")}
          label="Підтвердіть пароль"
          type="password"
          autoComplete="new-password"
          error={errors.new_password_confirm?.message}
        />

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Змінити пароль
        </Button>
      </form>
    </>
  );
}
