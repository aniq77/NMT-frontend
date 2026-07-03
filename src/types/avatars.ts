export type SkinRarity = "default" | "common" | "rare" | "epic" | "legendary";
export type SkinUnlockType = "free" | "level" | "achievement" | "purchase";

export type CharacterSkin = {
  id: string;
  code: string;
  name: string;
  rarity: SkinRarity;
  unlock_type: SkinUnlockType;
  unlock_value: string | null;
  is_default: boolean;
  gradient: string;
  owned: boolean;
  accessible: boolean;
  is_equipped: boolean;
};
