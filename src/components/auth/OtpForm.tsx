"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { AuthField, AuthError } from "./AuthField";
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
      <form onSubmit={phoneForm.handleSubmit(onSendOtp)} noValidate>
        {formError && <AuthError>{formError}</AuthError>}
        <AuthField
          {...phoneForm.register("phone")}
          label={t("otp.phoneLabel")}
          type="tel"
          inputMode="tel"
          placeholder="+380XXXXXXXXX"
          error={phoneForm.formState.errors.phone?.message}
          hint={t("otp.phoneHint")}
        />
        <button type="submit" className="auth-btn" disabled={phoneForm.formState.isSubmitting}>
          {phoneForm.formState.isSubmitting ? "…" : t("otp.sendCode")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={codeForm.handleSubmit(onVerifyOtp)} noValidate>
      {formError && <AuthError>{formError}</AuthError>}
      <div className="auth-sub" style={{ marginBottom: 16 }}>
        {t("otp.codeSentTo")} <strong style={{ color: "var(--teal-bright)" }}>{phone}</strong>
      </div>
      <AuthField
        {...codeForm.register("code")}
        label={t("otp.codeLabel")}
        type="text"
        inputMode="numeric"
        maxLength={6}
        autoComplete="one-time-code"
        error={codeForm.formState.errors.code?.message}
      />
      <button type="submit" className="auth-btn" disabled={codeForm.formState.isSubmitting}>
        {codeForm.formState.isSubmitting ? "…" : t("otp.verify")}
      </button>
      <div className="auth-footer">
        <a
          onClick={() => {
            setStep("phone");
            setFormError("");
          }}
        >
          {t("otp.changePhone")}
        </a>
      </div>
    </form>
  );
}
