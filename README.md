# 3D PrintLab LB

Online shop for 3D PrintLab LB: categories, product pages with photos and videos, cart,
cash-on-delivery checkout, a custom-order page that opens WhatsApp, and an admin page to
manage products, categories and orders. Orders can be sent to Wakilni for delivery.

Built with Next.js, hosted on Vercel, data in Supabase.

## What's where

| Path | What it is |
|---|---|
| `/` | Home page |
| `/c/sports`, `/c/everyday-use`, `/c/souvenirs` | Category pages (subcategories show as sections) |
| `/p/<product>` | Product page |
| `/cart`, `/checkout` | Cart and cash-on-delivery checkout |
| `/custom` | Custom orders, goes to WhatsApp |
| `/admin` | Orders, products and categories (password protected) |

Code: shop pages in `src/app/(shop)`, admin in `src/app/admin`, database access in `src/lib/data.ts`,
Wakilni in `src/lib/wakilni.ts`, shop settings in `src/lib/site.ts`, colours in `src/app/globals.css`.

## Run it on your computer

```bash
npm install
cp .env.example .env.local   # fill in what you have; it runs without Supabase in preview mode
npm run dev                  # open http://localhost:3000
```

Without Supabase the site uses the starting catalog in `src/lib/seed.json` and keeps orders in memory.

## Going live (one time)

1. **Supabase** (free): create a project at supabase.com. In SQL Editor, run `supabase/schema.sql`,
   then `supabase/seed.sql` to load the 57 starting products. Copy the project URL and the
   `service_role` key from Project Settings > API.
2. **Vercel** (free): import this GitHub repo at vercel.com/new. Add the variables from `.env.example`
   (at least `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_WHATSAPP_NUMBER`). Deploy.
3. **Domain**: in Vercel > Project > Settings > Domains, add `3dprintlab-lb.com` and follow the DNS
   records it shows, at the registrar where you bought the domain.
4. **Wakilni**: get keys from the Wakilni back office (Settings > Api Tokens). Test with
   `WAKILNI_BASE_URL=https://api-dev.wakilni.com` first, then switch to `https://api.wakilni.com`.

## Day to day

- Add or edit products, photos and videos at `/admin/products`. The first photo is the cover.
- Rename, add or move categories at `/admin/categories`.
- New orders show at `/admin`. Tap the phone number to WhatsApp the customer, update the status, and
  press **Send to Wakilni** (or set `WAKILNI_AUTO_SEND=true`).
- Shop changes show on the site within a minute.

## Wakilni integration status

Written from Wakilni's API docs (wiki.wakilni.com/integrations/api.md) but **not yet tested** against
their servers. Before going live, place a test order with the dev keys and check it appears in
Wakilni's portal with the right cash amount.
