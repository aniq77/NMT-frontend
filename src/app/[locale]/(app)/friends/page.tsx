"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { GameScreen } from "@/components/layout/GameScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ChallengeModal } from "@/components/pvp/ChallengeModal";
import { ApiError } from "@/lib/api/client";
import {
  friendsApi,
  type FriendRequest,
  type FriendUser,
  type Friendship,
} from "@/lib/api/friends";
import { toast } from "@/store/toast.store";

type Data = {
  friends: Friendship[];
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
};

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: Data };

function displayName(user: FriendUser): string {
  return user.nickname ?? "Гравець";
}

const AV_VARIANTS = ["", "g", "v"];

function XpSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
    </svg>
  );
}

export default function FriendsPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Add-friend modal
  const [addOpen, setAddOpen] = useState(false);
  const [addId, setAddId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Challenge modal
  const [challengeTarget, setChallengeTarget] = useState<FriendUser | null>(null);

  const fetchData = useCallback(() => {
    Promise.all([friendsApi.list(), friendsApi.incoming(), friendsApi.outgoing()])
      .then(([friends, incoming, outgoing]) =>
        setState({ status: "ready", data: { friends, incoming, outgoing } }),
      )
      .catch(() => setState({ status: "error" }));
  }, []);

  const reload = () => {
    setState({ status: "loading" });
    fetchData();
  };

  useEffect(fetchData, [fetchData]);

  const runAction = async (id: string, action: () => Promise<unknown>, successMsg?: string) => {
    setBusyId(id);
    try {
      await action();
      setBusyId(null);
      if (successMsg) toast.success(successMsg);
      fetchData();
    } catch {
      setBusyId(null);
      toast.error("Не вдалося виконати дію");
    }
  };

  const handleAdd = async () => {
    const value = addId.trim();
    if (!value) return;
    setAdding(true);
    setAddError(null);
    try {
      await friendsApi.sendRequest(value);
      setAddSuccess(true);
      setAddId("");
      toast.success("Запит надіслано");
      fetchData();
    } catch (err) {
      setAddError(
        err instanceof ApiError && err.status === 400
          ? "Неможливо надіслати запит цьому користувачу"
          : "Не вдалося надіслати запит",
      );
    } finally {
      setAdding(false);
    }
  };

  const friendsCount = state.status === "ready" ? state.data.friends.length : 0;
  const filteredFriends = useMemo(() => {
    const friends = state.status === "ready" ? state.data.friends : [];
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => displayName(f.friend).toLowerCase().includes(q));
  }, [state, query]);

  const openAdd = () => {
    setAddError(null);
    setAddSuccess(false);
    setAddOpen(true);
  };

  return (
    <GameScreen>
      <section className="view active">
        <div className="path-head">
          <button className="back" onClick={() => router.push("/home")} aria-label="Назад">
            ←
          </button>
          <div>
            <h2>Друзі</h2>
            <div className="ps">Навчайтесь разом — змагайтеся за XP</div>
          </div>
        </div>

        <div className="fr-actions">
          <div className="fr-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <input
              type="text"
              placeholder="Знайти друга за іменем…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="fr-invite" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Додати
          </button>
        </div>

        {state.status === "loading" && <div className="league-empty">Завантаження…</div>}
        {state.status === "error" && (
          <div className="league-empty">
            Не вдалося завантажити друзів.{" "}
            <button className="result-link" onClick={reload} style={{ textDecoration: "underline" }}>
              Спробувати ще раз
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <div className="shop-cat" style={{ marginTop: 4 }}>
              Мої друзі · {friendsCount}
            </div>
            {filteredFriends.length === 0 ? (
              <div className="league-empty">
                {friendsCount === 0
                  ? "У вас ще немає друзів. Додайте друга за його ID."
                  : "Нікого не знайдено."}
              </div>
            ) : (
              <div className="fr-list" style={{ marginBottom: 8 }}>
                {filteredFriends.map((f, i) => (
                  <div className="fr-row" key={f.id}>
                    <div className={`fr-av ${AV_VARIANTS[i % AV_VARIANTS.length]}`.trim()}>
                      {displayName(f.friend).charAt(0).toUpperCase()}
                    </div>
                    <div className="fr-info">
                      <b>{displayName(f.friend)}</b>
                      <span>Рівень {f.friend.level}</span>
                    </div>
                    <div className="fr-xp">
                      <XpSvg /> {f.friend.exp}
                    </div>
                    <button className="fr-add" onClick={() => setChallengeTarget(f.friend)}>
                      Дуель
                    </button>
                    <button
                      className="fr-add"
                      style={{ background: "rgba(255,120,120,.14)", color: "#ff9ab0" }}
                      disabled={busyId === f.friend.id}
                      aria-label="Видалити друга"
                      onClick={() =>
                        runAction(f.friend.id, () => friendsApi.remove(f.friend.id), "Друга видалено")
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {state.data.incoming.length > 0 && (
              <>
                <div className="shop-cat">Вхідні заявки · {state.data.incoming.length}</div>
                <div className="fr-list" style={{ marginBottom: 8 }}>
                  {state.data.incoming.map((r) => (
                    <div className="fr-row" key={r.id}>
                      <div className="fr-av g">{displayName(r.from_user).charAt(0).toUpperCase()}</div>
                      <div className="fr-info">
                        <b>{displayName(r.from_user)}</b>
                        <span>хоче додати вас</span>
                      </div>
                      <button
                        className="fr-add"
                        disabled={busyId === r.id}
                        onClick={() => runAction(r.id, () => friendsApi.accept(r.id), "Тепер ви друзі 🎉")}
                      >
                        Прийняти
                      </button>
                      <button
                        className="fr-add"
                        style={{ background: "rgba(255,120,120,.14)", color: "#ff9ab0" }}
                        disabled={busyId === r.id}
                        aria-label="Відхилити"
                        onClick={() => runAction(r.id, () => friendsApi.decline(r.id))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {state.data.outgoing.length > 0 && (
              <>
                <div className="shop-cat">Вихідні заявки</div>
                <div className="fr-list">
                  {state.data.outgoing.map((r) => (
                    <div className="fr-row" key={r.id}>
                      <div className="fr-av v">{displayName(r.to_user).charAt(0).toUpperCase()}</div>
                      <div className="fr-info">
                        <b>{displayName(r.to_user)}</b>
                        <span>очікує відповіді</span>
                      </div>
                      <button
                        className="fr-add"
                        disabled={busyId === r.id}
                        onClick={() => runAction(r.id, () => friendsApi.cancel(r.id))}
                      >
                        Скасувати
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Add friend modal */}
      <Modal
        open={addOpen}
        onClose={adding ? undefined : () => setAddOpen(false)}
        title="Додати друга"
        size="sm"
      >
        <div className="space-y-4">
          <p className="font-body text-sm text-text-secondary">
            Введіть ID користувача, щоб надіслати запит у друзі.
          </p>
          <Input
            placeholder="ID користувача"
            value={addId}
            onChange={(e) => {
              setAddId(e.target.value);
              setAddSuccess(false);
              setAddError(null);
            }}
          />
          {addError && <p className="font-body text-sm text-wrong-dark">{addError}</p>}
          {addSuccess && <p className="font-body text-sm text-correct-dark">Запит надіслано!</p>}
          <Button className="w-full" loading={adding} disabled={!addId.trim()} onClick={handleAdd}>
            Надіслати запит
          </Button>
        </div>
      </Modal>

      {/* Challenge modal (key forces a fresh reset per target) */}
      <ChallengeModal
        key={challengeTarget?.id ?? "none"}
        target={challengeTarget}
        onClose={() => setChallengeTarget(null)}
      />
    </GameScreen>
  );
}
