import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { fontBody, fontDisplay, fontMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "НМТ Підготовка",
    template: "%s | НМТ Підготовка",
  },
  description: "Готуйся до НМТ ефективно та з азартом",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
