"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import { Link, useRouter } from "@/lib/navigation";
import { LessonNode, type RoadmapStatus, type LessonNodeType } from "@/components/ui/LessonNode";
import { Button } from "@/components/ui/Button";
import { coursesApi, type LessonSummary, type TopicDetail } from "@/lib/api/courses";

function getLessonStatus(lesson: LessonSummary, idx: number, lessons: LessonSummary[]): RoadmapStatus {
  const isUnlocked = idx === 0 || lessons[idx - 1].is_completed;
  if (!isUnlocked) return "locked";
  if (!lesson.is_completed) return "available";
  const count = lesson.completion_count ?? 1;
  if (count >= 3) return "mastered";
  if (count >= 2) return "progress66";
  return "progress33";
}

function getLessonType(lesson: LessonSummary): LessonNodeType {
  if (lesson.is_boss) return "boss";
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

  const navigateToLesson = (lessonId: string) =>
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
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6 pb-24">
        {loading && (
          <div className="flex flex-col items-center gap-8 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-20 animate-pulse rounded-full bg-surface-alt" />
            ))}
          </div>
        )}

        {!loading && topic && (
          <div className="flex flex-col items-center">
            {lessons.map((lesson, idx) => {
              const status = getLessonStatus(lesson, idx, lessons);
              const type = getLessonType(lesson);
              const isAvailable = status === "available";

              return (
                <div key={lesson.id} className="flex flex-col items-center">
                  {idx > 0 && <div className="h-8 w-0.5 bg-border" />}

                  {isAvailable ? (
                    <div className="flex flex-col items-center">
                      <LessonNode
                        status={status}
                        lessonType={type}
                        title={lesson.title}
                        onClick={() => navigateToLesson(lesson.id)}
                      />
                      <div className="mt-3 w-52 rounded-xl border border-border bg-surface p-3 text-center shadow-modal">
                        <p className="font-display text-sm font-700 text-text-primary">
                          {lesson.title}
                        </p>
                        <p className="mt-0.5 font-display text-xs font-600 text-reward">
                          +{lesson.exp_reward} XP
                        </p>
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => navigateToLesson(lesson.id)}
                        >
                          <span className="flex items-center justify-center gap-1.5">
                            Почати урок <Star className="h-3.5 w-3.5" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <LessonNode
                      status={status}
                      lessonType={type}
                      title={lesson.title}
                      onClick={status !== "locked" ? () => navigateToLesson(lesson.id) : undefined}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
