/**
 * Payments are off until the backend ships them.
 *
 * The Django project has no `payments` app — the work lives on the unmerged
 * `feat/mono-pay` branch — so every `/api/v1/payments/*` call 404s in
 * production. Until that lands, the UI must not send users into a flow that
 * cannot complete. Set `NEXT_PUBLIC_PAYMENTS_ENABLED=true` to turn it back on.
 */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
