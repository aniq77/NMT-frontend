"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, Loader2, X } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "@/lib/navigation";

export default function VerifyEmailPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((user) => {
        setUser(user);
        router.replace("/home");
      })
      .catch(() => setStatus("error"));
  }, [token, router, setUser]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-body text-sm text-text-secondary">{t("verifyEmail.verifying")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-wrong-light">
        <X className="h-8 w-8 text-wrong-dark" />
      </div>
      <h2 className="font-display text-md font-700 text-text-primary">
        {t("verifyEmail.errorTitle")}
      </h2>
      <p className="font-body text-sm text-text-secondary">{t("verifyEmail.errorHint")}</p>
    </div>
  );
}
