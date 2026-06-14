// Client-side cache of lesson completions for the current session.
// Bridges the gap when the backend's topicDetail endpoint returns stale
// is_completed data immediately after a lesson is saved via complete().
const cache = new Map<string, number>(); // lessonId → completion_count

export const lessonProgressCache = {
  set(lessonId: string, completionCount: number) {
    cache.set(lessonId, completionCount);
  },
  getCompletionCount(lessonId: string): number | null {
    const v = cache.get(lessonId);
    return v !== undefined ? v : null;
  },
};
