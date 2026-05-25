"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "@/lib/navigation";

const phoneSchema = z.object({
  phone: z.string().regex(/^\+\d{10,15}$/, "Формат: +380XXXXXXXXX"),
});

const codeSchema = z.object({
  code: z.string().length(6, "Код має 6 цифр").regex(/^\d+$/, "Тільки цифри"),
});

type PhoneFields = z.infer<typeof phoneSchema>;
type CodeFields = z.infer<typeof codeSchema>;

export function OtpForm() {
  const t = useTranslations("auth");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [formError, setFormError] = useState("");
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const phoneForm = useForm<PhoneFields>({ resolver: zodResolver(phoneSchema) });
  const codeForm = useForm<CodeFields>({ resolver: zodResolver(codeSchema) });

  const onSendOtp = async (data: PhoneFields) => {
    setFormError("");
    try {
      await authApi.sendOtp({ phone: data.phone });
      setPhone(data.phone);
      setStep("code");
    } catch (err) {
      const message =
        err instanceof ApiError ? Object.values(err.data).flat().join(" ") : t("errors.generic");
      setFormError(message);
    }
  };

  const onVerifyOtp = async (data: CodeFields) => {
    setFormError("");
    try {
      const user = await authApi.verifyOtp({ phone, code: data.code });
      setUser(user);
      router.replace(user.is_onboarded ? "/" : "/onboarding");
    } catch (err) {
      const message =
        err instanceof ApiError ? Object.values(err.data).flat().join(" ") : t("errors.generic");
      setFormError(message);
    }
  };

  if (step === "phone") {
    return (
      <form onSubmit={phoneForm.handleSubmit(onSendOtp)} noValidate className="flex flex-col gap-4">
        {formError && (
          <p className="rounded-md bg-wrong-light px-4 py-3 font-body text-sm text-wrong-dark">
            {formError}
          </p>
        )}
        <Input
          {...phoneForm.register("phone")}
          label={t("otp.phoneLabel")}
          type="tel"
          inputMode="tel"
          placeholder="+380XXXXXXXXX"
          error={phoneForm.formState.errors.phone?.message}
          hint={t("otp.phoneHint")}
        />
        <Button
          type="submit"
          loading={phoneForm.formState.isSubmitting}
          className="w-full"
        >
          {t("otp.sendCode")}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={codeForm.handleSubmit(onVerifyOtp)} noValidate className="flex flex-col gap-4">
      {formError && (
        <p className="rounded-md bg-wrong-light px-4 py-3 font-body text-sm text-wrong-dark">
          {formError}
        </p>
      )}
      <p className="font-body text-sm text-text-secondary">
        {t("otp.codeSentTo")} <strong className="text-text-primary">{phone}</strong>
      </p>
      <Input
        {...codeForm.register("code")}
        label={t("otp.codeLabel")}
        type="text"
        inputMode="numeric"
        maxLength={6}
        autoComplete="one-time-code"
        error={codeForm.formState.errors.code?.message}
      />
      <Button type="submit" loading={codeForm.formState.isSubmitting} className="w-full">
        {t("otp.verify")}
      </Button>
      <button
        type="button"
        onClick={() => { setStep("phone"); setFormError(""); }}
        className="font-body text-sm text-text-secondary hover:text-primary"
      >
        {t("otp.changePhone")}
      </button>
    </form>
  );
}
