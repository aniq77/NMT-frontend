"use client";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import { useRouter, Link } from "@/lib/navigation";
import { LessonNode } from "@/components/ui/LessonNode";
import { Button } from "@/components/ui/Button";
import { withToken } from "@/lib/dev";

type NodeStatus = "completed" | "current" | "available" | "locked";
type NodeType = "standard" | "challenge" | "checkpoint";

type Lesson = {
  id: string;
  title: string;
  status: NodeStatus;
  type?: NodeType;
  xp: number;
};

type Section = {
  id: string;
  title: string;
  lessons: Lesson[];
};

const SECTIONS: Section[] = [
  {
    id: "sec1",
    title: "Тема 1: Рівняння",
    lessons: [
      { id: "lesson-1", title: "Лінійні рівняння",  status: "completed", xp: 10 },
      { id: "lesson-2", title: "Системи рівнянь",   status: "completed", xp: 10 },
      { id: "lesson-3", title: "Квадратні рівняння", status: "current",   xp: 15 },
      { id: "lesson-4", title: "Дискримінант",       status: "available", xp: 15 },
      { id: "lesson-5", title: "Корені рівнянь",     status: "locked",    xp: 15 },
    ],
  },
  {
    id: "sec2",
    title: "Тема 2: Функції",
    lessons: [
      { id: "lesson-6", title: "Формула коренів",  status: "locked",    xp: 20 },
      { id: "lesson-7", title: "Теорема Вієта",    status: "locked",    xp: 20 },
      { id: "lesson-8", title: "Задачі на корені", status: "locked",    xp: 25 },
      { id: "lesson-9", title: "Підсумковий тест", status: "locked",    xp: 50, type: "checkpoint" },
    ],
  },
];

const COURSE_NAMES: Record<string, string> = {
  "math-nmt": "Математика НМТ",
  geometry:   "Геометрія",
};

export default function CoursePath() {
  const params = useParams<{ courseId: string; locale: string }>();
  const courseId = params.courseId;
  const router = useRouter();
  const courseName = COURSE_NAMES[courseId] ?? "Курс";

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
        {SECTIONS.map((section, sectionIdx) => (
          <div key={section.id} className={sectionIdx > 0 ? "mt-8" : undefined}>
            <div className="mb-6 rounded-xl border border-border bg-surface-alt px-4 py-3 text-center">
              <h2 className="font-display text-base font-700 text-text-primary">{section.title}</h2>
            </div>

            <div className="relative flex flex-col items-center">
              {section.lessons.map((lesson, idx) => (
                <div key={lesson.id} className="flex flex-col items-center">
                  {idx > 0 && <div className="h-6 w-0.5 bg-border" />}

                  {lesson.status === "current" ? (
                    <div className="flex flex-col items-center">
                      <LessonNode
                        status={lesson.status}
                        type={lesson.type ?? "standard"}
                        lessonNumber={idx + 1}
                        title={lesson.title}
                        xp={lesson.xp}
                      />
                      <div className="mt-3 w-52 rounded-xl border border-border bg-surface p-3 text-center shadow-modal">
                        <p className="font-display text-sm font-700 text-text-primary">{lesson.title}</p>
                        <p className="mt-0.5 font-display text-xs font-600 text-reward">
                          +{lesson.xp} XP
                        </p>
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
                      status={lesson.status}
                      type={lesson.type ?? "standard"}
                      lessonNumber={idx + 1}
                      title={lesson.title}
                      xp={lesson.xp}
                      onClick={
                        lesson.status !== "locked"
                          ? () => router.push(withToken(`/courses/${courseId}/lessons/${lesson.id}`))
                          : undefined
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="h-8" />
      </main>
    </div>
  );
}
