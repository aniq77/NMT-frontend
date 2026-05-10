import type { Metadata } from "next";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
