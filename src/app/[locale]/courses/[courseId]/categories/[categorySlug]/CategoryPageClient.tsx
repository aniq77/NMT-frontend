"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/lib/navigation";
import { GameScreen } from "@/components/layout/GameScreen";
import { coursesApi, type LessonSummary } from "@/lib/api/courses";

type NodeStatus = "golden" | "completed" | "current" | "available" | "locked";

type LessonEntry = LessonSummary & {
  topicSlug: string;
  topicIsUnlocked: boolean;
};

const GOLD_COMPLETIONS = 3;

function getLessonStatus(lesson: LessonEntry, allLessons: LessonEntry[]): NodeStatus {
  if (!lesson.topicIsUnlocked) return "locked";
  // A boss is a single decisive fight: beating it once golds it — no 3-pass
  // mastery grind, so it never shows a "1/3" progress badge.
  if (lesson.is_boss) {
    if (lesson.is_completed || lesson.completion_count >= 1) return "golden";
  } else {
    if (lesson.completion_count >= GOLD_COMPLETIONS) return "golden";
    if (lesson.is_completed) return "completed";
  }
  const firstUncompleted = allLessons.findIndex(
    (l) => l.topicIsUnlocked && !l.is_completed,
  );
  const idx = allLessons.indexOf(lesson);
  if (idx === firstUncompleted) return "current";
  if (idx === firstUncompleted + 1) return "available";
  return "locked";
}

function NodeIcon({ status, isBoss }: { status: NodeStatus; isBoss: boolean }) {
  if (isBoss) {
    return (
      <svg viewBox="0 0 44 44" fill="none">
        <path
          d="M22 8 C13 8 8 15 8 22 C8 27 11 30 13 31 L13 36 L17 33 L20 36 L22 33 L24 36 L27 33 L31 36 L31 31 C33 30 36 27 36 22 C36 15 31 8 22 8 Z"
          fill="#2a1836"
          stroke="#ff9ab0"
          strokeWidth="2"
        />
        <circle cx="17" cy="22" r="3.4" fill="#5ff0db" />
        <circle cx="27" cy="22" r="3.4" fill="#c9b8ff" />
        <path d="M15 12 l-4 -5 M29 12 l4 -5" stroke="#ffcf7a" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === "golden" || status === "completed") {
    return (
      <svg viewBox="0 0 44 44" fill="none">
        <path d="M12 23 L19 30 L33 14" stroke="#54e0a0" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "current") {
    return (
      <svg viewBox="0 0 44 44" fill="none">
        <path d="M22 7 L25.8 16.5 L36 17 L28 23.5 L31 33.5 L22 27.5 L13 33.5 L16 23.5 L8 17 L18.2 16.5 Z" fill="#9b8cff" />
      </svg>
    );
  }
  if (status === "locked") {
    return (
      <svg viewBox="0 0 44 44" fill="none">
        <rect x="14" y="21" width="16" height="12" rx="2.5" fill="#8aa4a0" />
        <path d="M17 21 V16 a5 5 0 0 1 10 0 V21" stroke="#8aa4a0" strokeWidth="3" fill="none" />
      </svg>
    );
  }
  // available
  return (
    <svg viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="6" fill="#7fb8b0" />
    </svg>
  );
}

export default function CategoryPageClient() {
  const params = useParams<{ courseId: string; categorySlug: string }>();
  const { courseId, categorySlug } = params;
  const router = useRouter();

  const [categoryTitle, setCategoryTitle] = useState<string>("");
  const [backHref, setBackHref] = useState(`/courses/${courseId}`);
  const [lessons, setLessons] = useState<LessonEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const trailRef = useRef<HTMLDivElement>(null);
  const vineSvgRef = useRef<SVGSVGElement>(null);
  const vinePathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [course, category] = await Promise.all([
          coursesApi.detail(courseId),
          coursesApi.categoryDetail(courseId, categorySlug),
        ]);

        const catMeta = course.categories.find((c) => c.slug === categorySlug);
        if (catMeta?.subject) {
          setBackHref(`/courses/${courseId}/subjects/${catMeta.subject}`);
        }

        setCategoryTitle(category.title);

        const sortedTopicSummaries = [...category.topics].sort(
          (a, b) => a.order_index - b.order_index,
        );
        const topicDetails = await Promise.all(
          sortedTopicSummaries.map((t) =>
            coursesApi.topicDetail(courseId, categorySlug, t.slug),
          ),
        );

        // Trust the backend: it tracks completion and unlocks topics correctly
        // (a topic opens once the previous one has >= 1 completion).
        const allLessons: LessonEntry[] = topicDetails.flatMap((topic) =>
          [...topic.lessons]
            .sort((a, b) => a.order_index - b.order_index)
            .map((lesson) => ({
              ...lesson,
              topicSlug: topic.slug,
              topicIsUnlocked: topic.is_unlocked,
            })),
        );

        setLessons(allLessons);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, categorySlug]);

  // Serpentine vine connecting node centres — ported from the mockup's drawVine.
  useEffect(() => {
    const draw = () => {
      const trail = trailRef.current;
      const svg = vineSvgRef.current;
      const path = vinePathRef.current;
      if (!trail || !svg || !path) return;
      const tr = trail.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${tr.width} ${tr.height}`);
      const nodes = Array.from(trail.querySelectorAll<HTMLElement>(".node"));
      if (!nodes.length) return;
      const pts = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - tr.left + r.width / 2, y: r.top - tr.top + r.height * 0.42 };
      });
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];
        const cy = (p0.y + p1.y) / 2;
        d += ` C ${p0.x} ${cy}, ${p1.x} ${cy}, ${p1.x} ${p1.y}`;
      }
      path.setAttribute("d", d);
    };
    const t = setTimeout(draw, 60);
    window.addEventListener("resize", draw);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", draw);
    };
  }, [lessons]);

  const goToLesson = (lesson: LessonEntry) =>
    router.push(
      `/courses/${courseId}/categories/${categorySlug}/topics/${lesson.topicSlug}/lessons/${lesson.id}`,
    );

  const doneCount = lessons.filter(
    (l) => l.is_completed || l.completion_count >= 1,
  ).length;

  return (
    <GameScreen>
      <section className="view active">
        <div className="path-head">
          <button className="back" onClick={() => router.push(backHref)} aria-label="Назад">
            ←
          </button>
          <div>
            <h2>{categoryTitle || "Острів"}</h2>
            <div className="ps">
              {doneCount} / {lessons.length} проходжень
            </div>
          </div>
        </div>

        {loading && <div className="league-empty">Завантаження…</div>}

        {!loading && lessons.length > 0 && (
          <div className="trail" ref={trailRef}>
            <svg className="vine-svg" ref={vineSvgRef} preserveAspectRatio="none">
              <path ref={vinePathRef} fill="none" />
            </svg>
            {lessons.map((lesson) => {
              const status = getLessonStatus(lesson, lessons);
              const isBoss = lesson.is_boss;
              const nodeClass = isBoss
                ? "boss-node"
                : status === "golden" || status === "completed"
                  ? "done"
                  : status === "current"
                    ? "current"
                    : status === "locked"
                      ? "locked"
                      : "";
              const clickable = status !== "locked";
              return (
                <div className="lesson" key={lesson.id}>
                  <div
                    className={`node ${nodeClass}`.trim()}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    aria-label={lesson.title}
                    onClick={clickable ? () => goToLesson(lesson) : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") goToLesson(lesson);
                          }
                        : undefined
                    }
                  >
                    <NodeIcon status={status} isBoss={isBoss} />
                  </div>
                  <div className={`lname${status === "locked" ? " lock" : ""}`}>{lesson.title}</div>
                  {status !== "locked" && (
                    <div className="lxp" style={isBoss ? { color: "#ffb3c4" } : undefined}>
                      +{lesson.exp_reward} XP
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && lessons.length === 0 && (
          <div className="league-empty">Острів ще в розробці</div>
        )}
      </section>
    </GameScreen>
  );
}
