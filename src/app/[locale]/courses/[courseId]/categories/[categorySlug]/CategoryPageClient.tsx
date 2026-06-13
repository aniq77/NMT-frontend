"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Lock, Star } from "lucide-react";
import { Link, useRouter } from "@/lib/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { coursesApi, type CategoryDetail, type TopicSummary } from "@/lib/api/courses";
import { cn } from "@/lib/utils";

function splitTitleEmoji(title: string): [string, string] {
  const match = title.match(/^(\p{Extended_Pictographic})\s*/u);
  if (match) return [match[1], title.slice(match[0].length)];
  return ["", title];
}

function IslandCard({
  topic,
  courseSlug,
  categorySlug,
}: {
  topic: TopicSummary;
  courseSlug: string;
  categorySlug: string;
}) {
  const router = useRouter();
  const [emoji, cleanTitle] = splitTitleEmoji(topic.title);
  const progress =
    topic.required_completions > 0
      ? Math.min(Math.round((topic.completion_count / topic.required_completions) * 100), 100)
      : 0;

  const isDisabled = !topic.is_unlocked && !topic.is_coming_soon;

  function getIcon() {
    if (emoji) return emoji;
    if (!topic.is_unlocked && !topic.is_coming_soon) return <Lock className="h-6 w-6 text-text-secondary" />;
    return "🏝";
  }

  function getIconBg() {
    if (topic.is_coming_soon) return "bg-surface-alt";
    if (topic.is_gold) return "bg-reward-light";
    if (topic.is_unlocked) return "bg-primary-light";
    return "bg-surface-alt";
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() =>
        router.push(`/courses/${courseSlug}/categories/${categorySlug}/topics/${topic.slug}`)
      }
      className={cn(
        "w-full rounded-xl border bg-surface p-4 text-left shadow-card transition-all duration-200",
        topic.is_coming_soon
          ? "border-dashed border-border opacity-60 hover:opacity-80"
          : topic.is_unlocked
            ? "border-border hover:border-primary-mid hover:shadow-modal active:scale-[0.99]"
            : "cursor-not-allowed border-border opacity-50",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl", getIconBg())}>
          {getIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-700 text-text-primary">{cleanTitle}</h3>
            {topic.is_gold && !topic.is_coming_soon && (
              <Star className="h-4 w-4 shrink-0 fill-reward text-reward" />
            )}
            {topic.is_coming_soon && (
              <span className="rounded-full bg-surface-alt px-2 py-0.5 font-display text-xs font-600 text-text-secondary">
                Незабаром
              </span>
            )}
          </div>
          {topic.description && (
            <p className="mt-0.5 line-clamp-2 font-body text-sm text-text-secondary">
              {topic.description}
            </p>
          )}
        </div>
      </div>

      {topic.is_unlocked && !topic.is_coming_soon && topic.required_completions > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-display text-xs font-600 text-text-secondary">
              {topic.completion_count} / {topic.required_completions} проходжень
            </span>
            <span
              className={cn(
                "font-display text-xs font-700",
                topic.is_gold ? "text-reward" : "text-primary",
              )}
            >
              {progress}%
            </span>
          </div>
          <ProgressBar
            value={progress}
            size="sm"
            color={topic.is_gold ? "correct" : "primary"}
          />
        </div>
      )}
    </button>
  );
}

export default function CategoryPageClient() {
  const params = useParams<{ courseId: string; categorySlug: string }>();
  const { courseId, categorySlug } = params;

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi
      .categoryDetail(courseId, categorySlug)
      .then(setCategory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId, categorySlug]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
          <Link
            href={`/courses/${courseId}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
          >
            <span className="text-lg leading-none">←</span>
          </Link>
          <h1 className="font-display text-base font-700 text-text-primary">
            {category?.title ?? "Категорія"}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-alt" />
            ))}
          </div>
        )}

        {!loading && category && (
          <div className="space-y-3">
            {category.topics.map((topic) => (
              <IslandCard
                key={topic.slug}
                topic={topic}
                courseSlug={courseId}
                categorySlug={categorySlug}
              />
            ))}

            {category.topics.length === 0 && (
              <p className="py-8 text-center font-body text-sm text-text-secondary">
                Острови ще не додані
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
