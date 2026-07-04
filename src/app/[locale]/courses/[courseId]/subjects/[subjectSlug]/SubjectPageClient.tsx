"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/lib/navigation";
import { GameScreen } from "@/components/layout/GameScreen";
import {
  coursesApi,
  SUBJECT_META,
  type CategorySummary,
  type CourseDetail,
  type Subject,
} from "@/lib/api/courses";

const SUBJECTS = ["algebra", "geometry", "final"] as const;

function isSubject(value: string): value is Subject {
  return (SUBJECTS as readonly string[]).includes(value);
}

// Island accent colours cycle through the mockup palette in order.
const IC_COLORS = ["ic-blue", "ic-gold", "ic-violet", "ic-rose", "ic-teal", "ic-green", "ic-ember"] as const;
const IC_STROKE: Record<(typeof IC_COLORS)[number], string> = {
  "ic-blue": "#5cdcef",
  "ic-gold": "#ffd27a",
  "ic-violet": "#9b8cff",
  "ic-rose": "#ff9ab0",
  "ic-teal": "#33d6c2",
  "ic-green": "#54e0a0",
  "ic-ember": "#ff8a52",
};

function IslandGlyph({ stroke }: { stroke: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M4 22 C8 20 12 24 16 22 C20 20 24 24 28 22" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6 L20 14 L12 14 Z" fill={stroke} opacity=".85" />
      <circle cx="16" cy="17" r="1.6" fill={stroke} />
    </svg>
  );
}

function IslandCard({
  island,
  index,
  courseSlug,
}: {
  island: CategorySummary;
  index: number;
  courseSlug: string;
}) {
  const router = useRouter();
  const unlocked = island.is_unlocked;
  const total = island.topics_count;
  const completed = island.completed_topics;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const color = IC_COLORS[index % IC_COLORS.length];

  return (
    <div
      className={`island-card${unlocked ? "" : " locked"}`}
      onClick={
        unlocked
          ? () => router.push(`/courses/${courseSlug}/categories/${island.slug}`)
          : undefined
      }
      role="button"
      tabIndex={unlocked ? 0 : -1}
      onKeyDown={(e) => {
        if (unlocked && (e.key === "Enter" || e.key === " ")) {
          router.push(`/courses/${courseSlug}/categories/${island.slug}`);
        }
      }}
    >
      {!unlocked && (
        <svg className="island-lock" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="10" width="14" height="11" rx="2.5" fill="#a6c8c2" />
          <path d="M8 10 V7 a4 4 0 0 1 8 0 V10" stroke="#a6c8c2" strokeWidth="2" fill="none" />
        </svg>
      )}
      <div className={`island-ic ${color}`}>
        <IslandGlyph stroke={IC_STROKE[color]} />
      </div>
      <div className="island-body">
        <div className="island-title">{island.title}</div>
        <div className="island-foot">
          <span className="meta">
            {completed} / {total} проходжень
          </span>
          <span className="pct">{progress}%</span>
        </div>
      </div>
      <div className="island-bar">
        <div style={{ width: `${progress}%` }} />
      </div>
    </div>
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

  const router = useRouter();

  const islands = (course?.categories ?? [])
    .filter((cat) => cat.subject === subject)
    .sort((a, b) => a.order_index - b.order_index);

  const title = subject ? SUBJECT_META[subject].title : "Розділ";

  return (
    <GameScreen>
      <section className="view active">
        <div className="path-head">
          <button
            className="back"
            onClick={() => router.push(`/courses/${courseId}`)}
            aria-label="Назад"
          >
            ←
          </button>
          <div>
            <h2>{title}</h2>
            <div className="ps">Обери острівець</div>
          </div>
        </div>

        {loading && <div className="league-empty">Завантаження…</div>}

        {!loading && (
          <div className="island-list">
            {islands.map((island, i) => (
              <IslandCard key={island.slug} island={island} index={i} courseSlug={courseId} />
            ))}
            {islands.length === 0 && <div className="league-empty">Острови ще не додані</div>}
          </div>
        )}
      </section>
    </GameScreen>
  );
}
