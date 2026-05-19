import { api } from "./client";

export type Pricing = {
  price_kopecks: number;
  price_uah: number;
  duration_days: number;
};

export type Subscription = {
  id: string;
  status: string;
  is_active: boolean;
  started_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
};

export type CreateInvoiceResult = {
  invoice_id: string;
  page_url: string;
};

export const paymentApi = {
  getPricing: () => api.get<Pricing>("/api/v1/payments/pricing/"),
  getSubscription: () => api.get<Subscription>("/api/v1/payments/subscription/"),
  createInvoice: () => api.post<CreateInvoiceResult>("/api/v1/payments/invoice/"),
  cancelSubscription: () => api.post<Subscription>("/api/v1/payments/subscription/cancel/"),
};
