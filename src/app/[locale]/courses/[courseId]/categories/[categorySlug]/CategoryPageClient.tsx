"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/lib/navigation";
import { LessonNode } from "@/components/ui/LessonNode";
import { coursesApi, type LessonSummary } from "@/lib/api/courses";

type NodeStatus = "golden" | "completed" | "current" | "available" | "locked";
type NodeType = "standard" | "challenge" | "checkpoint";

type LessonEntry = LessonSummary & {
  topicSlug: string;
  topicIsUnlocked: boolean;
};

const GOLD_COMPLETIONS = 3;

function getLessonStatus(lesson: LessonEntry, allLessons: LessonEntry[]): NodeStatus {
  if (!lesson.topicIsUnlocked) return "locked";
  if (lesson.completion_count >= GOLD_COMPLETIONS) return "golden";
  if (lesson.is_completed) return "completed";
  const firstUncompleted = allLessons.findIndex(
    (l) => l.topicIsUnlocked && !l.is_completed,
  );
  const idx = allLessons.indexOf(lesson);
  if (idx === firstUncompleted) return "current";
  if (idx === firstUncompleted + 1) return "available";
  return "locked";
}

function getLessonType(lesson: LessonSummary): NodeType {
  if (lesson.is_boss) return "checkpoint";
  if (lesson.difficulty === "hard") return "challenge";
  return "standard";
}

export default function CategoryPageClient() {
  const params = useParams<{ courseId: string; categorySlug: string }>();
  const { courseId, categorySlug } = params;
  const router = useRouter();

  const [categoryTitle, setCategoryTitle] = useState<string>("");
  const [backHref, setBackHref] = useState(`/courses/${courseId}`);
  const [lessons, setLessons] = useState<LessonEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [course, category] = await Promise.all([
          coursesApi.detail(courseId),
          coursesApi.categoryDetail(courseId, categorySlug),
        ]);

        const catMeta = course.categories.find((c) => c.slug === categorySlug);
        if (catMeta?.subject) {
          setBackHref(`/courses/${courseId}/subjects/${catMeta.subject}`);
        }

        setCategoryTitle(category.title);

        const topicDetails = await Promise.all(
          category.topics
            .sort((a, b) => a.order_index - b.order_index)
            .map((t) => coursesApi.topicDetail(courseId, categorySlug, t.slug)),
        );

        const allLessons: LessonEntry[] = topicDetails.flatMap((topic) =>
          [...topic.lessons]
            .sort((a, b) => a.order_index - b.order_index)
            .map((lesson) => ({
              ...lesson,
              topicSlug: topic.slug,
              topicIsUnlocked: topic.is_unlocked,
            })),
        );

        setLessons(allLessons);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, categorySlug]);

  const goToLesson = (lesson: LessonEntry) =>
    router.push(
      `/courses/${courseId}/categories/${categorySlug}/topics/${lesson.topicSlug}/lessons/${lesson.id}`,
    );

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
          <Link
            href={backHref}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
          >
            <span className="text-lg leading-none">←</span>
          </Link>
          <h1 className="font-display text-base font-700 text-text-primary">
            {categoryTitle || "Острів"}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6 pb-24">
        {loading && (
          <div className="flex flex-col items-center gap-6 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-16 animate-pulse rounded-full bg-surface-alt" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="flex flex-col items-center">
            {lessons.map((lesson, idx) => {
              const status = getLessonStatus(lesson, lessons);
              const type = getLessonType(lesson);
              const isClickable = status !== "locked";
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
                    onClick={isClickable ? () => goToLesson(lesson) : undefined}
                  />
                </div>
              );
            })}

            {lessons.length === 0 && (
              <p className="py-8 font-body text-sm text-text-secondary">
                Острів ще в розробці
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
