import type { Metadata } from "next";
import CoursePageClient from "./CoursePageClient";

const COURSE_META: Record<string, { title: string; description: string }> = {
  "math-nmt": {
    title: "Математика НМТ",
    description:
      "Підготовка до НМТ з математики: рівняння, дискримінант, теорема Вієта. Інтерактивні уроки та тести з покроковими алгоритмами.",
  },
  geometry: {
    title: "Геометрія",
    description:
      "Вивчай тіла обертання та многогранники для НМТ. 3D-візуалізації кулі та конуса, покрокові алгоритми розв'язання задач.",
  },
};

type Props = { params: Promise<{ locale: string; courseId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseId } = await params;
  const meta = COURSE_META[courseId];
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function CoursePage() {
  return <CoursePageClient />;
}
