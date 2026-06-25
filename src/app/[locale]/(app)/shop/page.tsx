"use client";
import { useCallback, useEffect, useState } from "react";
import { Flame, Gem, Heart, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api/client";
import { shopApi, type PurchaseResponse, type ShopItem, type ShopItemType } from "@/lib/api/shop";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

type IconComp = React.ComponentType<{ className?: string }>;

const ITEM_CONFIG: Record<ShopItemType, { Icon: IconComp; tint: string; bg: string }> = {
  energy_refill: { Icon: Zap, tint: "text-reward-dark", bg: "bg-reward-light" },
  life_restore: { Icon: Heart, tint: "text-wrong-dark", bg: "bg-wrong-light" },
  exp_boost: { Icon: Sparkles, tint: "text-primary-dark", bg: "bg-primary-light" },
  streak_freeze: { Icon: Flame, tint: "text-reward-dark", bg: "bg-reward-light" },
};

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: ShopItem[] };

export default function ShopPage() {
  const { user, updateUser } = useAuthStore();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseResponse | null>(null);

  const fetchItems = useCallback(() => {
    shopApi
      .list()
      .then((items) => setState({ status: "ready", items }))
      .catch(() => setState({ status: "error" }));
  }, []);

  const reload = () => {
    setState({ status: "loading" });
    fetchItems();
  };

  useEffect(fetchItems, [fetchItems]);

  const handleConfirm = async () => {
    if (!selected) return;
    setBuying(true);
    setError(null);
    try {
      const res = await shopApi.purchase(selected.id);
      updateUser({ gems: res.gems, energy: res.energy, lives: res.lives });
      setSelected(null);
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError("Недостатньо кристалів");
      } else {
        setError("Не вдалося завершити покупку. Спробуйте ще раз.");
      }
    } finally {
      setBuying(false);
    }
  };

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4">
        <p className="font-body text-text-secondary">Не вдалося завантажити крамницю</p>
        <Button onClick={reload}>Спробувати ще раз</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3">
          <h1 className="font-display text-base font-800 text-primary-dark">Крамниця</h1>
          <div className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1.5">
            <Gem className="h-4 w-4 text-primary-dark" />
            <span className="font-display text-sm font-700 tabular-nums text-primary-dark">
              {user?.gems ?? 0}
            </span>
          </div>
        </div>
      </header>

      <main className="stagger mx-auto max-w-app space-y-3 px-4 py-6">
        {state.items.length === 0 && (
          <p className="py-12 text-center font-body text-sm text-text-secondary">
            Поки що немає товарів
          </p>
        )}

        {state.items.map((item) => {
          const { Icon, tint, bg } = ITEM_CONFIG[item.item_type];
          const affordable = (user?.gems ?? 0) >= item.cost_gems;
          return (
            <div
              key={item.id}
              className="glass lift flex items-center gap-3 rounded-2xl p-4"
            >
              <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", bg)}>
                <Icon className={cn("h-6 w-6", tint)} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-700 text-text-primary">{item.name}</h3>
                {item.description && (
                  <p className="mt-0.5 font-body text-xs text-text-secondary">{item.description}</p>
                )}
                {item.item_type === "exp_boost" && item.duration_minutes > 0 && (
                  <p className="mt-0.5 font-display text-xs font-600 text-primary">
                    {item.duration_minutes} хв
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant={affordable ? "primary" : "secondary"}
                disabled={!affordable}
                onClick={() => {
                  setError(null);
                  setSelected(item);
                }}
                className="shrink-0"
              >
                <span className="flex items-center gap-1">
                  <Gem className="h-4 w-4" />
                  {item.cost_gems}
                </span>
              </Button>
            </div>
          );
        })}
      </main>

      {/* Purchase confirmation */}
      <Modal
        open={selected !== null}
        onClose={buying ? undefined : () => setSelected(null)}
        title="Підтвердити покупку"
        size="sm"
      >
        {selected && (
          <div className="space-y-4">
            <p className="font-body text-sm text-text-secondary">
              Придбати <span className="font-700 text-text-primary">{selected.name}</span> за{" "}
              {selected.cost_gems} кристалів?
            </p>
            {error && <p className="font-body text-sm text-wrong-dark">{error}</p>}
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" disabled={buying} onClick={() => setSelected(null)}>
                Скасувати
              </Button>
              <Button className="flex-1" loading={buying} onClick={handleConfirm}>
                Купити
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Purchase result */}
      <Modal open={result !== null} onClose={() => setResult(null)} title="Готово!" size="sm">
        {result && (
          <div className="space-y-4 text-center">
            <Sparkles className="pop-in mx-auto h-12 w-12 text-reward" />
            <p className="font-body text-sm text-text-secondary">
              <span className="font-700 text-text-primary">{result.item_name}</span> придбано.
            </p>
            <div className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1.5">
              <Gem className="h-4 w-4 text-primary-dark" />
              <span className="font-display text-sm font-700 text-primary-dark">
                Залишок: {result.gems}
              </span>
            </div>
            <Button className="w-full" onClick={() => setResult(null)}>
              Чудово
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
