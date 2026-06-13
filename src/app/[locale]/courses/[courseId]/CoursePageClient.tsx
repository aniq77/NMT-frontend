"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { Link, useRouter } from "@/lib/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { coursesApi, type CategorySummary, type CourseDetail } from "@/lib/api/courses";
import { cn } from "@/lib/utils";

function CategoryCard({
  category,
  courseSlug,
}: {
  category: CategorySummary;
  courseSlug: string;
}) {
  const router = useRouter();
  const progress =
    category.topics_count > 0
      ? Math.round((category.completed_topics / category.topics_count) * 100)
      : 0;

  return (
    <button
      type="button"
      onClick={() => router.push(`/courses/${courseSlug}/categories/${category.slug}`)}
      className="w-full rounded-xl border border-border bg-surface p-4 text-left shadow-card transition-all duration-200 hover:border-primary-mid hover:shadow-modal active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-700 text-text-primary">{category.title}</h3>
          <p className="mt-0.5 font-body text-sm text-text-secondary">
            {category.completed_topics} / {category.topics_count} острів
            {category.topics_count !== 1 ? "ів" : ""}
          </p>
        </div>
        <span className="text-text-secondary">→</span>
      </div>

      {category.topics_count > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-display text-xs font-600 text-text-secondary">Прогрес</span>
            <span className="font-display text-xs font-700 text-primary">{progress}%</span>
          </div>
          <ProgressBar
            value={progress}
            size="sm"
            color={progress === 100 ? "correct" : "primary"}
          />
        </div>
      )}
    </button>
  );
}

export default function CoursePageClient() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi
      .detail(courseId)
      .then(setCourse)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
          <Link
            href="/home"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
          >
            <span className="text-lg leading-none">←</span>
          </Link>
          <h1 className="font-display text-base font-700 text-text-primary">
            {course?.title ?? "Курс"}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-alt" />
            ))}
          </div>
        )}

        {!loading && course && (
          <>
            {course.subject && (
              <p className="mb-6 font-body text-sm text-text-secondary">{course.subject}</p>
            )}

            <div className="space-y-3">
              {course.categories.map((cat) => (
                <CategoryCard key={cat.slug} category={cat} courseSlug={courseId} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
