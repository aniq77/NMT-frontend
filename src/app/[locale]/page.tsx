import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("common");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-display text-xl font-bold text-primary">{t("appName")}</h1>
    </main>
  );
}
