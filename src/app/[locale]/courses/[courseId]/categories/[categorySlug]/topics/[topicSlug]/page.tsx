import type { Metadata } from "next";
import TopicPageClient from "./TopicPageClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TopicPage() {
  return <TopicPageClient />;
}
