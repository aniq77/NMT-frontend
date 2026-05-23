import type { Metadata } from "next";
import LessonPageClient from "./LessonPageClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LessonPage() {
  return <LessonPageClient />;
}
