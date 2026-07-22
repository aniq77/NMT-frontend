> ⚠️ **SUPERSEDED — historical brief, not the shipped design.**
> This was the original brief; the app moved to a different direction and this file
> was never updated. Nothing below matches production: the palette is teal
> (`--color-primary: #1f9e92`), not Cosmic Violet `#5C3FE8`; the canvas is
> `transparent`, not `#F7F5FF`; and the display face is **Prata**, not Nunito —
> Nunito is not loaded anywhere in the app.
>
> **Live source of truth:** `src/app/globals.css` for tokens, `src/lib/fonts.ts` for
> fonts, and `src/app/[locale]/journey/game-mockup.css` + `game-app-light.css` for the
> game shell. Kept for the tone/UX intent in the prose, which still holds.

NMT Prep App — Design System Brief for Claude Code

Project overview
A gamified Ukrainian NMT (National Multi-subject Test) exam prep web app. The experience should feel like Duolingo — habit-forming, rewarding, mobile-first — but built natively for Ukrainian students aged 16–18. The tone is a cool older student helping you study, not a formal educational platform.

Color system
Primary palette
--color-primary:       #5C3FE8   /* Cosmic Violet — brand, CTAs, selected states */
--color-primary-light: #EDE8FF   /* Violet 50 — backgrounds, hover fills */
--color-primary-mid:   #C4B8FF   /* Violet 200 — borders, inactive elements */
--color-primary-dark:  #3B2599   /* Violet 800 — text on light violet fills */

--color-correct:       #23A86A   /* Victory Green — correct answer feedback */
--color-correct-light: #EAFAF3   /* Green 50 — correct answer background */
--color-correct-dark:  #165C3A   /* Green 800 — text on green fills */

--color-wrong:         #FF5B4C   /* Error Red — wrong answer, lose a life */
--color-wrong-light:   #FFEAEA   /* Red 50 — wrong answer background */
--color-wrong-dark:    #7A1C1C   /* Red 800 — text on red fills */

--color-reward:        #FFB800   /* XP Gold — streaks, coins, level-up rewards */
--color-reward-light:  #FFF4CC   /* Amber 50 — streak chip background */
--color-reward-dark:   #7A5200   /* Amber 800 — text on gold fills */

--color-canvas:        #F7F5FF   /* App background — barely-there violet tint */
--color-surface:       #FFFFFF   /* Cards, modals, question containers */
--color-surface-alt:   #F0EEFF   /* Selected state fill, subtle highlight */

--color-border:        #E0DCF8   /* Default border — light violet-tinted */
--color-border-strong: #C4B8FF   /* Emphasis border */
Dark mode overrides
--color-canvas:        #1A1033   /* Deep violet-black — not generic #000 */
--color-surface:       #241848   /* Elevated surface in dark mode */
--color-surface-alt:   #2E2060   /* Selected state in dark mode */
--color-border:        #3B2599   /* Dark mode border */
--color-text-primary:  #F0EEFF
--color-text-secondary:#C4B8FF
Semantic usage rules

Primary violet: all interactive elements, progress bars, selected answer states, nav active states
Gold/amber: only for streak count, XP numbers, coin balance, reward notifications
Green: only for correct answer confirmation and success toasts
Red: only for wrong answer confirmation, life loss, and error states
Never use red/green for decorative purposes — reserve them for feedback only
Canvas background (#F7F5FF) everywhere — never plain white as the page background


Typography
Font stack
css--font-display: 'Nunito', 'Rounded Mplus 1c', system-ui, sans-serif;
--font-body:    'Inter', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', monospace;
Load both from Google Fonts. Nunito for all headings, UI labels, button text, mascot dialogue, and any number displays. Inter for question text, answer options, body copy, and explanations.
Type scale
--text-xs:   11px  / line-height 1.4  / Nunito 500  — chips, tags, meta labels
--text-sm:   13px  / line-height 1.5  / Inter 400   — secondary text, hints
--text-base: 15px  / line-height 1.6  / Inter 400   — question text, answer options
--text-md:   17px  / line-height 1.5  / Nunito 600  — section titles, card headers
--text-lg:   22px  / line-height 1.3  / Nunito 700  — screen titles, score displays
--text-xl:   28px  / line-height 1.2  / Nunito 800  — level-up numbers, celebration text
--text-2xl:  38px  / line-height 1.1  / Nunito 800  — streak count hero number
Typography rules

Headings and UI: Nunito always
Question body and answer text: Inter always — critical for legibility of complex Ukrainian text
Number displays (XP, streak, score): Nunito 700–800, tabular-nums
All interface copy in Ukrainian. English only in code, comments, and variable names
Letter spacing: +0.04em on uppercase labels only (chips, section headers in caps)
Never use font-weight below 400 or above 800


Spacing & layout
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
Layout rules

Mobile-first. Base layout designed for 375px viewport minimum
Max content width: 480px, centered — this is fundamentally a mobile app even if built as web
Bottom navigation bar on mobile (fixed, 60px height)
Safe area padding: 16px horizontal on all screens
Card padding: 16px–20px
Vertical rhythm: 16px between most components, 24px between sections


Border radius
--radius-sm:   8px    — tags, chips, small inputs
--radius-md:   12px   — answer option buttons, small cards
--radius-lg:   16px   — main cards, modals, question containers
--radius-xl:   20px   — primary CTA buttons
--radius-full: 9999px — pill buttons, streak badges, circular avatars

Shadows
Minimal. Only functional elevation:
--shadow-card:   0 2px 8px rgba(92, 63, 232, 0.08)
--shadow-modal:  0 8px 32px rgba(92, 63, 232, 0.16)
--shadow-button: 0 4px 12px rgba(92, 63, 232, 0.25)  /* primary button only */
No shadows on flat UI elements. No drop shadows on answer options.
