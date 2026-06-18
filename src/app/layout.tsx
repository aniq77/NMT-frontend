import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { fontBody, fontDisplay, fontMono } from "@/lib/fonts";
import { MagicalBackground } from "@/components/layout/MagicalBackground";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "НМТ Підготовка",
    template: "%s | НМТ Підготовка",
  },
  description:
    "Готуйся до НМТ ефективно та з азартом. Інтерактивні уроки, гейміфікація та покрокові алгоритми для успішного складання іспиту.",
  keywords: ["НМТ", "підготовка до НМТ", "математика", "геометрія", "іспит", "онлайн навчання", "тести НМТ"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "НМТ Підготовка",
    title: "НМТ Підготовка",
    description: "Готуйся до НМТ ефективно та з азартом",
  },
  twitter: {
    card: "summary_large_image",
    title: "НМТ Підготовка",
    description: "Готуйся до НМТ ефективно та з азартом",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body>
        <MagicalBackground />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
