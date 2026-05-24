import type { Metadata } from "next";
import CoursePageClient from "./CoursePageClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CoursePage() {
  return <CoursePageClient />;
}
