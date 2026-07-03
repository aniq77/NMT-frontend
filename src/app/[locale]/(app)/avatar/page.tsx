"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Lock } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { SkinIcon, hasSkinIcon } from "@/components/ui/SkinIcon";
import { useRouter } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import { avatarsApi } from "@/lib/api/avatars";
import type { CharacterSkin, SkinRarity } from "@/types/avatars";

const RARITY_LABELS: Record<SkinRarity, string> = {
  default:   "Базовий",
  common:    "Звичайний",
  rare:      "Рідкісний",
  epic:      "Епічний",
  legendary: "Легендарний",
};

const RARITY_BADGE: Record<SkinRarity, string> = {
  default:   "bg-text-secondary/20 text-text-secondary",
  common:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  rare:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  epic:      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  legendary: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function LockRequirement({ skin }: { skin: CharacterSkin }) {
  if (skin.accessible) return null;
  if (skin.unlock_type === "level" && skin.unlock_value) {
    return (
      <p className="mt-0.5 font-body text-[10px] text-text-secondary/70">
        Рівень {skin.unlock_value}+
      </p>
    );
  }
  return <p className="mt-0.5 font-body text-[10px] text-text-secondary/70">Заблоковано</p>;
}

export default function AvatarPage() {
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();
  const [skins, setSkins] = useState<CharacterSkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipping, setEquipping] = useState<string | null>(null);

  useEffect(() => {
    avatarsApi
      .listSkins()
      .then(setSkins)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleEquip(skin: CharacterSkin) {
    if (!skin.accessible || skin.is_equipped || equipping) return;
    setEquipping(skin.code);
    try {
      const updated = await avatarsApi.equipSkin(skin.code);
      setSkins(updated);
      await fetchMe();
    } catch {
      // silent — user can retry
    } finally {
      setEquipping(null);
    }
  }

  const equippedSkin = skins.find((s) => s.is_equipped);
  const displayGradient = equippedSkin?.gradient ?? user?.equipped_skin?.gradient;
  const displayCode = equippedSkin?.code ?? user?.equipped_skin?.code;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-app items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-2 transition-colors"
            aria-label="Назад"
          >
            <ChevronLeft className="h-5 w-5 text-text-primary" />
          </button>
          <h1 className="font-display text-base font-800 text-primary-dark">Вибір аватара</h1>
        </div>
      </header>

      <main className="mx-auto max-w-app px-4 py-6">
        {/* Preview */}
        <div className="glass mb-6 flex flex-col items-center gap-3 rounded-2xl py-8">
          <Avatar
            name={user?.nickname ?? undefined}
            level={user?.level}
            size="lg"
            gradient={displayGradient}
            icon={
              displayCode && hasSkinIcon(displayCode)
                ? <SkinIcon code={displayCode} className="h-8 w-8" />
                : undefined
            }
          />
          {equippedSkin ? (
            <div className="text-center">
              <p className="font-display text-sm font-700 text-text-primary">{equippedSkin.name}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 font-display text-xs font-600 ${RARITY_BADGE[equippedSkin.rarity]}`}
              >
                {RARITY_LABELS[equippedSkin.rarity]}
              </span>
            </div>
          ) : (
            <p className="font-body text-sm text-text-secondary">Оберіть стиль аватара</p>
          )}
        </div>

        {/* Skin grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass animate-pulse rounded-2xl" style={{ height: 148 }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {skins.map((skin) => {
              const isEquipping = equipping === skin.code;
              return (
                <button
                  key={skin.id}
                  onClick={() => handleEquip(skin)}
                  disabled={!skin.accessible || skin.is_equipped || !!equipping}
                  className={[
                    "glass flex flex-col items-center gap-2 rounded-2xl px-2 pb-4 pt-5 transition-all",
                    skin.is_equipped
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-canvas"
                      : skin.accessible
                        ? "hover:scale-[1.03] active:scale-[0.97]"
                        : "opacity-50 cursor-not-allowed",
                    isEquipping ? "opacity-70" : "",
                  ].join(" ")}
                >
                  {/* Skin circle */}
                  <div className="relative">
                    <div
                      className="h-14 w-14 rounded-full border-2 border-[var(--glass-line)] shadow-soft flex items-center justify-center"
                      style={{ backgroundImage: skin.gradient }}
                    >
                      {hasSkinIcon(skin.code) ? (
                        <SkinIcon code={skin.code} className="h-8 w-8" />
                      ) : (
                        <span className="font-display text-lg font-700 text-white">
                          {(user?.nickname ?? "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Lock overlay */}
                    {!skin.accessible && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-canvas/70 backdrop-blur-[1px]">
                        <Lock className="h-4 w-4 text-text-secondary" />
                      </div>
                    )}

                    {/* Equipped checkmark */}
                    {skin.is_equipped && (
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-soft">
                        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <p className="font-display text-xs font-700 text-text-primary leading-tight text-center">
                    {skin.name}
                  </p>

                  <span
                    className={`rounded-full px-1.5 py-0.5 font-display text-[10px] font-600 ${RARITY_BADGE[skin.rarity]}`}
                  >
                    {RARITY_LABELS[skin.rarity]}
                  </span>

                  <LockRequirement skin={skin} />
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
