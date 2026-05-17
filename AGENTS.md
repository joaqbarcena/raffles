# AGENTS.md

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styles | Tailwind CSS v4 |
| Database | Upstash Redis via `@upstash/redis` (Vercel Marketplace integration) |
| Image export | `html-to-image` (client-side, captures the number grid as PNG) |
| Deploy | Vercel (free tier) |

## Project structure

```
raffle-management/
├── app/
│   ├── page.tsx                        # Dashboard — client component, fetches /api/raffles
│   ├── layout.tsx                      # Root layout (lang="es")
│   ├── api/raffles/route.ts            # GET (list), POST (create) raffles
│   ├── api/raffles/[id]/route.ts       # GET, PUT, DELETE single raffle
│   ├── api/raffles/[id]/participants/  # POST (add), DELETE (remove) participants
│   └── rifa/[id]/page.tsx              # Raffle detail — client component
├── lib/
│   ├── types.ts                        # Raffle, Participant interfaces
│   ├── kv.ts                           # Upstash Redis wrapper (low-level get/set)
│   └── store.ts                        # CRUD functions (listRaffles, addParticipant, etc.)
├── components/
│   ├── CreateRaffleForm.tsx            # Modal form with title, prize, totalNumbers, numbersPerRow
│   ├── NumberGrid.tsx                  # CSS grid of numbers; sold numbers get ✅ + green bg
│   ├── ParticipantForm.tsx             # Name + CSV numbers input; validates duplicates & range
│   ├── ParticipantList.tsx             # Lists participants with their numbers
│   └── ImageExport.tsx                 # Wraps grid, captures as PNG via html-to-image
└── specs/plan.md                       # Full implementation plan
```

## Key conventions

- All pages and API routes use **App Router** conventions.
- API routes use `params: Promise<{ id: string }>` and `await params` (Next.js 16 pattern).
- API routes return `NextResponse.json(...)`.
- Client components use `"use client"` at the top.
- No server components for pages (all data fetching via `fetch` to API routes).
- Spanish UI labels throughout.
- All IDs generated with `uuid`.
- Data stored as a single Redis key `raffle:<id>` containing the full JSON object. IDF set stored at `raffle:ids`.

## Commands

```sh
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Setup for a new environment

1. `npm install`
2. Create Upstash Redis database via **Vercel Dashboard > Storage > Marketplace > Upstash Redis** (free tier: 256MB).
3. Connect to the Vercel project.
4. Run `npx vercel env pull .env.local` to download credentials.
5. `npm run dev`

## Data model

```typescript
Raffle { id, title, prize, totalNumbers, numbersPerRow, createdAt, participants[] }
Participant { id, name, numbers[], createdAt }
```

## Key behaviors

- **Grid configurable**: `totalNumbers` + `numbersPerRow` define the shape (10×10, 8×8, 5×20, etc.)
- **Validation**: Numbers must be 1..totalNumbers, not already sold, not duplicated within the same purchase.
- **Delete raffle**: Button in detail page, prompts confirmation, redirects to `/`.
- **PNG export**: Button below grid, captures the entire grid including title and prize.

## Gotchas

- `@vercel/kv` is deprecated — use `@upstash/redis` instead.
- Vercel KV integration exposes `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars (not `UPSTASH_REDIS_*`). The app reads `KV_*` vars.
- `html-to-image` runs client-side only; the export button won't work without a browser.
- No authentication — single-user app.
- No tests configured yet.
