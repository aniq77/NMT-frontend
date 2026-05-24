# Payment Testing Guide

## How it works

```
Browser → POST /api/v1/payments/invoice/ (Django, JWT cookie auth)
       ← { invoice_id, page_url }

Browser redirects to Monobank payment page (page_url)
User pays → Monobank calls POST <django-public-url>/api/v1/payments/webhook/
          → Django activates subscription in DB

Browser redirects to /payment-result
Frontend polls GET /api/v1/payments/subscription/ until is_active = true
```

Monobank's webhook call requires Django to have a **public HTTPS URL**. Cloudflare Tunnel provides this for local development.

---

## 1. Prerequisites

| What | Where |
|------|-------|
| Django running | `http://127.0.0.1:8000` |
| Next.js running | `http://localhost:3001` |
| `cloudflared` installed | see step 2 |

**Django `.env` must have:**
```
MONOBANK_TOKEN=<merchant token from Monobank dashboard>
FRONTEND_URL=http://localhost:3001   # where to redirect user after payment
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PRIVATE_MONO_TOKEN=<same merchant token>  # only used if Next.js proxy is needed
```

---

## 2. Install cloudflared

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# or download directly
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

---

## 3. Start Cloudflare Tunnel for Django

Monobank needs to reach Django's webhook endpoint. Expose Django's port:

```bash
cloudflared tunnel --url http://127.0.0.1:8000
```

You'll get output like:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://random-words-here.trycloudflare.com                                               |
+--------------------------------------------------------------------------------------------+
```

Copy that URL — it changes every time you restart.

---

## 4. Configure Django with the tunnel URL

Set the public URL in Django's env so it registers the webhook with Monobank:

```bash
# Django .env / shell export
CLOUDFLARE_TUNNEL_URL=https://random-words-here.trycloudflare.com
```

Django should use this when constructing `webHookUrl` in the Monobank invoice payload:
```python
webhook_url = f"{settings.CLOUDFLARE_TUNNEL_URL}/api/v1/payments/webhook/"
```

Restart Django after updating env.

---

## 5. Verify the tunnel reaches Django

```bash
curl https://random-words-here.trycloudflare.com/api/v1/payments/pricing/
# Should return: {"price_kopecks": 19900, "price_uah": 199.0, "duration_days": 30}
```

---

## 6. Test the payment flow

1. Open `http://localhost:3001`, log in
2. Go to **Profile → Premium підписка** → click **Купити підписку**
3. You should be redirected to Monobank's hosted payment page
4. Use Monobank's **test card**: `4242 4242 4242 4242`, exp `12/25`, CVV `123`
5. Complete payment
6. You should be redirected back to `/payment-result`
7. Page polls `GET /api/v1/payments/subscription/` — once Django's webhook fires, `is_active` becomes `true` and the success screen appears

---

## 7. Check webhook delivery

In Django logs you should see a POST to `/api/v1/payments/webhook/` shortly after payment. If it doesn't arrive:

- Confirm the tunnel URL is still alive (`cloudflared` stays running in terminal)
- Re-check that Django registered the correct `webHookUrl` when creating the invoice — query it in Django shell:

```python
from payments.models import MonobankInvoice
MonobankInvoice.objects.last().__dict__
```

---

## 8. Cancel subscription (smoke test)

```bash
curl -X POST http://127.0.0.1:8000/api/v1/payments/subscription/cancel/ \
  -H "Cookie: access_token=<your-jwt>"
# Returns: {"status": "cancelled", "is_active": true, "expires_at": "..."}
# is_active stays true until the paid period ends
```

Or use the cancel button on the subscription page (visible only when `is_active = true`).

---

## Troubleshooting

| Symptom | Likely cause |
|---------|-------------|
| `401` on `POST /api/v1/payments/invoice/` | Not logged in, or JWT cookie expired — log out and back in |
| Payment page loads but webhook never fires | Tunnel not running / wrong URL registered with Monobank |
| `/payment-result` shows "error" after 20 polls | Webhook didn't fire in time — check Django logs |
| Double-slash in request URL (`//api/v1/...`) | `NEXT_PUBLIC_API_URL` has a trailing slash — remove it |
