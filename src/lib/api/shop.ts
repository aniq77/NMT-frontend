import { api } from "./client";

export type ShopItemType = "energy_refill" | "life_restore" | "exp_boost" | "streak_freeze";
export type ShopItemDelivery = "instant" | "inventory";

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  item_type: ShopItemType;
  delivery: ShopItemDelivery;
  cost_gems: number;
  duration_minutes: number;
};

export type PurchaseResponse = {
  item_name: string;
  item_type: ShopItemType;
  gems_spent: number;
  delivered_to: ShopItemDelivery;
  gems: number;
  energy: number;
  lives: number;
  streak_freezes: number;
  exp_boost_active: boolean;
  exp_boost_until: string | null;
};

export type UserItem = {
  id: string;
  item: ShopItem;
  quantity: number;
  acquired_at: string;
};

export type InventoryUseResponse = {
  item_name: string;
  item_type: ShopItemType;
  remaining_quantity: number;
  gems: number;
  energy: number;
  lives: number;
  streak_freezes: number;
  exp_boost_active: boolean;
  exp_boost_until: string | null;
};

export const shopApi = {
  list: () => api.get<ShopItem[]>("/api/v1/shop/"),

  purchase: (itemId: string) =>
    api.post<PurchaseResponse>(`/api/v1/shop/purchase/${itemId}/`),

  inventory: () => api.get<UserItem[]>("/api/v1/shop/inventory/"),

  useInventoryItem: (userItemId: string) =>
    api.post<InventoryUseResponse>(`/api/v1/shop/inventory/${userItemId}/use/`),
};
