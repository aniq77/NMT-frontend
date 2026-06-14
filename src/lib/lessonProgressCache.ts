import { progressStore } from "./progressStore";

export const lessonProgressCache = {
  set(lessonId: string, completionCount: number) {
    progressStore.setLesson(lessonId, completionCount);
  },
  getCompletionCount(lessonId: string): number | null {
    return progressStore.getLesson(lessonId);
  },
};
