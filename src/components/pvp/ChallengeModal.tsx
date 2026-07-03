"use client";
import { useState } from "react";
import { Copy, Gem, Swords } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/store/toast.store";
import {
  friendsApi,
  type FriendUser,
  type PvPChallenge,
  type PvPDifficulty,
} from "@/lib/api/friends";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const DIFFICULTIES: { value: PvPDifficulty; label: string }[] = [
  { value: "easy", label: "Легко" },
  { value: "medium", label: "Середньо" },
  { value: "hard", label: "Складно" },
  { value: "boss", label: "Бос" },
];

const WAGERS = [0, 10, 25, 50];

export function ChallengeModal({
  target,
  onClose,
}: {
  target: FriendUser | null;
  onClose: () => void;
}) {
  const { user } = useAuthStore();
  const [difficulty, setDifficulty] = useState<PvPDifficulty>("easy");
  const [wager, setWager] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<PvPChallenge | null>(null);

  const handleSend = async () => {
    if (!target) return;
    setSending(true);
    setError(null);
    try {
      const challenge = await friendsApi.challenge({
        challenged_id: target.id,
        difficulty,
        wager_gems: wager,
      });
      setCreated(challenge);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? "Виклик уже існує або недостатньо кристалів"
          : "Не вдалося надіслати виклик",
      );
    } finally {
      setSending(false);
    }
  };

  const gems = user?.gems ?? 0;

  return (
    <Modal
      open={target !== null}
      onClose={sending ? undefined : onClose}
      title={created ? "Виклик надіслано" : "Виклик на дуель"}
      size="sm"
    >
      {target && !created && (
        <div className="space-y-4">
          <p className="font-body text-sm text-text-secondary">
            Виклик гравцю{" "}
            <span className="font-700 text-text-primary">{target.nickname ?? "Гравець"}</span>
          </p>

          <div>
            <p className="mb-2 font-display text-xs font-700 uppercase tracking-widest text-text-secondary">
              Складність
            </p>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={cn(
                    "rounded-lg border py-2 font-display text-xs font-700 transition-colors",
                    difficulty === d.value
                      ? "border-primary bg-primary-light text-primary-dark"
                      : "border-border bg-surface text-text-secondary hover:border-border-strong",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-display text-xs font-700 uppercase tracking-widest text-text-secondary">
              Ставка
            </p>
            <div className="grid grid-cols-4 gap-2">
              {WAGERS.map((w) => {
                const affordable = gems >= w;
                return (
                  <button
                    key={w}
                    type="button"
                    disabled={!affordable}
                    onClick={() => setWager(w)}
                    className={cn(
                      "flex items-center justify-center gap-1 rounded-lg border py-2 font-display text-xs font-700 transition-colors disabled:opacity-40",
                      wager === w
                        ? "border-primary bg-primary-light text-primary-dark"
                        : "border-border bg-surface text-text-secondary hover:border-border-strong",
                    )}
                  >
                    {w === 0 ? "0" : (
                      <>
                        <Gem className="h-3 w-3" />
                        {w}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="font-body text-sm text-wrong-dark">{error}</p>}

          <Button className="w-full" loading={sending} onClick={handleSend}>
            <span className="flex items-center justify-center gap-2">
              <Swords className="h-4 w-4" /> Надіслати виклик
            </span>
          </Button>
        </div>
      )}

      {created && (
        <div className="space-y-4 text-center">
          <Swords className="mx-auto h-12 w-12 text-primary" />
          <p className="font-body text-sm text-text-secondary">
            Виклик надіслано! Він діє 3 хвилини. Щойно суперник прийме його, бій з’явиться у вкладці
            «Дуелі».
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-surface-alt p-3 text-left">
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs font-600 uppercase tracking-widest text-text-secondary">
                Код виклику
              </p>
              <p className="mt-1 break-all font-mono text-xs text-text-primary">{created.id}</p>
            </div>
            <button
              type="button"
              aria-label="Скопіювати код"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(created.id)
                  .then(() => toast.success("Код скопійовано"))
                  .catch(() => toast.error("Не вдалося скопіювати"));
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-dark transition-colors hover:brightness-95"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <Button className="w-full" onClick={onClose}>
            Закрити
          </Button>
        </div>
      )}
    </Modal>
  );
}
