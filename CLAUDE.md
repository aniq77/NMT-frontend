# MathQuest Frontend — Claude Spec

Gamified Ukrainian NMT (НМТ) exam-prep PWA (Duolingo-style). Next.js App Router + TypeScript.

> **Source of truth = `origin/main`** → auto-deployed to **Vercel**. Local checkouts drift
> (feature branches lag behind) — diff against `origin/main`, not local HEAD.
> Backend repo: `yarutiun/NMT-backend` (Django, manual deploy to GCP Cloud Run).

## Stack

- **Next.js 16** (App Router), React 19, TypeScript
- **Tailwind CSS v4** (`@tailwindcss/postcss`), `clsx` + `tailwind-merge` (see `src/lib/utils.ts`)
- **next-intl 4** — i18n `uk` / `en`, locale-prefixed routes (`src/app/[locale]/…`)
- **Zustand 5** — auth store, persisted to `localStorage` key `"auth"`
- **next-themes** — light/dark
- **react-hook-form 7** + **zod 4** — forms/validation
- **Three.js / @react-three/fiber / drei** — 3D visuals
- **@react-oauth/google** — Google sign-in, `lucide-react` icons

## Layout (`src/`)

```
app/[locale]/
  (auth)/        login, register, verify-email
  (onboarding)/  onboarding
  (app)/         home, leaderboard, profile, subscription   ← bottom-nav shell
  courses/[courseId]/categories/[categorySlug]/topics/[topicSlug]/lessons/[lessonId]
  payment-result, ui-kit
components/   auth, layout, onboarding, providers, ui
i18n/         next-intl config            messages/  en.json, uk.json
lib/          api/, navigation.ts, fonts.ts, utils.ts
store/        auth.store.ts               types/
```

## Navigation flow

`/home` → `/courses/{slug}` → `…/categories/{cat}` → `…/topics/{topic}` →
`…/lessons/{lessonId}`. The lesson page calls `lessonsApi.start()` + `lessonsApi.questions()`
and renders real questions (with math/fraction rendering).

## API layer (`src/lib/api/`)

- `client.ts` — base `fetch` wrapper. `credentials: "include"` (JWT is in httpOnly cookies, never
  in JS), auto-refresh on 401, then retry.
- `auth.ts` · `users.ts` · `courses.ts` · `lessons.ts` · `leaderboard.ts` · `payment.ts`

Auth is **cookie-based** — the frontend never reads/stores tokens. The Zustand store holds the
`user` object only (hydrated via `users.getMe()`), not credentials.

## Progress & unlock — TRUST THE BACKEND (hard rule)

Render lesson/topic state purely from the API: `is_unlocked`, `is_completed`,
`completion_count`, `completed_topics`. **Do NOT** reimplement unlock/gold logic on the client
or force-unlock via `localStorage`.

Why: such hacks were already removed. They masked the backend score bug (a passed lesson that the
backend didn't count) by faking progress, which then dropped users into backend-locked lessons →
hard 403s. A lesson showing "locked" means the *previous* topic isn't credited on the backend —
fix it there, not here. Golden lesson node = `completion_count >= 3` (backend-driven).

Error handling on the lesson quiz must distinguish: **403** → "lesson still locked",
**400** → energy gate, empty/other → retryable "couldn't load".

## Design system

See `DESIGN_SYSTEM.md`. Tokens: Primary `#5C3FE8` (Cosmic Violet), Correct `#23A86A`,
Wrong `#FF5B4C`, Reward `#FFB800`, Canvas `#F7F5FF`. Fonts: Nunito (display/UI), Inter (body),
JetBrains Mono. Mobile-first, max width 480px, fixed 60px bottom nav.

## Conventions

- Compose Tailwind classes with the `cn()` helper (`src/lib/utils.ts`), not raw string concat.
- All user-facing strings go through `next-intl` (`messages/{uk,en}.json`) — no hardcoded copy.
- New API calls go through `src/lib/api/` clients, never raw `fetch` in components.
- `lib/mockLessons.ts` is dead/legacy — don't build on it.
