"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import { useRouter, Link } from "@/lib/navigation";
import { LessonNode } from "@/components/ui/LessonNode";
import { Button } from "@/components/ui/Button";
import { withToken } from "@/lib/dev";
import { coursesApi } from "@/lib/api/courses";
import type { CategoryDetail, CourseDetail, Topic } from "@/lib/api/courses";

type NodeStatus = "completed" | "current" | "available" | "locked";

function getTopicStatus(topic: Topic, topics: Topic[]): NodeStatus {
  if (topic.completion_count >= 1) return "completed";
  if (!topic.is_unlocked) return "locked";
  const firstActive = topics.find((t) => t.is_unlocked && t.completion_count === 0);
  return firstActive?.id === topic.id ? "current" : "available";
}

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; course: CourseDetail; categories: CategoryDetail[] };

export default function CoursePageClient() {
  const params = useParams<{ courseId: string; locale: string }>();
  const slug = params.courseId;
  const router = useRouter();

  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const course = await coursesApi.detail(slug);
        const categories = await Promise.all(
          course.categories.map((cat) => coursesApi.categoryDetail(slug, cat.slug)),
        );
        if (!cancelled) setState({ status: "ready", course, categories });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas gap-4 px-4">
        <p className="font-body text-text-secondary">Не вдалося завантажити курс</p>
        <Button size="sm" onClick={() => setState({ status: "loading" })}>
          Спробувати ще раз
        </Button>
      </div>
    );
  }

  const { course, categories } = state;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
          <Link
            href={withToken("/home")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
          >
            <span className="text-lg leading-none">←</span>
          </Link>
          <h1 className="font-display text-base font-700 text-text-primary">{course.title}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        {categories.map((category, categoryIdx) => (
          <div key={category.id} className={categoryIdx > 0 ? "mt-8" : undefined}>
            <div className="mb-6 rounded-xl border border-border bg-surface-alt px-4 py-3 text-center">
              <h2 className="font-display text-base font-700 text-text-primary">
                {category.title}
              </h2>
            </div>

            <div className="relative flex flex-col items-center">
              {category.topics.map((topic, idx) => {
                const status = getTopicStatus(topic, category.topics);
                const isCurrent = status === "current";
                const isClickable = status !== "locked";

                return (
                  <div key={topic.id} className="flex flex-col items-center">
                    {idx > 0 && <div className="h-6 w-0.5 bg-border" />}

                    {isCurrent ? (
                      <div className="flex flex-col items-center">
                        <LessonNode
                          status={status}
                          lessonNumber={idx + 1}
                          title={topic.title}
                        />
                        <div className="mt-3 w-52 rounded-xl border border-border bg-surface p-3 text-center shadow-modal">
                          <p className="font-display text-sm font-700 text-text-primary">
                            {topic.title}
                          </p>
                          {topic.required_completions > 1 && (
                            <p className="mt-0.5 font-display text-xs font-600 text-text-secondary">
                              {topic.completion_count}/{topic.required_completions} повторень
                            </p>
                          )}
                          <Button
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() =>
                              router.push(withToken(`/courses/${slug}/lessons/${topic.id}`))
                            }
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              Почати урок <Star className="h-3.5 w-3.5" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <LessonNode
                          status={status}
                          lessonNumber={idx + 1}
                          title={topic.title}
                          onClick={
                            isClickable
                              ? () => router.push(withToken(`/courses/${slug}/lessons/${topic.id}`))
                              : undefined
                          }
                        />
                        {status === "completed" && topic.is_gold && (
                          <span className="font-display text-xs font-700 text-reward">★ Золото</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="h-8" />
      </main>
    </div>
  );
}
