import type { Metadata } from "next";
import CategoryPageClient from "./CategoryPageClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CategoryPage() {
  return <CategoryPageClient />;
}
