"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Link, useRouter } from "@/lib/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  coursesApi,
  SUBJECT_META,
  type CategorySummary,
  type CourseDetail,
  type Subject,
} from "@/lib/api/courses";
import { cn } from "@/lib/utils";
import { progressStore } from "@/lib/progressStore";

const SUBJECTS = ["algebra", "geometry", "final"] as const;

function isSubject(value: string): value is Subject {
  return (SUBJECTS as readonly string[]).includes(value);
}

function IslandCard({
  island,
  courseSlug,
}: {
  island: CategorySummary;
  courseSlug: string;
}) {
  const router = useRouter();
  const stored = progressStore.getCategory(island.slug);
  const completedTopics = stored?.completedTopics ?? island.completed_topics;
  const totalTopics = stored?.totalTopics ?? island.topics_count;
  const progress =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <button
      type="button"
      disabled={!island.is_unlocked}
      onClick={() => router.push(`/courses/${courseSlug}/categories/${island.slug}`)}
      className={cn(
        "w-full rounded-xl border bg-surface p-4 text-left shadow-card transition-all duration-200",
        island.is_unlocked
          ? "border-border hover:border-primary-mid hover:shadow-modal active:scale-[0.99]"
          : "cursor-not-allowed border-border opacity-50",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
            island.is_unlocked ? "bg-primary-light" : "bg-surface-alt",
          )}
        >
          {island.is_unlocked ? "🏝" : <Lock className="h-6 w-6 text-text-secondary" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-700 text-text-primary">{island.title}</h3>
            {island.is_coming_soon && (
              <span className="rounded-lg bg-surface-alt px-2 py-0.5 font-display text-xs font-600 text-text-secondary">
                Незабаром
              </span>
            )}
          </div>
          <p className="mt-0.5 font-body text-sm text-text-secondary">
            {completedTopics} / {totalTopics} тем
          </p>
        </div>
        <span className="text-text-secondary">{island.is_unlocked ? "→" : ""}</span>
      </div>

      {island.is_unlocked && totalTopics > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-display text-xs font-600 text-text-secondary">Прогрес</span>
            <span className="font-display text-xs font-700 text-primary">{progress}%</span>
          </div>
          <ProgressBar value={progress} size="sm" color={progress === 100 ? "correct" : "primary"} />
        </div>
      )}
    </button>
  );
}

export default function SubjectPageClient() {
  const params = useParams<{ courseId: string; subjectSlug: string }>();
  const { courseId, subjectSlug } = params;
  const subject = isSubject(subjectSlug) ? subjectSlug : null;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi
      .detail(courseId)
      .then(setCourse)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const islands = (course?.categories ?? [])
    .filter((cat) => cat.subject === subject)
    .sort((a, b) => a.order_index - b.order_index);

  const title = subject ? SUBJECT_META[subject].title : "Розділ";

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
          <h1 className="font-display text-base font-700 text-text-primary">{title}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-alt" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {islands.map((island) => (
              <IslandCard key={island.slug} island={island} courseSlug={courseId} />
            ))}

            {islands.length === 0 && (
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
