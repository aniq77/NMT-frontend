import { GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";

function AuthHeader() {
  const t = useTranslations("common");
  return (
    <div className="mb-8 flex flex-col items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-button">
        <GraduationCap className="h-8 w-8" />
      </div>
      <h1 className="font-display text-lg font-800 text-text-primary">{t("appName")}</h1>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-app flex-col justify-center px-4 py-10">
      <AuthHeader />
      <div className="rounded-lg bg-surface p-6 shadow-card">{children}</div>
    </main>
  );
}
