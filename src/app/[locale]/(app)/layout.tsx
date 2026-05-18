import type { Metadata } from "next";
import { BottomNav } from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
