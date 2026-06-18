import { api } from "./client";

export type ShopItemType = "energy_refill" | "life_restore" | "exp_boost";

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  item_type: ShopItemType;
  cost_gems: number;
  duration_minutes: number;
};

export type PurchaseResponse = {
  item_name: string;
  item_type: ShopItemType;
  gems_spent: number;
  gems: number;
  energy: number;
  lives: number;
  exp_boost_active: boolean;
  exp_boost_until: string | null;
};

export const shopApi = {
  list: () => api.get<ShopItem[]>("/api/v1/shop/"),

  purchase: (itemId: string) =>
    api.post<PurchaseResponse>(`/api/v1/shop/purchase/${itemId}/`),
};
