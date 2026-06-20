import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/types/auth";

// Mock the API layer the store depends on, so no real network is touched.
vi.mock("@/lib/api/users", () => ({
  usersApi: {
    getMe: vi.fn(),
    updateMe: vi.fn(),
    restoreStreak: vi.fn(),
  },
}));
vi.mock("@/lib/api/auth", () => ({
  authApi: { logout: vi.fn() },
}));

import { useAuthStore } from "./auth.store";
import { usersApi } from "@/lib/api/users";
import { authApi } from "@/lib/api/auth";

const fakeUser = (over: Partial<User> = {}): User =>
  ({ id: "u1", email: "a@b.c", nickname: "neo", level: 1, ...over }) as User;

beforeEach(() => {
  // Reset to a clean, logged-out state before every test.
  useAuthStore.setState({ user: null, isAuthenticated: false });
  localStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("auth.store — synchronous actions", () => {
  it("setUser marks authenticated when a user is provided", () => {
    useAuthStore.getState().setUser(fakeUser());

    const s = useAuthStore.getState();
    expect(s.user?.id).toBe("u1");
    expect(s.isAuthenticated).toBe(true);
  });

  it("setUser(null) clears authentication", () => {
    useAuthStore.setState({ user: fakeUser(), isAuthenticated: true });

    useAuthStore.getState().setUser(null);

    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it("updateUser merges a partial without dropping existing fields", () => {
    useAuthStore.setState({ user: fakeUser({ gems: 0 }), isAuthenticated: true });

    useAuthStore.getState().updateUser({ gems: 50 });

    const s = useAuthStore.getState();
    expect(s.user?.gems).toBe(50);
    expect(s.user?.email).toBe("a@b.c"); // untouched
  });

  it("updateUser is a no-op when there is no user", () => {
    useAuthStore.getState().updateUser({ gems: 99 });
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe("auth.store — async actions", () => {
  it("fetchMe stores the user from the API and authenticates", async () => {
    vi.mocked(usersApi.getMe).mockResolvedValueOnce(fakeUser({ nickname: "trinity" }));

    await useAuthStore.getState().fetchMe();

    const s = useAuthStore.getState();
    expect(s.user?.nickname).toBe("trinity");
    expect(s.isAuthenticated).toBe(true);
  });

  it("updateNickname persists the server-returned user", async () => {
    vi.mocked(usersApi.updateMe).mockResolvedValueOnce(fakeUser({ nickname: "morpheus" }));

    await useAuthStore.getState().updateNickname("morpheus");

    expect(usersApi.updateMe).toHaveBeenCalledWith({ nickname: "morpheus" });
    expect(useAuthStore.getState().user?.nickname).toBe("morpheus");
  });

  it("restoreStreak replaces the user with the server response", async () => {
    vi.mocked(usersApi.restoreStreak).mockResolvedValueOnce(fakeUser({ streak_days: 7 } as Partial<User>));

    await useAuthStore.getState().restoreStreak();

    expect((useAuthStore.getState().user as unknown as { streak_days: number }).streak_days).toBe(7);
  });
});

describe("auth.store — logout", () => {
  it("clears state after a successful logout", async () => {
    useAuthStore.setState({ user: fakeUser(), isAuthenticated: true });
    vi.mocked(authApi.logout).mockResolvedValueOnce(undefined);

    await useAuthStore.getState().logout();

    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });

  it("still clears state even if the logout request rejects", async () => {
    useAuthStore.setState({ user: fakeUser(), isAuthenticated: true });
    vi.mocked(authApi.logout).mockRejectedValueOnce(new Error("network down"));

    await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();

    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
  });
});
