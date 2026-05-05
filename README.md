# Digital Closet

A mobile-first wardrobe app. Snap your clothes, build outfits, get a "what should I wear?" suggestion that knows the weather. Vacation mode lets you pack a trip closet and only build outfits from what you brought.

Next.js 15 + TypeScript + Tailwind, backed by **Supabase** (Postgres + Storage). Hosted on **Vercel** with auto-deploy on `git push`.

## Quick deploy walkthrough (~10 min)

This gets a public URL you can share with anyone. Every `git push` to `main` auto-rebuilds and updates the live site.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → sign in with GitHub → **New project**.
2. Name it `digital-closet`, pick a strong DB password, choose the region nearest you.
3. Wait ~2 min for it to spin up.

### 2. Run the database migration

1. In Supabase, open **SQL Editor** (left sidebar) → **New query**.
2. Paste the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
3. You should see "Success. No rows returned." Three tables (`items`, `outfits`, `trips`) now exist.

### 3. Create the storage bucket

1. **Storage** (left sidebar) → **New bucket** → name it `closet` → toggle **Public bucket** ON → **Save**.
2. (The app stores clothing photos here. Public-bucket means image URLs can be loaded directly by your phone.)

### 4. Grab your env vars

1. **Project Settings** (gear icon, bottom-left) → **API**.
2. Copy two values:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** key under "Project API keys" → this is `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ The `service_role` key bypasses security — server-only, never commit, never expose to the browser.

### 5. Run locally to test

```bash
cp .env.local.example .env.local
# Edit .env.local and paste in your two values
npm install
npm run dev
```

Open `http://localhost:3000`, add a clothing photo, confirm it appears — that means Postgres + Storage are wired correctly.

### 6. Push to GitHub

```bash
# from the digital-closet folder
git init
git add .
git commit -m "initial commit"
# Create a new repo at https://github.com/new (private is fine)
git remote add origin https://github.com/YOUR_USER/digital-closet.git
git branch -M main
git push -u origin main
```

### 7. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New** → **Project**.
2. Pick the `digital-closet` repo → **Import**.
3. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service-role key
4. **Deploy**. ~60 sec later you'll have a URL like `digital-closet-abc.vercel.app`.

Send that URL to your girlfriend. She opens it on her phone → adds it to home screen → uses it like an app.

### 8. The fix-and-update loop

```bash
# Make a code change locally
git commit -am "fix: blah"
git push
```

Vercel rebuilds in ~60 sec, then her next page load gets the new version. No app store, no waiting.

## Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS
- **API**: Next.js route handlers (server-only, use service-role key)
- **Database**: Supabase Postgres
- **Image storage**: Supabase Storage (`closet` bucket, public)
- **Weather**: Open-Meteo (free, no key, server-side proxy at `/api/weather`)
- **Geolocation**: Browser `navigator.geolocation`

## Project structure

```
digital-closet/
├── supabase/migrations/0001_init.sql   # run once in Supabase SQL editor
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # mobile shell + bottom nav
│   │   ├── page.tsx                     # "What should I wear?" home
│   │   ├── closet/                      # closet grid + add/edit
│   │   ├── outfits/                     # outfit list/builder/detail
│   │   ├── trips/                       # vacation mode
│   │   └── api/                         # items, outfits, trips, upload, suggest, weather
│   ├── components/                      # BottomNav, Header, ItemCard, ItemPicker, EmptyState
│   └── lib/
│       ├── supabase.ts                  # admin client (service-role)
│       ├── db.ts                        # CRUD against Supabase
│       ├── suggest.ts                   # outfit suggestion engine
│       └── types.ts
├── .env.local.example
├── next.config.ts
└── package.json
```

## Features

### Closet
- Add items via camera (`<input capture="environment">`) or photo upload — image goes to Supabase Storage
- Each item: name, category (top/bottom/outerwear/shoes/dress/accessory), color, brand, warmth 1–5, style tags
- Edit, delete, mark "worn today"

### Outfit builder
- Combine items into named outfits with a style (casual, formal, gym, vacation, going-out)
- Favorite outfits, edit, "wearing today" stamps every item

### What should I wear?
- Detects location → fetches current weather → suggests an outfit honoring temperature and rain
- Suggestion engine in `src/lib/suggest.ts`:
  - warmth bands by feels-like temperature (≥25°C → light only; <0°C → heavy only)
  - adds outerwear when feels-like < 14°C OR precip% > 50%
  - filters by selected style tag
  - relaxes filter if strict pool is empty
  - 30% chance of dress instead of top/bottom when one matches
- "Save as outfit" creates a named outfit from the suggestion

### Vacation mode
- Create a trip with destination + dates
- Pack items into the trip closet
- "Build outfit" tab generates suggestions only from packed items
- "Packing" tab is a checklist with progress (saved per-trip in `localStorage`)

## API

All routes server-side, all use Supabase service-role key.

| Method | Path | Notes |
|--------|------|-------|
| `GET`  | `/api/items` | list closet |
| `POST` | `/api/items` | create (json) |
| `GET`/`PATCH`/`DELETE` | `/api/items/[id]` | |
| `POST` | `/api/upload` | multipart `file` → uploads to `closet` bucket → `{ url }` |
| `GET`/`POST` | `/api/outfits` | |
| `GET`/`PATCH`/`DELETE` | `/api/outfits/[id]` | |
| `GET`/`POST` | `/api/trips` | |
| `GET`/`PATCH`/`DELETE` | `/api/trips/[id]` | |
| `GET`  | `/api/weather?lat=..&lon=..` | proxies Open-Meteo |
| `POST` | `/api/suggest` | `{ style?, weather?, tripId? }` → outfit |

## Where to extend

- **AI auto-detect** — POST the uploaded image to a vision model (Anthropic, OpenAI) inside `/api/upload` and pre-fill category/color before showing the form.
- **Product link import** — add `POST /api/items/import-url` that fetches the page, scrapes OpenGraph image + title, then runs auto-detect.
- **Multi-user** — add Supabase Auth, add `user_id uuid references auth.users` columns, swap service-role for an SSR client that respects RLS, and write per-user RLS policies.
- **Calendar / wear-log** — new `worn_log` table joining outfits to dates; render as a month view.
- **Recently worn** — already tracked via `last_worn_at`; add a "haven't worn recently" filter to the closet view.

## Notes

- The `service_role` key bypasses RLS. We only ever use it on the server. The browser sees the public Supabase URL (fine) but never the service-role key.
- The `closet` storage bucket is public-read so phones can render images straight from Supabase's CDN. URLs are unguessable (`Date.now()` + 16 hex chars).
- Vercel free tier: 100 GB bandwidth/month + serverless functions. Plenty for two users.
- Supabase free tier: 500 MB DB + 1 GB storage + 50k monthly active users. Plenty for two users.
