import type { MetadataRoute } from "next";

const COURSES = ["math-nmt", "geometry"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,               lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/login`,    lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${base}/en`,               lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/en/login`,    lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${base}/en/register`, lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = COURSES.flatMap((courseId) => [
    { url: `${base}/courses/${courseId}`,    lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/en/courses/${courseId}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ]);

  return [...staticRoutes, ...courseRoutes];
}
