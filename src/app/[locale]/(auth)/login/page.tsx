import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: t("login.title"),
    description: "Увійди до свого акаунту НМТ Підготовка та продовжуй навчання.",
    openGraph: { title: t("login.title") },
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
