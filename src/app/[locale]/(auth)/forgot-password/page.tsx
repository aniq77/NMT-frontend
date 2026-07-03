"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-correct/15">
          <CheckCircle className="h-8 w-8 text-correct" />
        </div>
        <h2 className="font-display text-md font-700 text-text-primary">Перевірте пошту</h2>
        <p className="font-body text-sm text-text-secondary">
          Якщо цей email зареєстрований, ми надіслали посилання для відновлення пароля.
        </p>
        <Link href="/login" className="mt-2 font-display text-sm font-600 text-primary hover:underline">
          Повернутись до входу
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-md font-700 text-text-primary">Відновлення пароля</h2>
        <p className="mt-1 font-body text-sm text-text-secondary">
          Введіть email акаунту — надішлемо посилання для скидання пароля.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          {...register("email")}
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
        />

        <Button type="submit" loading={isSubmitting} className="w-full">
          Надіслати посилання
        </Button>

        <p className="text-center font-body text-sm text-text-secondary">
          <Link href="/login" className="font-600 text-primary hover:underline">
            Повернутись до входу
          </Link>
        </p>
      </form>
    </>
  );
}
