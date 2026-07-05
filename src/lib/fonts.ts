import { Inter, Prata, JetBrains_Mono } from "next/font/google";

// Prata — headings only. High-contrast display serif with full Cyrillic, so
// Ukrainian titles stay consistent. Single weight (400).
export const fontDisplay = Prata({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

export const fontBody = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
