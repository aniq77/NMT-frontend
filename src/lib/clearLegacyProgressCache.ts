// One-time cleanup of the legacy client-side progress cache.
//
// Early on, lesson/topic progress was mirrored in localStorage to work around a
// backend bug that under-counted lesson scores (a perfect pass was graded
// against the whole question bank and never reached the pass mark). That bug is
// fixed server-side, so the cache is now obsolete and can only show stale/fake
// progress. Remove the old keys once per browser.
const LEGACY_KEYS = ["nmt_lesson_completions", "nmt_category_progress"];
const DONE_FLAG = "nmt_legacy_cache_cleared";

export function clearLegacyProgressCache(): void {
  try {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DONE_FLAG)) return;
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
    localStorage.setItem(DONE_FLAG, "1");
  } catch {
    // localStorage unavailable (private mode / blocked) — nothing to clean.
  }
}
