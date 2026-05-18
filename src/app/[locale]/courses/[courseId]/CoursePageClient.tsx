"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import { useRouter, Link } from "@/lib/navigation";
import { LessonNode } from "@/components/ui/LessonNode";
import { Button } from "@/components/ui/Button";
import { withToken } from "@/lib/dev";
import { COURSE_LESSON_IDS, COURSE_ALWAYS_COMPLETED } from "@/lib/mockLessons";

type NodeStatus = "completed" | "current" | "available" | "locked";
type NodeType = "standard" | "challenge" | "checkpoint";

type Lesson = {
  id: string;
  title: string;
  type?: NodeType;
  xp: number;
};

type Section = {
  id: string;
  title: string;
  lessons: Lesson[];
};

const SECTIONS_BY_COURSE: Record<string, Section[]> = {
  "math-nmt": [
    {
      id: "sec1",
      title: "Тема 1: Рівняння",
      lessons: [
        { id: "lesson-1", title: "Лінійні рівняння",   xp: 10 },
        { id: "lesson-2", title: "Системи рівнянь",    xp: 10 },
        { id: "lesson-3", title: "Квадратні рівняння", xp: 15 },
        { id: "lesson-4", title: "Дискримінант",        xp: 15 },
        { id: "lesson-5", title: "Корені рівнянь",      xp: 15 },
      ],
    },
    {
      id: "sec2",
      title: "Тема 2: Функції",
      lessons: [
        { id: "lesson-6", title: "Формула коренів",  xp: 20 },
        { id: "lesson-7", title: "Теорема Вієта",    xp: 20 },
        { id: "lesson-8", title: "Задачі на корені", xp: 25 },
        { id: "lesson-9", title: "Підсумковий тест", xp: 50, type: "checkpoint" },
      ],
    },
  ],

  geometry: [
    {
      id: "geo-sec1",
      title: "Тема 1: Тіла обертання",
      lessons: [
        { id: "geo-1",         title: "Циліндр",               xp: 15 },
        { id: "lesson-sphere", title: "Куля",                  xp: 20 },
        { id: "lesson-cone",   title: "Конус",                 xp: 20 },
        { id: "geo-4",         title: "Переріз тіл обертання", xp: 20, type: "challenge" as const },
      ],
    },
    {
      id: "geo-sec2",
      title: "Тема 2: Многогранники",
      lessons: [
        { id: "geo-5", title: "Куб і прямокутний паралелепіпед", xp: 15 },
        { id: "geo-6", title: "Піраміди",                        xp: 20 },
        { id: "geo-7", title: "Призми",                          xp: 20 },
        { id: "geo-8", title: "Підсумковий тест",                xp: 50, type: "checkpoint" },
      ],
    },
  ],
};

const COURSE_NAMES: Record<string, string> = {
  "math-nmt": "Математика НМТ",
  geometry:   "Геометрія",
};

function buildCompleted(courseId: string): Set<string> {
  const base = new Set<string>(COURSE_ALWAYS_COMPLETED[courseId] ?? []);
  if (typeof window === "undefined") return base;
  try {
    const stored = localStorage.getItem("completedLessons");
    if (stored) JSON.parse(stored).forEach((id: string) => base.add(id));
  } catch {}
  return base;
}

function getLessonStatus(lessonId: string, courseId: string, completed: Set<string>): NodeStatus {
  if (completed.has(lessonId)) return "completed";
  const ids = COURSE_LESSON_IDS[courseId] ?? [];
  const idx = ids.indexOf(lessonId);
  if (idx === -1) return "locked";
  const firstUncompleted = ids.findIndex((id) => !completed.has(id));
  if (idx === firstUncompleted)     return "current";
  if (idx === firstUncompleted + 1) return "available";
  return "locked";
}

export default function CoursePageClient() {
  const params     = useParams<{ courseId: string; locale: string }>();
  const courseId   = params.courseId;
  const router     = useRouter();
  const courseName = COURSE_NAMES[courseId] ?? "Курс";
  const sections   = SECTIONS_BY_COURSE[courseId] ?? SECTIONS_BY_COURSE["math-nmt"];

  const [completed, setCompleted] = useState<Set<string>>(
    new Set(COURSE_ALWAYS_COMPLETED[courseId] ?? []),
  );

  useEffect(() => {
    const read = () => setCompleted(buildCompleted(courseId));
    read();
    window.addEventListener("focus", read);
    return () => window.removeEventListener("focus", read);
  }, [courseId]);

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
          <h1 className="font-display text-base font-700 text-text-primary">{courseName}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        {sections.map((section, sectionIdx) => (
          <div key={section.id} className={sectionIdx > 0 ? "mt-8" : undefined}>
            <div className="mb-6 rounded-xl border border-border bg-surface-alt px-4 py-3 text-center">
              <h2 className="font-display text-base font-700 text-text-primary">{section.title}</h2>
            </div>

            <div className="relative flex flex-col items-center">
              {section.lessons.map((lesson, idx) => {
                const status      = getLessonStatus(lesson.id, courseId, completed);
                const isCurrent   = status === "current";
                const isClickable = status !== "locked";

                return (
                  <div key={lesson.id} className="flex flex-col items-center">
                    {idx > 0 && <div className="h-6 w-0.5 bg-border" />}

                    {isCurrent ? (
                      <div className="flex flex-col items-center">
                        <LessonNode
                          status={status}
                          type={lesson.type ?? "standard"}
                          lessonNumber={idx + 1}
                          title={lesson.title}
                          xp={lesson.xp}
                        />
                        <div className="mt-3 w-52 rounded-xl border border-border bg-surface p-3 text-center shadow-modal">
                          <p className="font-display text-sm font-700 text-text-primary">{lesson.title}</p>
                          <p className="mt-0.5 font-display text-xs font-600 text-reward">+{lesson.xp} XP</p>
                          <Button
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() =>
                              router.push(withToken(`/courses/${courseId}/lessons/${lesson.id}`))
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
                        type={lesson.type ?? "standard"}
                        lessonNumber={idx + 1}
                        title={lesson.title}
                        xp={lesson.xp}
                        onClick={
                          isClickable
                            ? () => router.push(withToken(`/courses/${courseId}/lessons/${lesson.id}`))
                            : undefined
                        }
                      />
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
