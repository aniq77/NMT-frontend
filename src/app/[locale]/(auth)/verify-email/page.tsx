"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
        router.replace(user.is_onboarded ? "/home" : "/onboarding");
      })
      .catch(() => setStatus("error"));
  }, [token, router, setUser]);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>⏳</div>
        <div className="auth-sub">{t("verifyEmail.verifying")}</div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 10 }}>✕</div>
      <div className="auth-title" style={{ fontSize: 20 }}>
        {t("verifyEmail.errorTitle")}
      </div>
      <div className="auth-sub">{t("verifyEmail.errorHint")}</div>
    </div>
  );
}
