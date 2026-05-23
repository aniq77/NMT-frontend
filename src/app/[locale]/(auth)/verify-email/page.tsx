import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { X } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { withToken } from "@/lib/dev";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const t = await getTranslations("auth");

  if (!token) {
    redirect(withToken("/login"));
  }

  try {
    await authApi.verifyEmail(token);
    redirect(withToken("/"));
  } catch {
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
}
