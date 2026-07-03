import { api } from "./client";

export type PvPDifficulty = "easy" | "medium" | "hard" | "boss";

export type FriendUser = {
  id: string;
  nickname: string | null;
  custom_avatar_url: string | null;
  active_avatar_type: string;
  level: number;
  exp: number;
};

export type Friendship = {
  id: string;
  friend: FriendUser;
  created_at: string;
};

export type FriendRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export type FriendRequest = {
  id: string;
  from_user: FriendUser;
  to_user: FriendUser;
  status: FriendRequestStatus;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
};

export type PvPChallenge = {
  id: string;
  challenger_id: string;
  challenged_id: string;
  status: "pending" | "accepted" | "declined" | "expired";
  difficulty: PvPDifficulty;
  wager_gems: number;
  expires_at: string;
  created_at: string;
};

export type CreateChallengePayload = {
  challenged_id: string;
  difficulty: PvPDifficulty;
  wager_gems: number;
};

export const friendsApi = {
  list: () => api.get<Friendship[]>("/api/v1/friends/"),

  remove: (userId: string) =>
    api.delete<void>(`/api/v1/friends/${userId}/`),

  sendRequest: (toUserId: string) =>
    api.post<FriendRequest>("/api/v1/friends/requests/", { to_user_id: toUserId }),

  incoming: () =>
    api.get<FriendRequest[]>("/api/v1/friends/requests/incoming/"),

  outgoing: () =>
    api.get<FriendRequest[]>("/api/v1/friends/requests/outgoing/"),

  accept: (requestId: string) =>
    api.post<FriendRequest>(`/api/v1/friends/requests/${requestId}/accept/`),

  decline: (requestId: string) =>
    api.post<FriendRequest>(`/api/v1/friends/requests/${requestId}/decline/`),

  cancel: (requestId: string) =>
    api.post<FriendRequest>(`/api/v1/friends/requests/${requestId}/cancel/`),

  challenge: (payload: CreateChallengePayload) =>
    api.post<PvPChallenge>("/api/v1/pvp/challenge/", payload),
};
