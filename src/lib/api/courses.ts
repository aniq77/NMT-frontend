import { api } from "./client";

export type UserCourseProgress = {
  status: string;
  progress_percent: number;
  started_at: string;
  completed_at: string | null;
};

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  subject: string;
  description: string;
  is_active: boolean;
  categories_count: number;
  user_progress: UserCourseProgress | null;
};

export type Subject = "algebra" | "geometry" | "final";

export const SUBJECT_ORDER: Subject[] = ["algebra", "geometry", "final"];

export const SUBJECT_META: Record<Subject, { title: string; description: string; emoji: string }> = {
  algebra: { title: "Алгебра і початки аналізу", description: "Числа, вирази, рівняння, функції, аналіз", emoji: "🔢" },
  geometry: { title: "Геометрія", description: "Планіметрія, стереометрія, координати і вектори", emoji: "📐" },
  final: { title: "Підсумкові", description: "Змішані острови за весь курс НМТ", emoji: "🏁" },
};

export type CategorySummary = {
  id: string;
  slug: string;
  title: string;
  subject: Subject;
  order_index: number;
  topics_count: number;
  completed_topics: number;
  is_unlocked: boolean;
  is_coming_soon: boolean;
};

export type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  subject: string;
  description: string;
  categories: CategorySummary[];
  user_progress: UserCourseProgress | null;
};

export type TopicSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order_index: number;
  required_completions: number;
  completion_count: number;
  is_gold: boolean;
  is_unlocked: boolean;
  is_coming_soon: boolean;
};

export type CategoryDetail = {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  topics: TopicSummary[];
};

export type LessonSummary = {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  exp_reward: number;
  difficulty: string;
  is_boss: boolean;
  is_completed: boolean;
  completion_count: number;
};

export type TopicDetail = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order_index: number;
  required_completions: number;
  completion_count: number;
  is_gold: boolean;
  is_unlocked: boolean;
  is_coming_soon: boolean;
  lessons: LessonSummary[];
};

export const coursesApi = {
  list: () => api.get<CourseListItem[]>("/api/v1/courses/"),

  detail: (slug: string) => api.get<CourseDetail>(`/api/v1/courses/${slug}/`),

  categoryDetail: (courseSlug: string, categorySlug: string) =>
    api.get<CategoryDetail>(`/api/v1/courses/${courseSlug}/categories/${categorySlug}/`),

  topicDetail: (courseSlug: string, categorySlug: string, topicSlug: string) =>
    api.get<TopicDetail>(
      `/api/v1/courses/${courseSlug}/categories/${categorySlug}/topics/${topicSlug}/`,
    ),
};
