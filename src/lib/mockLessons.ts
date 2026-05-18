export type Question = {
  text: string;
  answers: string[];
  correct: number;
  explanation: string;
  xp: number;
};

export type AlgoStep = {
  title: string;
  description?: string;
  formula?: string;
};

export type GraphChallengeConfig = {
  prompt: string;
  subprompt: string;
  targetCondition: "two-roots" | "one-root" | "no-roots";
  initialC: number;
  correctExplanation: string;
  wrongExplanation: string;
  xp: number;
};

export type LessonConfig = {
  id: string;
  title: string;
  theoryTitle: string;
  viewer3d?: "sphere" | "cone";
  algorithmSteps: AlgoStep[];
  graphChallenge?: GraphChallengeConfig;
  questions: Question[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Lesson content
// ─────────────────────────────────────────────────────────────────────────────

export const LESSON_CONFIGS: Record<string, LessonConfig> = {
  // ── Математика НМТ ──────────────────────────────────────────────────────────
  "lesson-3": {
    id: "lesson-3",
    title: "Квадратні рівняння",
    theoryTitle: "Квадратне рівняння",
    algorithmSteps: [
      {
        title: "Визнач коефіцієнти",
        description: "Запиши рівняння у стандартній формі ax² + bx + c = 0 та знайди a, b, c",
      },
      { title: "Обчисли дискримінант", formula: "D = b² − 4ac" },
      {
        title: "Проаналізуй знак D",
        description: "D > 0: два корені  |  D = 0: один корінь  |  D < 0: немає коренів",
      },
      { title: "Знайди корені", formula: "x₁,₂ = (−b ± √D) / 2a" },
    ],
    questions: [
      {
        text: "Яке з рівнянь є квадратним?",
        answers: ["3x + 7 = 0", "x³ − 2x + 1 = 0", "2x² − 5x + 3 = 0", "x / 3 = 4"],
        correct: 2,
        explanation: "Квадратне рівняння містить x² як старший степінь при ненульовому коефіцієнті.",
        xp: 10,
      },
      {
        text: "Знайди дискримінант рівняння x² − 4x + 3 = 0",
        answers: ["28", "−4", "4", "16"],
        correct: 2,
        explanation: "a = 1, b = −4, c = 3; D = (−4)² − 4·1·3 = 16 − 12 = 4",
        xp: 10,
      },
      {
        text: "Скільки коренів має рівняння x² + 2x + 5 = 0?",
        answers: ["Два корені", "Один корінь", "Немає коренів", "Нескінченно"],
        correct: 2,
        explanation: "D = 4 − 20 = −16 < 0, тому дійсних коренів немає.",
        xp: 10,
      },
    ],
  },

  "lesson-4": {
    id: "lesson-4",
    title: "Дискримінант",
    theoryTitle: "Дискримінант і парабола",
    algorithmSteps: [
      { title: "Запиши рівняння у стандартній формі", description: "ax² + bx + c = 0, де a ≠ 0" },
      { title: "Обчисли дискримінант", formula: "D = b² − 4ac" },
      {
        title: "Визнач кількість коренів за знаком D",
        description: "D > 0 → 2 корені  |  D = 0 → 1 корінь  |  D < 0 → коренів немає",
      },
      { title: "Знайди корені (якщо D ≥ 0)", formula: "x = (−b ± √D) / 2a" },
    ],
    graphChallenge: {
      prompt: "Перетягни параболу вниз",
      subprompt:
        "Тягни фіолетову крапку (вершину) донизу. Коли парабола перетне вісь X у двох місцях — з'являться зелені крапки.",
      targetCondition: "two-roots",
      initialC: 2.5,
      correctExplanation:
        "Чудово! Коли вершина нижче осі X (c < 0), дискримінант D = −4c > 0 — рівняння x² + c = 0 має два корені.",
      wrongExplanation:
        "Вершина ще вище нуля. Тягни її нижче — поки не з'являться дві зелені крапки на осі X.",
      xp: 15,
    },
    questions: [
      {
        text: "Яке значення дискримінанту для рівняння x² − 6x + 9 = 0?",
        answers: ["36", "0", "−36", "27"],
        correct: 1,
        explanation: "D = (−6)² − 4·1·9 = 36 − 36 = 0. Рівняння має один (кратний) корінь x = 3.",
        xp: 10,
      },
      {
        text: "При якому k рівняння x² + 4x + k = 0 не має дійсних коренів?",
        answers: ["k < 4", "k = 4", "k > 4", "k = 0"],
        correct: 2,
        explanation: "D = 16 − 4k < 0 ⟹ k > 4. При k > 4 дискримінант від'ємний — коренів немає.",
        xp: 15,
      },
    ],
  },

  // ── Геометрія ──────────────────────────────────────────────────────────────
  "lesson-sphere": {
    id: "lesson-sphere",
    title: "Куля",
    theoryTitle: "Куля та її властивості",
    viewer3d: "sphere",
    algorithmSteps: [
      {
        title: "Визнач радіус R",
        description: "Радіус — відстань від центра O до будь-якої точки поверхні кулі",
      },
      { title: "Обчисли об'єм", formula: "V = ⁴⁄₃ · π · R³" },
      { title: "Обчисли площу поверхні", formula: "S = 4 · π · R²" },
      { title: "Довжина великого кола (перерізу)", formula: "L = 2 · π · R" },
    ],
    questions: [
      {
        text: "Чому дорівнює об'єм кулі з радіусом 3?",
        answers: ["36π", "27π", "12π", "108π"],
        correct: 0,
        explanation: "V = (4/3)πR³ = (4/3)·π·27 = 36π",
        xp: 15,
      },
      {
        text: "Площа поверхні кулі з радіусом 5 дорівнює:",
        answers: ["25π", "50π", "75π", "100π"],
        correct: 3,
        explanation: "S = 4πR² = 4·π·25 = 100π",
        xp: 15,
      },
      {
        text: "Переріз кулі площиною через центр — це:",
        answers: ["Еліпс", "Велике коло", "Мале коло", "Парабола"],
        correct: 1,
        explanation:
          "Переріз кулі площиною через центр дає велике коло (великий круг) з радіусом R — найбільший можливий переріз.",
        xp: 10,
      },
    ],
  },

  // ── Геометрія: Конус ──────────────────────────────────────────────────────────
  "lesson-cone": {
    id: "lesson-cone",
    title: "Конус",
    theoryTitle: "Конус та його елементи",
    viewer3d: "cone",
    algorithmSteps: [
      {
        title: "Визнач R (радіус основи) і H (висоту)",
        description: "R — радіус кола в основі, H — перпендикуляр від вершини до основи",
      },
      {
        title: "Знайди твірну L",
        formula: "L = √(R² + H²)",
      },
      {
        title: "Обчисли об'єм",
        formula: "V = ⅓ · π · R² · H",
      },
      {
        title: "Обчисли площу поверхні",
        formula: "S = π · R · (R + L)",
      },
    ],
    questions: [
      {
        text: "Конус має R = 3, H = 4. Чому дорівнює твірна L?",
        answers: ["5", "7", "√7", "25"],
        correct: 0,
        explanation: "L = √(R² + H²) = √(9 + 16) = √25 = 5",
        xp: 15,
      },
      {
        text: "Об'єм конуса з R = 3, H = 7 дорівнює:",
        answers: ["21π", "63π", "9π", "7π"],
        correct: 0,
        explanation: "V = (1/3)·π·R²·H = (1/3)·π·9·7 = 21π",
        xp: 15,
      },
      {
        text: "Переріз конуса площиною через вісь (вісьовий переріз) — це:",
        answers: ["Коло", "Квадрат", "Рівнобедрений трикутник", "Прямокутник"],
        correct: 2,
        explanation:
          "Вісьовий переріз конуса — рівнобедрений трикутник з основою 2R і висотою H. Бічні сторони дорівнюють твірній L.",
        xp: 10,
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Course structure (per-course lesson IDs and pre-completed sets)
// ─────────────────────────────────────────────────────────────────────────────

export const COURSE_LESSON_IDS: Record<string, string[]> = {
  "math-nmt": [
    "lesson-1", "lesson-2", "lesson-3", "lesson-4",
    "lesson-5", "lesson-6", "lesson-7", "lesson-8", "lesson-9",
  ],
  geometry: [
    "geo-1", "lesson-sphere", "lesson-cone",
    "geo-4", "geo-5", "geo-6", "geo-7", "geo-8",
  ],
};

export const COURSE_ALWAYS_COMPLETED: Record<string, string[]> = {
  "math-nmt": ["lesson-1", "lesson-2"],
  geometry:   ["geo-1"],
};
