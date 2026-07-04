"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock } from "lucide-react";
import { Link, useRouter } from "@/lib/navigation";
import { LessonNode } from "@/components/ui/LessonNode";
import { coursesApi, type LessonSummary, type TopicDetail } from "@/lib/api/courses";

type NodeStatus = "golden" | "completed" | "current" | "available" | "locked";
type NodeType = "standard" | "challenge" | "checkpoint";

const GOLD_COMPLETIONS = 3;

function getLessonStatus(lesson: LessonSummary, lessons: LessonSummary[]): NodeStatus {
  // A boss golds on a single clear (no 3-pass mastery grind / "1/3" badge).
  if (lesson.is_boss) {
    if (lesson.is_completed || lesson.completion_count >= 1) return "golden";
  } else {
    if (lesson.completion_count >= GOLD_COMPLETIONS) return "golden";
    if (lesson.is_completed) return "completed";
  }
  const firstUncompleted = lessons.findIndex((l) => !l.is_completed);
  const idx = lessons.indexOf(lesson);
  if (idx === firstUncompleted) return "current";
  if (idx === firstUncompleted + 1) return "available";
  return "locked";
}

function getLessonType(lesson: LessonSummary): NodeType {
  if (lesson.is_boss) return "checkpoint";
  if (lesson.difficulty === "hard") return "challenge";
  return "standard";
}

export default function TopicPageClient() {
  const params = useParams<{ courseId: string; categorySlug: string; topicSlug: string }>();
  const { courseId, categorySlug, topicSlug } = params;
  const router = useRouter();

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi
      .topicDetail(courseId, categorySlug, topicSlug)
      .then(setTopic)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId, categorySlug, topicSlug]);

  const lessons = topic?.lessons ?? [];
  const isComing = topic?.is_coming_soon ?? false;

  const goToLesson = (lessonId: string) =>
    router.push(
      `/courses/${courseId}/categories/${categorySlug}/topics/${topicSlug}/lessons/${lessonId}`,
    );

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
          <Link
            href={`/courses/${courseId}/categories/${categorySlug}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
          >
            <span className="text-lg leading-none">←</span>
          </Link>
          <h1 className="font-display text-base font-700 text-text-primary">
            {topic?.title ?? "Острів"}
          </h1>
          {isComing && (
            <p className="font-body text-xs text-text-secondary">Скоро з&apos;явиться</p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6 pb-24">
        {loading && (
          <div className="flex flex-col items-center gap-6 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-16 animate-pulse rounded-full bg-surface-alt" />
            ))}
          </div>
        )}

        {!loading && topic && (
          <>
            {isComing && (
              <div className="mb-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface p-5 text-center">
                <Clock className="h-8 w-8 text-text-secondary" />
                <p className="font-display text-sm font-700 text-text-secondary">
                  Цей острів ще в розробці
                </p>
                <p className="font-body text-xs text-text-secondary">
                  Уроки будуть доступні найближчим часом
                </p>
              </div>
            )}

            <div className="flex flex-col items-center">
              {lessons.map((lesson, idx) => {
                const status: NodeStatus = isComing ? "locked" : getLessonStatus(lesson, lessons);
                const type = getLessonType(lesson);
                const isClickable = !isComing && status !== "locked";

                return (
                  <div key={lesson.id} className="flex flex-col items-center">
                    {idx > 0 && <div className="h-6 w-0.5 bg-border" />}
                    <LessonNode
                      status={status}
                      type={type}
                      lessonNumber={idx + 1}
                      title={lesson.title}
                      xp={lesson.exp_reward}
                      completionCount={lesson.completion_count}
                      onClick={isClickable ? () => goToLesson(lesson.id) : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
