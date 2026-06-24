"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Link, useRouter } from "@/lib/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  BLOCK_META,
  BLOCK_ORDER,
  coursesApi,
  SUBJECT_META,
  type Block,
  type CategorySummary,
  type CourseDetail,
  type Subject,
} from "@/lib/api/courses";
import { cn } from "@/lib/utils";

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
  const unlocked = island.is_unlocked;
  const completedTopics = island.completed_topics;
  const totalTopics = island.topics_count;
  const progress =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={() => router.push(`/courses/${courseSlug}/categories/${island.slug}`)}
      className={cn(
        "w-full rounded-xl border bg-surface p-4 text-left shadow-card transition-all duration-200",
        unlocked
          ? "border-border hover:border-primary-mid hover:shadow-modal active:scale-[0.99]"
          : "cursor-not-allowed border-border opacity-50",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
            unlocked ? "bg-primary-light" : "bg-surface-alt",
          )}
        >
          {unlocked ? "🏝" : <Lock className="h-6 w-6 text-text-secondary" />}
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
        <span className="text-text-secondary">{unlocked ? "→" : ""}</span>
      </div>

      {unlocked && totalTopics > 0 && (
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

  // Group islands under their pedagogical block header. Islands keep their
  // order_index order within a block; blocks follow the canonical BLOCK_ORDER.
  // Any island without a block (legacy data) falls into a headerless group.
  const blocksPresent: (Block | "")[] = [
    ...BLOCK_ORDER.filter((b) => islands.some((i) => i.block === b)),
    ...(islands.some((i) => !i.block) ? ([""] as const) : []),
  ];
  const blockGroups = blocksPresent.map((block) => ({
    block,
    islands: islands.filter((i) => i.block === block),
  }));

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
          <div className="space-y-6">
            {blockGroups.map(({ block, islands: blockIslands }) => (
              <section key={block || "no-block"} className="space-y-3">
                {block && (
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-lg leading-none">{BLOCK_META[block].emoji}</span>
                    <h2 className="font-display text-sm font-700 uppercase tracking-wide text-text-secondary">
                      {BLOCK_META[block].title}
                    </h2>
                  </div>
                )}
                {blockIslands.map((island) => (
                  <IslandCard key={island.slug} island={island} courseSlug={courseId} />
                ))}
              </section>
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
