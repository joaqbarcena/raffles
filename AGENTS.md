# AGENTS.md

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styles | Tailwind CSS v4 |
| Database | Upstash Redis via `@upstash/redis` (Vercel Marketplace integration) |
| Image export | `@vercel/og` (server-side, Edge Runtime, Satori + Sharp) |
| Chat AI | NVIDIA NIM API (OpenAI-compatible, model `meta/llama-3.1-8b-instruct`) |
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
│   ├── api/raffles/[id]/export/route.tsx  # GET — PNG export via @vercel/og (Edge)
│   ├── api/chat/route.ts               # POST — chat endpoint (Serverless)
│   ├── chat/page.tsx                   # Chat UI — client component
│   └── rifa/[id]/page.tsx              # Raffle detail — client component
├── lib/
│   ├── types.ts                        # Raffle, Participant interfaces
│   ├── kv.ts                           # Upstash Redis wrapper (low-level get/set)
│   ├── store.ts                        # CRUD functions (listRaffles, addParticipant, etc.)
│   ├── fonts.ts                        # loadGoogleFont() helper for @vercel/og
│   └── chat.ts                         # Chat orchestration: intent detection + NVIDIA NIM
├── components/
│   ├── CreateRaffleForm.tsx            # Modal form with title, prizes, totalNumbers, numbersPerRow, prices, alias, disclaimer
│   ├── NumberGrid.tsx                  # CSS grid of numbers; sold numbers get emoji + green bg
│   ├── ParticipantForm.tsx             # Name + CSV numbers input; validates duplicates & range
│   ├── ParticipantList.tsx             # Lists participants with their numbers
│   └── ImageExport.tsx                 # Download button, fetches /api/export/[id] as PNG blob
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
5. Add `GEMINI_API_KEY` to `.env.local` (set it to your NVIDIA NIM API key from https://build.nvidia.com).
6. `npm run dev`

## Data model

```typescript
Raffle { id, title, prizes: string[], totalNumbers, numbersPerRow, createdAt, participants[], prices, paymentAlias, disclaimer, soldEmoji }
Participant { id, name, numbers[], createdAt }
```

## Key behaviors

- **Grid configurable**: `totalNumbers` + `numbersPerRow` define the shape (10×10, 8×8, 5×20, etc.)
- **Validation**: Numbers must be 1..totalNumbers, not already sold, not duplicated within the same purchase.
- **Delete raffle**: Button in detail page, prompts confirmation, redirects to `/`.
- **PNG export** via `/api/export/[id]` using Satori + Sharp at the Edge. `const runtime = "edge"`. Gradient banner, blob decorations, Twemoji SVGs for emoji, prize cards, number grid, alias, disclaimer. No CSS Grid (flexbox rows).
- **Emoji selector**: 10 emoji options per raffle, saves via PUT.
- **Chat** at `/chat`: intent detection by regex → action execution → natural response via NVIDIA NIM (OpenAI-compatible API). No function calling — just NL formatting.
- **Migration**: Existing raffles with `prize` (string) are migrated to `prizes` (string[]) on read in store.ts. `soldEmoji` defaults to "🎫".

## Env vars (Vercel)

| Var | Source |
|---|---|
| `KV_REST_API_URL` | Vercel KV integration (auto) |
| `KV_REST_API_TOKEN` | Vercel KV integration (auto) |
| `GEMINI_API_KEY` | User-provided (set manually). Accepts NVIDIA NIM keys (starts with `nvapi-`) |

## Gotchas

- `@vercel/kv` is deprecated — use `@upstash/redis` instead.
- Vercel KV integration exposes `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars (not `UPSTASH_REDIS_*`). The app reads `KV_*` vars.
- Satori (in `@vercel/og`) does NOT support: CSS Grid, `aspectRatio`, emoji text rendering (use Twemoji `<img>` SVGs).
- Edge Function timeout: 30s. Export takes ~4s (font + emoji fetches).
- Serverless Functions default timeout: 10s (Hobby) / 60s (Pro).
- Chat uses Serverless (not Edge) — NVIDIA NIM calls can take ~2s with 8B model.
- The model name is hardcoded in `lib/chat.ts` as `meta/llama-3.1-8b-instruct`.
- No authentication — single-user app.
- No tests configured yet.
