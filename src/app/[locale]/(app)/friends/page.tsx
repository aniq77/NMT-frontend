"use client";
import { useCallback, useEffect, useState } from "react";
import { Check, Swords, Trash2, UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
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
import { cn } from "@/lib/utils";

type Tab = "friends" | "requests";

type Data = {
  friends: Friendship[];
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
};

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: Data };

function FriendName({ user }: { user: FriendUser }) {
  return user.nickname ?? "Гравець";
}

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>("friends");
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await action();
      setBusyId(null);
      fetchData();
    } catch {
      setBusyId(null);
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
        <p className="font-body text-text-secondary">Не вдалося завантажити друзів</p>
        <Button onClick={reload}>Спробувати ще раз</Button>
      </div>
    );
  }

  const { friends, incoming, outgoing } = state.data;
  const incomingCount = incoming.length;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="glass-soft sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3">
          <h1 className="font-display text-base font-800 text-primary-dark">Друзі</h1>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setAddError(null);
              setAddSuccess(false);
              setAddOpen(true);
            }}
          >
            <span className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> Додати
            </span>
          </Button>
        </div>
        <div className="mx-auto flex max-w-app">
          {(["friends", "requests"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 border-b-2 py-2.5 font-display text-sm font-700 transition-colors",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {t === "friends" ? `Друзі (${friends.length})` : "Заявки"}
              {t === "requests" && incomingCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-wrong px-1 text-xs font-700 text-white">
                  {incomingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-app space-y-3 px-4 py-6">
        {tab === "friends" && (
          <>
            {friends.length === 0 ? (
              <p className="py-12 text-center font-body text-sm text-text-secondary">
                У вас ще немає друзів. Додайте друга за його ID.
              </p>
            ) : (
              friends.map((f) => (
                <div
                  key={f.id}
                  className="glass flex items-center gap-3 rounded-2xl p-3"
                >
                  <Avatar
                    name={f.friend.nickname ?? "Гравець"}
                    src={f.friend.custom_avatar_url ?? undefined}
                    level={f.friend.level}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-700 text-text-primary">
                      <FriendName user={f.friend} />
                    </p>
                    <p className="font-body text-xs text-text-secondary">Рівень {f.friend.level}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setChallengeTarget(f.friend)}
                    className="shrink-0"
                  >
                    <span className="flex items-center gap-1">
                      <Swords className="h-4 w-4" /> Дуель
                    </span>
                  </Button>
                  <button
                    type="button"
                    aria-label="Видалити друга"
                    disabled={busyId === f.friend.id}
                    onClick={() => runAction(f.friend.id, () => friendsApi.remove(f.friend.id))}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-wrong-light hover:text-wrong-dark disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {tab === "requests" && (
          <>
            <section>
              <h2 className="mb-2 font-display text-xs font-700 uppercase tracking-widest text-text-secondary">
                Вхідні
              </h2>
              {incoming.length === 0 ? (
                <p className="py-3 font-body text-sm text-text-secondary">Немає вхідних заявок</p>
              ) : (
                <div className="space-y-2">
                  {incoming.map((r) => (
                    <div
                      key={r.id}
                      className="glass flex items-center gap-3 rounded-2xl p-3"
                    >
                      <Avatar
                        name={r.from_user.nickname ?? "Гравець"}
                        src={r.from_user.custom_avatar_url ?? undefined}
                        level={r.from_user.level}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-700 text-text-primary">
                          <FriendName user={r.from_user} />
                        </p>
                        <p className="font-body text-xs text-text-secondary">хоче додати вас</p>
                      </div>
                      <button
                        type="button"
                        aria-label="Прийняти"
                        disabled={busyId === r.id}
                        onClick={() => runAction(r.id, () => friendsApi.accept(r.id))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-correct-light text-correct-dark transition-colors hover:bg-correct hover:text-white disabled:opacity-50"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Відхилити"
                        disabled={busyId === r.id}
                        onClick={() => runAction(r.id, () => friendsApi.decline(r.id))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-wrong-light text-wrong-dark transition-colors hover:bg-wrong hover:text-white disabled:opacity-50"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="pt-2">
              <h2 className="mb-2 font-display text-xs font-700 uppercase tracking-widest text-text-secondary">
                Вихідні
              </h2>
              {outgoing.length === 0 ? (
                <p className="py-3 font-body text-sm text-text-secondary">Немає вихідних заявок</p>
              ) : (
                <div className="space-y-2">
                  {outgoing.map((r) => (
                    <div
                      key={r.id}
                      className="glass flex items-center gap-3 rounded-2xl p-3"
                    >
                      <Avatar
                        name={r.to_user.nickname ?? "Гравець"}
                        src={r.to_user.custom_avatar_url ?? undefined}
                        level={r.to_user.level}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-700 text-text-primary">
                          <FriendName user={r.to_user} />
                        </p>
                        <p className="font-body text-xs text-text-secondary">очікує відповіді</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === r.id}
                        onClick={() => runAction(r.id, () => friendsApi.cancel(r.id))}
                      >
                        Скасувати
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

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
    </div>
  );
}
