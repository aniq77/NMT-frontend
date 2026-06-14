const LS_LESSONS = "nmt_lesson_completions";
const LS_CATS = "nmt_category_progress";

function lsRead<T>(key: string): Record<string, T> {
  try {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function lsWrite<T>(key: string, data: Record<string, T>): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {}
}

export type CategoryProgress = {
  completedTopics: number;
  totalTopics: number;
  completedLessons: number;
  totalLessons: number;
};

export const progressStore = {
  setLesson(id: string, count: number): void {
    const d = lsRead<number>(LS_LESSONS);
    d[id] = count;
    lsWrite(LS_LESSONS, d);
  },
  getLesson(id: string): number | null {
    const d = lsRead<number>(LS_LESSONS);
    return id in d ? d[id] : null;
  },
  setCategory(slug: string, progress: CategoryProgress): void {
    const d = lsRead<CategoryProgress>(LS_CATS);
    d[slug] = progress;
    lsWrite(LS_CATS, d);
  },
  getCategory(slug: string): CategoryProgress | null {
    const d = lsRead<CategoryProgress>(LS_CATS);
    return d[slug] ?? null;
  },
};
