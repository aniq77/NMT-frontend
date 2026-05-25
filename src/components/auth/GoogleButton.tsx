"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "@/lib/navigation";
import { ApiError } from "@/lib/api/client";

type Props = {
  onError?: (message: string) => void;
};

export function GoogleButton({ onError }: Props) {
  const t = useTranslations("auth");
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const handleSuccess = async (credential: string) => {
    try {
      const user = await authApi.loginWithGoogle({ id_token: credential });
      setUser(user);
      router.replace(user.is_onboarded ? "/" : "/onboarding");
    } catch (err) {
      const message =
        err instanceof ApiError ? Object.values(err.data).flat().join(" ") : t("errors.generic");
      onError?.(message);
    }
  };

  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={(res) => res.credential && handleSuccess(res.credential)}
        onError={() => onError?.(t("errors.googleFailed"))}
        useOneTap={false}
        width="320"
        text="signin_with"
      />
    </div>
  );
}
