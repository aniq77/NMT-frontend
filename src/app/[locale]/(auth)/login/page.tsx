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

const activeTab = "flex-1 rounded py-1.5 text-center font-display text-sm font-600 bg-surface text-primary shadow-card";
const inactiveTab = "flex-1 rounded py-1.5 text-center font-display text-sm font-600 text-text-secondary";

function Tabs({ isPhone }: { isPhone: boolean }) {
  const t = useTranslations("auth");
  return (
    <div className="mb-6">
      <h2 className="mb-1 font-display text-md font-700 text-text-primary">{t("login.title")}</h2>
      <div className="mt-4 flex rounded-md border border-border bg-primary-light p-1">
        <Link href="/login" className={isPhone ? inactiveTab : activeTab}>
          {t("login.tabEmail")}
        </Link>
        <Link href="/login?method=phone" className={isPhone ? activeTab : inactiveTab}>
          {t("login.tabPhone")}
        </Link>
      </div>
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
