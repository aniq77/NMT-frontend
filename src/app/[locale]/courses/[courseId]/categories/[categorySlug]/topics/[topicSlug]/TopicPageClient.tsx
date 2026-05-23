"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import { Link, useRouter } from "@/lib/navigation";
import { LessonNode } from "@/components/ui/LessonNode";
import { Button } from "@/components/ui/Button";
import { coursesApi, type LessonSummary, type TopicDetail } from "@/lib/api/courses";

type NodeStatus = "completed" | "current" | "available" | "locked";
type NodeType = "standard" | "challenge" | "checkpoint";

function getLessonStatus(lesson: LessonSummary, lessons: LessonSummary[]): NodeStatus {
  if (lesson.is_completed) return "completed";
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
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-base font-700 text-text-primary">
              {topic?.title ?? "Острів"}
            </h1>
            {topic && topic.required_completions > 0 && (
              <p className="font-body text-xs text-text-secondary">
                {topic.completion_count} / {topic.required_completions} проходжень
                {topic.is_gold && (
                  <Star className="ml-1 inline h-3 w-3 fill-reward text-reward" />
                )}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center gap-6 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-16 animate-pulse rounded-full bg-surface-alt" />
            ))}
          </div>
        )}

        {!loading && topic && (
          <div className="relative flex flex-col items-center">
            {lessons.map((lesson, idx) => {
              const status = getLessonStatus(lesson, lessons);
              const type = getLessonType(lesson);
              const isCurrent = status === "current";
              const isClickable = status !== "locked";

              return (
                <div key={lesson.id} className="flex flex-col items-center">
                  {idx > 0 && <div className="h-6 w-0.5 bg-border" />}

                  {isCurrent ? (
                    <div className="flex flex-col items-center">
                      <LessonNode
                        status={status}
                        type={type}
                        lessonNumber={idx + 1}
                        title={lesson.title}
                        xp={lesson.exp_reward}
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
                          onClick={() =>
                            router.push(
                              `/courses/${courseId}/categories/${categorySlug}/topics/${topicSlug}/lessons/${lesson.id}`,
                            )
                          }
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
                      type={type}
                      lessonNumber={idx + 1}
                      title={lesson.title}
                      xp={lesson.exp_reward}
                      onClick={
                        isClickable
                          ? () =>
                              router.push(
                                `/courses/${courseId}/categories/${categorySlug}/topics/${topicSlug}/lessons/${lesson.id}`,
                              )
                          : undefined
                      }
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
