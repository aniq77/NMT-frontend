"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/lib/navigation";
import { GameScreen } from "@/components/layout/GameScreen";
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

/** Ukrainian plural for "острівець" (island). */
function islandWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "острівець";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "острівці";
  return "острівців";
}

function SubjectIcon({ subject }: { subject: Subject }) {
  if (subject === "geometry") {
    return (
      <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
        <polygon points="24,6 42,38 6,38" stroke="var(--violet)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
        <circle cx="24" cy="28" r="10" stroke="var(--violet)" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }
  if (subject === "final") {
    return (
      <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
        <path d="M12 6 V42" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
        <path d="M12 8 H36 L30 15 L36 22 H12 Z" fill="var(--gold)" opacity=".85" stroke="var(--gold)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  // algebra
  return (
    <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
      <path d="M10 15 L20 15 M12.5 15 L12 26 M17.5 15 L17.5 24 C17.5 26 19 26 20 25" stroke="var(--teal-bright)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="28" y1="16" x2="40" y2="16" stroke="var(--teal-bright)" strokeWidth="3" strokeLinecap="round" />
      <line x1="34" y1="10" x2="34" y2="22" stroke="var(--teal-bright)" strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="36" x2="40" y2="36" stroke="var(--teal-bright)" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="32" x2="22" y2="40" stroke="var(--teal-bright)" strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="32" x2="10" y2="40" stroke="var(--teal-bright)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
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
  const total = islands.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const done = progress === 100;
  const modifier = subject === "final" ? "subj-geometry" : `subj-${subject}`;

  return (
    <button
      type="button"
      className={`subj-card ${modifier}`}
      onClick={() => router.push(`/courses/${courseSlug}/subjects/${subject}`)}
    >
      <div className="subj-icon">
        <SubjectIcon subject={subject} />
      </div>
      <div className="subj-name">{meta.title}</div>
      <div className="subj-info">
        {total} {islandWord(total)}
      </div>
      <div className="subj-prog">
        <div className="subj-prog-fill" style={{ width: `${progress}%` }} />
      </div>
      <div
        className="subj-status"
        style={{ color: done ? "var(--green)" : "var(--violet)" }}
      >
        {done ? "Завершено" : `${completed} / ${total} пройдено`}
      </div>
    </button>
  );
}

export default function CoursePageClient() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    coursesApi
      .detail(courseId)
      .then(setCourse)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const router = useRouter();

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
    <GameScreen>
      <section className="view active">
        <div className="path-head">
          <button className="back" onClick={() => router.push("/home")} aria-label="Назад">
            ←
          </button>
          <div>
            <h2>{course?.title ?? "Курс"}</h2>
            <div className="ps">Обери розділ</div>
          </div>
        </div>

        {loading && <div className="league-empty">Завантаження…</div>}

        {!loading && loadError && (
          <div className="league-empty">
            Не вдалося завантажити курс. Перевірте зʼєднання.{" "}
            <button className="result-link" onClick={load} style={{ textDecoration: "underline" }}>
              Спробувати ще раз
            </button>
          </div>
        )}

        {!loading && !loadError && course && subjects.length === 0 && (
          <div className="league-empty">Розділи ще не додані</div>
        )}

        {!loading && course && subjects.length > 0 && (
          <div className="subj-grid">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject}
                subject={subject}
                islands={bySubject[subject]}
                courseSlug={courseId}
              />
            ))}
          </div>
        )}
      </section>
    </GameScreen>
  );
}
