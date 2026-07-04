"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { GameScreen } from "@/components/layout/GameScreen";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api/client";
import {
  shopApi,
  type InventoryUseResponse,
  type PurchaseResponse,
  type ShopItem,
  type ShopItemType,
  type UserItem,
} from "@/lib/api/shop";
import { useAuthStore } from "@/store/auth.store";

const ITEM_UI: Record<ShopItemType, { emoji: string; acc: string; gold: boolean; tag?: string }> = {
  energy_refill: { emoji: "⚡", acc: "acc-gold", gold: true },
  life_restore: { emoji: "❤️", acc: "acc-rose", gold: false },
  exp_boost: { emoji: "⚡", acc: "acc-gold", gold: true, tag: "×2" },
  streak_freeze: { emoji: "🛡️", acc: "acc-violet", gold: false },
};

function GemSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 3h12l4 6-10 12L2 9z" />
    </svg>
  );
}

function XpSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
    </svg>
  );
}

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: ShopItem[] };

type InventoryState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: UserItem[] };

export default function ShopPage() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseResponse | null>(null);
  const [inventoryState, setInventoryState] = useState<InventoryState>({ status: "loading" });
  const [usingItemId, setUsingItemId] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryResult, setInventoryResult] = useState<InventoryUseResponse | null>(null);

  // Hearts are a per-attempt resource, not a persistent consumable — the
  // "restore a life" item is retired, so hide it from the store and inventory.
  const fetchItems = useCallback(() => {
    shopApi
      .list()
      .then((items) =>
        setState({ status: "ready", items: items.filter((i) => i.item_type !== "life_restore") }),
      )
      .catch(() => setState({ status: "error" }));
  }, []);

  const fetchInventory = useCallback(() => {
    shopApi
      .inventory()
      .then((items) =>
        setInventoryState({
          status: "ready",
          items: items.filter((i) => i.item.item_type !== "life_restore"),
        }),
      )
      .catch(() => setInventoryState({ status: "error" }));
  }, []);

  const reload = () => {
    setState({ status: "loading" });
    setInventoryState({ status: "loading" });
    fetchItems();
    fetchInventory();
  };

  useEffect(fetchItems, [fetchItems]);
  useEffect(fetchInventory, [fetchInventory]);

  const handleConfirm = async () => {
    if (!selected) return;
    setBuying(true);
    setError(null);
    try {
      const res = await shopApi.purchase(selected.id);
      updateUser({ gems: res.gems, energy: res.energy, lives: res.lives });
      setSelected(null);
      setResult(res);
      if (res.delivered_to === "inventory") {
        fetchInventory();
      }
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

  const handleUseInventoryItem = async (userItem: UserItem) => {
    setUsingItemId(userItem.id);
    setInventoryError(null);
    setInventoryResult(null);
    try {
      const res = await shopApi.useInventoryItem(userItem.id);
      updateUser({ gems: res.gems, energy: res.energy, lives: res.lives });
      setInventoryResult(res);
      fetchInventory();
    } catch {
      setInventoryError("Не вдалося використати предмет. Спробуйте ще раз.");
    } finally {
      setUsingItemId(null);
    }
  };

  return (
    <GameScreen>
      <section className="view active">
        <div className="path-head">
          <button className="back" onClick={() => router.push("/home")} aria-label="Назад">
            ←
          </button>
          <div>
            <h2>Крамниця</h2>
            <div className="ps">Витрачай кристали з розумом</div>
          </div>
        </div>

        <div className="shop-bal">
          <div className="sb gem">
            <GemSvg /> {user?.gems ?? 0} <small>кристалів</small>
          </div>
          <div className="sb xp">
            <XpSvg /> {user?.exp ?? 0} <small>XP</small>
          </div>
        </div>

        {state.status === "loading" && <div className="league-empty">Завантаження…</div>}
        {state.status === "error" && (
          <div className="league-empty">
            Не вдалося завантажити крамницю.{" "}
            <button className="result-link" onClick={reload} style={{ textDecoration: "underline" }}>
              Спробувати ще раз
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <div className="shop-cat">Бустери</div>
            {state.items.length === 0 ? (
              <div className="league-empty">Поки що немає товарів</div>
            ) : (
              <div className="shop-grid">
                {state.items.map((item) => {
                  const ui = ITEM_UI[item.item_type];
                  const affordable = (user?.gems ?? 0) >= item.cost_gems;
                  return (
                    <div key={item.id} className={`shop-item ${ui.acc}`}>
                      {ui.tag && <span className="si-tag">{ui.tag}</span>}
                      <div className="si-ic">{ui.emoji}</div>
                      <div className="si-name">{item.name}</div>
                      <div className="si-desc">
                        {item.description}
                        {item.item_type === "exp_boost" && item.duration_minutes > 0
                          ? ` (${item.duration_minutes} хв)`
                          : ""}
                      </div>
                      <button
                        className={`si-buy${ui.gold ? " gold" : ""}`}
                        disabled={!affordable}
                        onClick={() => {
                          setError(null);
                          setSelected(item);
                        }}
                      >
                        <GemSvg /> {item.cost_gems}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {inventoryState.status === "ready" && inventoryState.items.length > 0 && (
          <>
            <div className="shop-cat">Мій інвентар</div>
            <div className="shop-grid">
              {inventoryState.items.map((userItem) => {
                const item = userItem.item;
                const ui = ITEM_UI[item.item_type];
                return (
                  <div key={userItem.id} className={`shop-item ${ui.acc}`}>
                    <span className="si-tag">x{userItem.quantity}</span>
                    <div className="si-ic">{ui.emoji}</div>
                    <div className="si-name">{item.name}</div>
                    <div className="si-desc">{item.description}</div>
                    <button
                      className="si-buy"
                      disabled={usingItemId === userItem.id}
                      onClick={() => handleUseInventoryItem(userItem)}
                    >
                      Використати
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {inventoryError && <div className="league-empty">{inventoryError}</div>}
        {inventoryResult && (
          <div className="league-empty" style={{ color: "var(--green)" }}>
            {inventoryResult.item_name} використано.
          </div>
        )}
      </section>

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
            <p className="font-body text-sm text-text-secondary">
              <span className="font-700 text-text-primary">{result.item_name}</span> придбано.
            </p>
            <div className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1.5">
              <span className="font-display text-sm font-700 text-primary-dark">
                Залишок: {result.gems} 💎
              </span>
            </div>
            <Button className="w-full" onClick={() => setResult(null)}>
              Чудово
            </Button>
          </div>
        )}
      </Modal>
    </GameScreen>
  );
}
