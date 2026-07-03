import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "../journey/game-mockup.css";
import "../journey/game-app-light.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
