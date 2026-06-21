import type { CharacterSkin } from "@/types/avatars";
import { api } from "./client";

export const avatarsApi = {
  listSkins: () => api.get<CharacterSkin[]>("/api/v1/avatars/skins/"),

  equipSkin: (code: string) =>
    api.post<CharacterSkin[]>(`/api/v1/avatars/skins/${encodeURIComponent(code)}/equip/`),
};
