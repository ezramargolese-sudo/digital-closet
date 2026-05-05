# Digital Closet

Mobile-first wardrobe app: snap your clothes, build outfits, get a "what should I wear?" suggestion that knows the weather. Vacation mode for trip closets, social features to share looks with friends, full sign-up flow with usernames.

Stack: **Next.js 15 + TypeScript + Tailwind + Quicksand**, backed by **Supabase Auth + Postgres + Storage**, hosted on **Vercel** with auto-deploy on `git push`.

## Deploy walkthrough (~10 min)

### 1. Create the Supabase project

1. [supabase.com](https://supabase.com) → sign in with GitHub → **New project**.
2. Name it `digital-closet`, pick a strong DB password, choose the closest region.
3. Wait ~2 min.

### 2. Run the database migrations

In **SQL Editor** → **New query**, paste and run each of these in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_extras_and_auth.sql`

You'll have these tables: `items`, `outfits`, `trips`, `profiles`, `friend_requests`, `friendships`, `notifications`.

### 3. Storage bucket

**Storage** → **New bucket** → name it `closet` → **Public bucket** ON → **Save**.

### 4. Auth settings (optional)

**Authentication → Providers → Email** → toggle "Confirm email" OFF if you want signup to log you in immediately. Leave ON in production.

### 5. Env vars

**Project Settings → API**, copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` *(server-only secret)*

### 6. Run locally

```bash
cp .env.local.example .env.local   # paste the three values
npm install
npm run dev
```

Open `http://localhost:3000` → you'll land on the welcome screen → sign up.

### 7. Push to GitHub

```bash
git add . && git commit -m "ready to deploy"
# create a private repo at https://github.com/new
git remote add origin https://github.com/YOUR_USER/digital-closet.git
git branch -M main
git push -u origin main
```

### 8. Deploy on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import the repo.
2. Add the three env vars under **Environment Variables**.
3. Deploy. Done — share the `*.vercel.app` URL.

### The fix-and-update loop

```bash
git commit -am "fix: ..." && git push
```
Vercel rebuilds in ~60 sec, next page load shows the new version.

## What's in the app

### Auth & onboarding
- Welcome / "hello." landing screen on first visit
- Sign up: email, password, first name, last name, **unique username** (live availability check)
- Login, logout, server-side session via Supabase SSR cookies
- All app routes are gated by middleware — unauthenticated visitors land on welcome

### Home — "How can I help today?"
- Greeting by first name + time of day
- Hub with one big card ("What should I wear?") and four smaller ones (Add to closet, My closet, My outfits, Trips)
- Compact weather chip in the top-right corner (geolocation + Open-Meteo)
- Notification bell with unread badge
- "What should I wear" mode: pick an occasion (Casual, Formal, Gym, Vacation, Going Out, **School**, **Meetings**), get a weather-aware outfit suggestion, save as outfit

### Closet
- Add items via camera or photo library (Supabase Storage)
- Each item: name, color, brand, **size**, **price**, category, warmth, style tags
- **Total closet value** badge at the top of the closet screen (sums prices)
- Edit, delete, mark "worn today"

### Outfits
- Combine items into named looks with style + **multiple seasons** (spring/summer/fall/winter)
- **"Worn count" plus button** on every outfit card and detail screen — tap to bump, count is shown next to it; bumping also stamps each item's last-worn timestamp
- Filter list by season
- Favorite outfits

### Trips (Vacation mode)
- Trip closet with destination + dates + packed items
- Packing checklist with progress bar (per-trip in localStorage)
- "Build outfit from trip" tab generates suggestions from packed items only

### Social
- **Friends** tab: send requests by `@username`, see incoming requests, accept/decline
- View any friend's saved outfits at `/friends/<username>`
- **Notifications** tab: friend request received, friend request accepted
- Reciprocal request auto-accepts (you both wanted to be friends)

### Account
- Profile card (initials avatar, name, @username, email)
- Quick links to closet/outfits/trips/friends/notifications
- Sign out

## Theme

Custom palette: `#190019` `#2b124c` `#522b5b` `#854f6c` `#dfb6b2` `#fbe4d8`. Tailwind tokens: `ink`, `plum`, `mauve`, `rose`, `blush`, `cream`. Font: **Quicksand** (rounded, clean) via `next/font/google`.

## Project structure

```
digital-closet/
├── supabase/migrations/
│   ├── 0001_init.sql
│   └── 0002_extras_and_auth.sql
├── src/
│   ├── middleware.ts                # gates routes by auth
│   ├── app/
│   │   ├── layout.tsx               # mobile shell + Quicksand
│   │   ├── globals.css              # theme + hero gradient
│   │   ├── welcome/page.tsx         # "hello." landing
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── page.tsx                 # home hub + "what should I wear"
│   │   ├── closet/                  # closet grid + add/edit
│   │   ├── outfits/                 # outfits + builder + detail (worn count)
│   │   ├── trips/                   # vacation mode
│   │   ├── friends/                 # friends list + friend profile
│   │   ├── notifications/page.tsx
│   │   ├── account/page.tsx
│   │   └── api/
│   │       ├── auth/                # signup, login, logout, username check
│   │       ├── items/, outfits/, trips/   # CRUD + /wear bump
│   │       ├── friends/             # list, send request, accept/decline, friend's outfits
│   │       ├── notifications/, profile/
│   │       ├── upload/, suggest/, weather/
│   ├── components/                  # BottomNav, Header, ItemCard, ItemPicker, EmptyState
│   └── lib/
│       ├── supabase.ts              # admin + SSR clients + currentUser/requireUser
│       ├── api-helpers.ts           # error → JSON
│       ├── db.ts                    # CRUD against Supabase, scoped by user_id
│       ├── suggest.ts               # outfit suggestion engine
│       └── types.ts
└── package.json
```

## API

Every route is server-side, scoped to the authenticated user via Supabase SSR cookies.

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/api/auth/signup` | email, password, firstName, lastName, username |
| `POST` | `/api/auth/login` | email, password |
| `POST` | `/api/auth/logout` | |
| `GET`  | `/api/auth/username?u=...` | live availability check |
| `GET`  | `/api/profile` | current user's profile |
| `GET`/`POST` | `/api/items` | scoped to current user |
| `GET`/`PATCH`/`DELETE` | `/api/items/[id]` | |
| `POST` | `/api/upload` | multipart `file` → uploads to `closet/<userId>/...` |
| `GET`/`POST` | `/api/outfits` | |
| `GET`/`PATCH`/`DELETE` | `/api/outfits/[id]` | |
| `POST` | `/api/outfits/[id]/wear` | bump worn count + stamp items |
| `GET`/`POST` | `/api/trips` | |
| `GET`/`PATCH`/`DELETE` | `/api/trips/[id]` | |
| `GET`/`POST` | `/api/friends` | list + send request by username |
| `POST` | `/api/friends/requests/[id]` | `{ accept: bool }` |
| `GET`  | `/api/friends/[username]/outfits` | view a friend's outfits |
| `GET`/`POST` | `/api/notifications` | list / mark all read |
| `POST` | `/api/suggest` | weather + style + optional tripId → outfit |
| `GET`  | `/api/weather?lat=..&lon=..` | proxies Open-Meteo |

## Privacy

- The `service_role` key is server-only and never sent to the browser.
- Storage bucket is public-read so phones can render images directly. Object keys are namespaced by user id (`closet/<user-id>/<random>.jpg`) so URLs are unguessable.
- Each user only sees their own items/outfits/trips. Friends only see each other's *outfits* (not raw closet items).
