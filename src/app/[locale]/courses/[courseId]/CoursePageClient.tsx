"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/lib/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  coursesApi,
  SUBJECT_META,
  SUBJECT_ORDER,
  type CategorySummary,
  type CourseDetail,
  type Subject,
} from "@/lib/api/courses";

function isIslandCompleted(cat: CategorySummary): boolean {
  return cat.topics_count > 0 && cat.completed_topics >= cat.topics_count;
}

function SubjectCard({
  subject,
  islands,
  courseSlug,
}: {
  subject: Subject;
  islands: CategorySummary[];
  courseSlug: string;
}) {
  const router = useRouter();
  const meta = SUBJECT_META[subject];
  const completed = islands.filter(isIslandCompleted).length;
  const progress = islands.length > 0 ? Math.round((completed / islands.length) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => router.push(`/courses/${courseSlug}/subjects/${subject}`)}
      className="w-full rounded-xl border border-border bg-surface p-4 text-left shadow-card transition-all duration-200 hover:border-primary-mid hover:shadow-modal active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-2xl">
          {meta.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-700 text-text-primary">{meta.title}</h3>
          <p className="mt-0.5 font-body text-sm text-text-secondary">
            {completed} / {islands.length} {islands.length === 1 ? "острів" : "островів"}
          </p>
        </div>
        <span className="text-text-secondary">→</span>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-display text-xs font-600 text-text-secondary">Прогрес</span>
          <span className="font-display text-xs font-700 text-primary">{progress}%</span>
        </div>
        <ProgressBar value={progress} size="sm" color={progress === 100 ? "correct" : "primary"} />
      </div>
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

  // Group islands (categories) by subject, preserving the canonical subject order.
  const bySubject = (course?.categories ?? []).reduce<Record<string, CategorySummary[]>>(
    (acc, cat) => {
      (acc[cat.subject] ??= []).push(cat);
      return acc;
    },
    {},
  );
  const subjects = SUBJECT_ORDER.filter((s) => (bySubject[s]?.length ?? 0) > 0);

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
            <p className="mb-6 font-body text-sm text-text-secondary">
              Оберіть розділ, щоб почати проходити острови
            </p>

            <div className="space-y-3">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject}
                  subject={subject}
                  islands={bySubject[subject]}
                  courseSlug={courseId}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
