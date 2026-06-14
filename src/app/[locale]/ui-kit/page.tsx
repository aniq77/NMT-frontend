"use client";
import { useState } from "react";
import { BrainCircuit, Check, GraduationCap, Hash, Triangle, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatChip } from "@/components/ui/StatChip";
import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { CourseCard } from "@/components/ui/CourseCard";
import { LessonNode } from "@/components/ui/LessonNode";
import { AnswerOption } from "@/components/ui/AnswerOption";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { TheoryBlock, Formula } from "@/components/ui/TheoryBlock";
import { AlgorithmBlock } from "@/components/ui/AlgorithmBlock";
import { Modal } from "@/components/ui/Modal";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="border-b-2 border-border pb-2">
        <h2 className="font-display text-lg font-700 text-text-primary">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Sub({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="font-display text-xs font-600 uppercase tracking-widest text-text-secondary">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

function Swatch({ name, hex, bg }: { name: string; hex: string; bg: string }) {
  return (
    <div className="space-y-1.5">
      <div className={`h-10 w-full rounded-lg border border-black/10 ${bg}`} />
      <p className="font-display text-xs font-700 leading-tight text-text-primary">{name}</p>
      <p className="font-mono text-xs text-text-secondary">{hex}</p>
    </div>
  );
}

export default function UIKitPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [demoAnswer, setDemoAnswer] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-canvas">
      <div className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto max-w-app px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-button">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-base font-800 text-text-primary">UI Kit</h1>
              <p className="font-body text-xs text-text-secondary">NMT App Design System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-app space-y-12 px-4 py-8">

        {/* ── Colors ── */}
        <Section title="Кольори">
          <Sub label="Primary (Cosmic Violet)">
            <div className="grid grid-cols-4 gap-2">
              <Swatch name="Primary"    hex="#5C3FE8" bg="bg-primary" />
              <Swatch name="Light"      hex="#EDE8FF" bg="bg-primary-light" />
              <Swatch name="Mid"        hex="#C4B8FF" bg="bg-primary-mid" />
              <Swatch name="Dark"       hex="#3B2599" bg="bg-primary-dark" />
            </div>
          </Sub>
          <Sub label="Feedback">
            <div className="grid grid-cols-3 gap-2">
              <Swatch name="Correct"       hex="#23A86A" bg="bg-correct" />
              <Swatch name="Correct Light" hex="#EAFAF3" bg="bg-correct-light" />
              <Swatch name="Correct Dark"  hex="#165C3A" bg="bg-correct-dark" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Swatch name="Wrong"       hex="#FF5B4C" bg="bg-wrong" />
              <Swatch name="Wrong Light" hex="#FFEAEA" bg="bg-wrong-light" />
              <Swatch name="Wrong Dark"  hex="#7A1C1C" bg="bg-wrong-dark" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Swatch name="Reward"       hex="#FFB800" bg="bg-reward" />
              <Swatch name="Reward Light" hex="#FFF4CC" bg="bg-reward-light" />
              <Swatch name="Reward Dark"  hex="#7A5200" bg="bg-reward-dark" />
            </div>
          </Sub>
          <Sub label="Surfaces & Text">
            <div className="grid grid-cols-3 gap-2">
              <Swatch name="Canvas"       hex="#F7F5FF" bg="bg-canvas" />
              <Swatch name="Surface"      hex="#FFFFFF" bg="bg-surface" />
              <Swatch name="Surface Alt"  hex="#F0EEFF" bg="bg-surface-alt" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Swatch name="Border"       hex="#E0DCF8" bg="bg-border" />
              <Swatch name="Border Strong" hex="#C4B8FF" bg="bg-border-strong" />
            </div>
          </Sub>
        </Section>

        {/* ── Typography ── */}
        <Section title="Типографіка">
          <Sub label="Display — Nunito">
            <div className="space-y-3">
              <div>
                <p className="font-display text-2xl font-800 text-text-primary">2xl · 38px · 800</p>
                <p className="font-body text-xs text-text-secondary">Великий заголовок</p>
              </div>
              <div>
                <p className="font-display text-xl font-700 text-text-primary">xl · 28px · 700</p>
                <p className="font-body text-xs text-text-secondary">Підзаголовок сторінки</p>
              </div>
              <div>
                <p className="font-display text-lg font-700 text-text-primary">lg · 22px · 700</p>
                <p className="font-body text-xs text-text-secondary">Секція / картка</p>
              </div>
              <div>
                <p className="font-display text-md font-600 text-text-primary">md · 17px · 600</p>
                <p className="font-body text-xs text-text-secondary">Заголовок компонента</p>
              </div>
              <div>
                <p className="font-display text-base font-600 text-text-primary">base · 15px · 600</p>
                <p className="font-body text-xs text-text-secondary">UI елементи</p>
              </div>
              <div>
                <p className="font-display text-sm font-600 text-text-secondary">sm · 13px · 600</p>
                <p className="font-body text-xs text-text-secondary">Допоміжний текст</p>
              </div>
              <div>
                <p className="font-display text-xs font-600 uppercase tracking-widest text-text-secondary">
                  xs · 11px · uppercase · widest
                </p>
                <p className="font-body text-xs text-text-secondary">Мітки полів</p>
              </div>
            </div>
          </Sub>
          <Sub label="Body — Inter">
            <p className="font-body text-base leading-relaxed text-text-primary">
              base · Основний контент. Інтер — шрифт для тексту уроків, теорії та пояснень.
            </p>
            <p className="font-body text-sm leading-relaxed text-text-secondary">
              sm · Допоміжний текст, підказки, описи курсів та деталі.
            </p>
          </Sub>
          <Sub label="Mono — JetBrains Mono">
            <div className="rounded-lg bg-primary-light px-4 py-3">
              <p className="font-mono text-base font-600 text-primary-dark">
                ax² + bx + c = 0 → D = b² − 4ac
              </p>
            </div>
          </Sub>
        </Section>

        {/* ── Buttons ── */}
        <Section title="Кнопки">
          {(["primary", "secondary", "ghost"] as const).map((variant) => (
            <Sub key={variant} label={variant}>
              <div className="flex flex-wrap gap-2">
                <Button variant={variant} size="sm">Малий sm</Button>
                <Button variant={variant} size="md">Середній md</Button>
                <Button variant={variant} size="lg">Великий lg</Button>
                <Button variant={variant} size="md" loading>Loading</Button>
                <Button variant={variant} size="md" disabled>Disabled</Button>
              </div>
            </Sub>
          ))}
        </Section>

        {/* ── Inputs ── */}
        <Section title="Поля вводу">
          <div className="space-y-4">
            <Input placeholder="Без мітки — placeholder тільки" />
            <Input label="Email" placeholder="user@example.com" type="email" />
            <Input
              label="Пароль"
              placeholder="••••••••"
              type="password"
              error="Пароль повинен містити мінімум 8 символів"
            />
            <Input
              label="Ім'я користувача"
              placeholder="@username"
              hint="Видно іншим користувачам"
            />
            <Input label="Вимкнено" placeholder="Недоступне поле" disabled />
          </div>
        </Section>

        {/* ── Progress Bars ── */}
        <Section title="Прогрес-бар">
          <div className="space-y-4">
            {(["primary", "correct", "reward", "wrong"] as const).map((color) => (
              <Sub key={color} label={color}>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-display text-xs text-text-secondary">xs</span>
                    <ProgressBar value={65} color={color} size="xs" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-display text-xs text-text-secondary">sm</span>
                    <ProgressBar value={45} color={color} size="sm" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-display text-xs text-text-secondary">md</span>
                    <ProgressBar value={80} color={color} size="md" className="flex-1" />
                  </div>
                </div>
              </Sub>
            ))}
          </div>
        </Section>

        {/* ── Stat Chips ── */}
        <Section title="Чіпи статистики">
          <Sub label="md (default)">
            <div className="flex flex-wrap gap-2">
              <StatChip type="xp"     value={1250} />
              <StatChip type="gems"   value={83} />
              <StatChip type="lives"  value={5} />
              <StatChip type="streak" value={14} />
            </div>
          </Sub>
          <Sub label="sm">
            <div className="flex flex-wrap gap-1.5">
              <StatChip type="xp"     value={1250} size="sm" />
              <StatChip type="gems"   value={83}   size="sm" />
              <StatChip type="lives"  value={5}    size="sm" />
              <StatChip type="streak" value={14}   size="sm" />
            </div>
          </Sub>
        </Section>

        {/* ── Avatars ── */}
        <Section title="Аватари">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Юрій А" size="sm" />
              <span className="font-display text-xs text-text-secondary">sm / initials</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Марія Ковальчук" size="md" level={7} />
              <span className="font-display text-xs text-text-secondary">md / level</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Олексій Петренко" size="lg" level={23} />
              <span className="font-display text-xs text-text-secondary">lg / level 23</span>
            </div>
          </div>
        </Section>

        {/* ── Tags ── */}
        <Section title="Теги">
          <div className="flex flex-wrap gap-2">
            <Tag>Default</Tag>
            <Tag variant="primary">Primary</Tag>
            <Tag variant="correct">Правильно</Tag>
            <Tag variant="wrong">Неправильно</Tag>
            <Tag variant="reward">Нагорода</Tag>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag size="xs">XS тег</Tag>
            <Tag size="xs" variant="primary">XS primary</Tag>
            <Tag icon={<Triangle className="h-3.5 w-3.5" />}>З іконкою</Tag>
            <Tag variant="correct" icon={<Check className="h-3.5 w-3.5" />}>Успіх</Tag>
            <Tag variant="wrong"   icon={<X     className="h-3.5 w-3.5" />}>Помилка</Tag>
            <Tag variant="reward"  icon={<Zap   className="h-3.5 w-3.5" />}>+50 XP</Tag>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag variant="correct" size="xs">Початковий</Tag>
            <Tag variant="reward" size="xs">Середній</Tag>
            <Tag variant="wrong" size="xs">Складний</Tag>
          </div>
        </Section>

        {/* ── Cards ── */}
        <Section title="Картки">
          <Sub label="padding sm">
            <Card padding="sm">
              <p className="font-body text-sm text-text-secondary">
                Мала картка з padding sm (12px)
              </p>
            </Card>
          </Sub>
          <Sub label="padding md · elevated">
            <Card padding="md" elevated>
              <h3 className="font-display text-base font-700 text-text-primary">Середня картка</h3>
              <p className="mt-1 font-body text-sm text-text-secondary">
                З тінню (elevated) і стандартним відступом (16px)
              </p>
            </Card>
          </Sub>
          <Sub label="padding lg · elevated">
            <Card padding="lg" elevated>
              <h3 className="font-display text-md font-700 text-text-primary">Велика картка</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-text-secondary">
                Більший відступ (24px) для важливого вмісту — теорії, довгих описів, чекпоінтів.
              </p>
            </Card>
          </Sub>
        </Section>

        {/* ── Course Cards ── */}
        <Section title="Картки курсів">
          <Sub label="enrolled · 40% progress">
            <CourseCard
              id="math-nmt"
              icon={<Hash className="h-8 w-8 text-primary" />}
              title="Математика НМТ"
              subject="Алгебра та геометрія"
              description="Повна підготовка до НМТ з математики. Від базових рівнянь до складних задач."
              difficulty="intermediate"
              isEnrolled
              progress={40}
              completedLessons={6}
              totalLessons={15}
            />
          </Sub>
          <Sub label="not enrolled">
            <CourseCard
              id="geometry"
              icon={<Triangle className="h-8 w-8 text-primary" />}
              title="Геометрія"
              subject="Планіметрія і стереометрія"
              description="Трикутники, кола, об'єми тіл обертання та багато іншого для підготовки."
              difficulty="beginner"
              isEnrolled={false}
              progress={0}
              completedLessons={0}
              totalLessons={20}
            />
          </Sub>
          <Sub label="advanced · 100%">
            <CourseCard
              id="advanced"
              icon={<BrainCircuit className="h-8 w-8 text-primary" />}
              title="Підвищений рівень"
              subject="Олімпіадні задачі"
              description="Для тих, хто хоче отримати максимальний бал на НМТ."
              difficulty="advanced"
              isEnrolled
              progress={100}
              completedLessons={20}
              totalLessons={20}
            />
          </Sub>
        </Section>

        {/* ── Lesson Path Nodes ── */}
        <Section title="Вузли шляху уроків">
          <Sub label="Статуси прогресу">
            <div className="flex items-start justify-around gap-2 py-2">
              <LessonNode status="locked"     title="Закрито" />
              <LessonNode status="available"  title="Доступний" />
              <LessonNode status="progress33" title="1 прохід" />
              <LessonNode status="progress66" title="2 проходи" />
              <LessonNode status="mastered"   title="Освоєно" />
            </div>
          </Sub>
          <Sub label="Типи уроків">
            <div className="flex items-start justify-around gap-2 py-2">
              <LessonNode status="available"  lessonType="standard"  title="Урок" />
              <LessonNode status="progress33" lessonType="challenge" title="Виклик" />
              <LessonNode status="mastered"   lessonType="boss"      title="Бос" />
              <LessonNode status="locked"     lessonType="boss"      title="Бос" />
            </div>
          </Sub>
        </Section>

        {/* ── Answer Options ── */}
        <Section title="Варіанти відповіді">
          <div className="space-y-2.5">
            <AnswerOption
              index={0}
              content="Default стан — відповідь ще не обрана"
              state="default"
              onClick={() => setDemoAnswer(0)}
            />
            <AnswerOption
              index={1}
              content="Selected — користувач обрав цей варіант"
              state={demoAnswer === 1 ? "selected" : "default"}
              onClick={() => setDemoAnswer(1)}
            />
            <AnswerOption
              index={2}
              content="Correct — правильна відповідь (показується після перевірки)"
              state="correct"
              disabled
            />
            <AnswerOption
              index={3}
              content="Wrong — неправильна відповідь (показується після перевірки)"
              state="wrong"
              disabled
            />
          </div>
          <p className="font-body text-xs text-text-secondary">
            * Натисни на A або B щоб побачити selected стан
          </p>
        </Section>

        {/* ── Feedback Panels ── */}
        <Section title="Панелі зворотного зв'язку">
          <Sub label="correct">
            <div className="overflow-hidden rounded-xl border border-border">
              <FeedbackPanel
                type="correct"
                explanation="Квадратне рівняння містить x² як старший степінь при ненульовому коефіцієнті."
                xpGained={10}
                onContinue={() => {}}
              />
            </div>
          </Sub>
          <Sub label="wrong">
            <div className="overflow-hidden rounded-xl border border-border">
              <FeedbackPanel
                type="wrong"
                explanation="Перевір: a=1, b=−4, c=3; D = b² − 4ac = 16 − 12 = 4"
                onContinue={() => {}}
              />
            </div>
          </Sub>
        </Section>

        {/* ── Theory Block ── */}
        <Section title="Теоретичний блок">
          <TheoryBlock icon={<Triangle className="h-6 w-6 text-white/90" />} title="Квадратне рівняння">
            <p>
              <strong className="font-600 text-text-primary">Квадратне рівняння</strong> — рівняння
              виду <span className="font-mono font-600 text-primary">ax² + bx + c = 0</span>, де{" "}
              <span className="font-mono text-primary">a ≠ 0</span>.
            </p>
            <Formula>D = b² − 4ac</Formula>
            <div className="space-y-1 rounded-lg bg-surface-alt p-3">
              <p className="font-body text-sm">
                <span className="font-600 text-correct-dark">D &gt; 0</span> — два різних корені
              </p>
              <p className="font-body text-sm">
                <span className="font-600 text-reward-dark">D = 0</span> — один корінь (кратний)
              </p>
              <p className="font-body text-sm">
                <span className="font-600 text-wrong-dark">D &lt; 0</span> — немає дійсних коренів
              </p>
            </div>
          </TheoryBlock>
        </Section>

        {/* ── Algorithm Block ── */}
        <Section title="Алгоритм розв'язання">
          <AlgorithmBlock
            steps={[
              {
                title: "Визнач коефіцієнти",
                description:
                  "Запиши рівняння у стандартній формі ax² + bx + c = 0 та знайди a, b, c",
              },
              {
                title: "Обчисли дискримінант",
                formula: "D = b² − 4ac",
              },
              {
                title: "Проаналізуй знак D",
                description: "D > 0: два корені;  D = 0: один корінь;  D < 0: немає коренів",
              },
              {
                title: "Знайди корені",
                formula: "x₁,₂ = (−b ± √D) / 2a",
              },
            ]}
          />
        </Section>

        {/* ── Modal ── */}
        <Section title="Модальне вікно">
          <Sub label="Натисни щоб відкрити">
            <Button onClick={() => setModalOpen(true)}>Відкрити Modal</Button>
          </Sub>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Підказка до задачі"
          >
            <div className="space-y-4">
              <p className="font-body text-base leading-relaxed text-text-secondary">
                Для рівняння <span className="font-mono font-600 text-primary">x² − 5x + 6 = 0</span>{" "}
                знайди a, b, c та обчисли дискримінант перед тим, як шукати корені.
              </p>
              <div className="rounded-lg bg-primary-light p-3">
                <p className="font-mono text-sm font-600 text-primary-dark">
                  a = 1,  b = −5,  c = 6
                  <br />
                  D = (−5)² − 4·1·6 = 25 − 24 = 1
                </p>
              </div>
              <Button className="w-full" onClick={() => setModalOpen(false)}>
                Зрозуміло!
              </Button>
            </div>
          </Modal>
        </Section>

        <div className="h-8 text-center">
          <p className="font-body text-sm text-text-secondary">
            NMT App · Design System v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
