import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/home", "/en/home", "/profile", "/en/profile", "/leaderboard", "/en/leaderboard"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
