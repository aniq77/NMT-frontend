import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/auth/LoginForm";
import { OtpForm } from "@/components/auth/OtpForm";
import { Link } from "@/lib/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: t("login.title"),
    description: "Увійди до свого акаунту НМТ Підготовка та продовжуй навчання.",
    openGraph: { title: t("login.title") },
  };
}

function Tabs({ isPhone }: { isPhone: boolean }) {
  const t = useTranslations("auth");
  return (
    <div className="auth-tabs">
      <Link href="/login" className={`auth-tab${isPhone ? "" : " active"}`}>
        {t("login.tabEmail")}
      </Link>
      <Link href="/login?method=phone" className={`auth-tab${isPhone ? " active" : ""}`}>
        {t("login.tabPhone")}
      </Link>
    </div>
  );
}

type Props = {
  searchParams: Promise<{ method?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { method } = await searchParams;
  const isPhone = method === "phone";

  return (
    <>
      <Tabs isPhone={isPhone} />
      {isPhone ? <OtpForm /> : <LoginForm />}
    </>
  );
}
