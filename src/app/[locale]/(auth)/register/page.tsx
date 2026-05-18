import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { RegisterForm } from "@/components/auth/RegisterForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: t("register.title"),
    description: "Зареєструйся безкоштовно та починай підготовку до НМТ вже сьогодні.",
    openGraph: { title: t("register.title") },
  };
}

function Header() {
  const t = useTranslations("auth");
  return (
    <div className="mb-6">
      <h2 className="font-display text-md font-700 text-text-primary">{t("register.title")}</h2>
      <p className="mt-1 font-body text-sm text-text-secondary">{t("register.subtitle")}</p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Header />
      <RegisterForm />
    </>
  );
}
