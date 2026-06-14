import type { Metadata } from "next";
import SubjectPageClient from "./SubjectPageClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SubjectPage() {
  return <SubjectPageClient />;
}
