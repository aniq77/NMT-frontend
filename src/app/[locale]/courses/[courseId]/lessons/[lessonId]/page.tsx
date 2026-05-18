import type { Metadata } from "next";
import { LESSON_CONFIGS } from "@/lib/mockLessons";
import LessonPageClient from "./LessonPageClient";

type Props = { params: Promise<{ locale: string; courseId: string; lessonId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = LESSON_CONFIGS[lessonId];
  if (!lesson) return {};
  return {
    title: lesson.title,
    description: `Урок «${lesson.theoryTitle}» — вивчи теорію, пройди інтерактивні завдання та тест для підготовки до НМТ.`,
    openGraph: {
      title: lesson.title,
      description: `Урок «${lesson.theoryTitle}» для підготовки до НМТ.`,
    },
  };
}

export default function LessonPage() {
  return <LessonPageClient />;
}
