<!-- Animated banner: to animate the tagline, generate an SVG at https://readme-typing-svg.demolab.com
     and replace the static tagline below with the produced image, e.g.
     ![tagline](https://readme-typing-svg.demolab.com?font=Space+Grotesk&size=22&duration=3000&color=C8FF00&center=true&width=600&lines=Run+the+city.+Take+the+map.) -->

```
 ███████╗████████╗██████╗ ██╗██████╗ ███████╗
 ██╔════╝╚══██╔══╝██╔══██╗██║██╔══██╗██╔════╝
 ███████╗   ██║   ██████╔╝██║██║  ██║█████╗
 ╚════██║   ██║   ██╔══██╗██║██║  ██║██╔══╝
 ███████║   ██║   ██║  ██║██║██████╔╝███████╗
 ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝
```

### Run the city. Close the loop. Take the map.

[![Build](https://img.shields.io/badge/build-passing-C8FF00?style=flat-square)](https://stride-6rm.pages.dev)
[![Deployed on Cloudflare](https://img.shields.io/badge/Cloudflare%20Pages-live-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://stride-6rm.pages.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-888888?style=flat-square)](#license)

STRIDE is a GPS territory conquest game built on real-world running. You go outside, track a route, and when you close a loop back on itself you capture the geographic area inside it as your territory on a live city map. Run through someone else's ground and you clip it off them. The map is a shared, contested battlefield that decays if you stop defending it, so standing still loses you ground. It is Strava meets Splix.io, with the competition layer being the entire point rather than a side feature.

**Live:** https://stride-6rm.pages.dev

## Demo

| Website | PWA-Supported APP |
| --- | --- |
| ![Capturing territory](assets/demo1.gif) | ![Live map and leaderboard](assets/demo2.gif) |

## Features

- **GPS territory capture.** Close a running loop and the enclosed area becomes a PostGIS polygon you own. Area is measured in real square meters.
- **Territory theft.** A new loop that overlaps a rival's ground clips their polygon with ST_Difference and hands you the slice. Pure Splix.io mechanic, played on real geography.
- **Rival system.** Every new runner is auto-assigned a rival from their own city with the closest total distance, highlighted in danger red on the map.
- **Real-time leaderboards.** City, global, and friends views ranked by territory owned, with weekly distance as a secondary sort. Your own rank stays pinned even when you fall outside the top ten.
- **Streaks and decay.** A daily run keeps your streak alive. Any territory left undefended for 48 hours shrinks 10 percent on a cron job, so the map punishes inactivity.
- **Push notifications.** Web Push over a Supabase Edge Function alerts you when territory is stolen, a rival runs, or a streak is at risk.
- **Installable PWA.** Offline shell, home-screen install, and a dark athletic UI that holds 60fps on mobile.
- **Run replay and heatmap.** Replay any past run drawing itself on the map, and see every route you have ever run stacked into a personal heatmap.

## Tech stack

| Library | Purpose | Version |
| --- | --- | --- |
| Next.js (App Router) | Frontend framework and routing | 14.2 |
| TypeScript | Strict typing across the whole codebase | 5.x |
| Tailwind CSS | Utility-first styling with named design tokens | 3.4 |
| Supabase JS / SSR | Auth, database access, session handling | 2.x / 0.10 |
| PostGIS | Polygon storage and spatial operations | via Postgres |
| Google Maps JS API Loader | Map rendering and polygon overlays | 2.x |
| Rive | Stride loader and capture celebration animations | 4.x |
| Lottie | Streak fire and micro-interactions | 3.x |
| next-pwa | Service worker, offline support, Web Push handler | 5.6 |
| SWR | Client data fetching and cache | 2.x |
| date-fns | Date and duration formatting | 4.x |

## Architecture

The frontend is a Next.js App Router application rendered mostly as static pages, with the dynamic profile route running on the Cloudflare Edge runtime. All data access lives in `lib/supabase/queries`, reusable logic in `hooks`, and types in `types`, so components stay presentational.

Supabase is the entire backend. Postgres with PostGIS stores territories as GEOGRAPHY polygons and runs the spatial math directly in SQL through RPC functions. `capture_territory` validates an incoming loop, clips any overlapping enemy polygons, and inserts the new one in a single transaction. Two Edge Functions run the background game loop: `territory-decay` shrinks undefended ground and resets stale streaks on a cron schedule, and `push-notifications` signs and delivers Web Push messages.

Google Maps renders the dark themed battlefield, drawing each territory as a colored polygon overlay and the live GPS trail as a polyline. Realtime subscriptions push territory and rival changes to the map without a refresh. The whole thing ships to Cloudflare Pages through the next-on-pages adapter.

```
Browser (PWA)
  └─ Next.js App Router  ──>  Google Maps overlays (polygons, GPS trail)
        │
        ├─ SWR + hooks ──> lib/supabase/queries
        │                         │
        │                         ▼
        │                  Supabase Postgres + PostGIS
        │                   ├─ capture_territory()  (ST_Intersects / ST_Difference / ST_Area)
        │                   ├─ leaderboard RPCs
        │                   └─ Realtime channels ──> back to the map
        │
        └─ Edge Functions
              ├─ territory-decay   (cron: shrink + streak reset)
              └─ push-notifications (Web Push / VAPID)
```

## Getting started

Requirements: Node 18 or newer, a Supabase project with PostGIS enabled, and a Google Maps API key.

```bash
git clone https://github.com/ShiBui2003/stride.git
cd stride
npm install
```

Create `.env.local` in the project root (see the table below), then apply the database migrations in order through the Supabase SQL editor:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_leaderboard_weekly_km.sql
supabase/migrations/003_streak_system.sql
supabase/migrations/004_push_subscriptions.sql
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000. The PWA service worker is disabled in development, so test offline and push behaviour against a production build:

```bash
npm run build
npm run start
```

## Environment variables

`.env.local` holds the public client keys. The Supabase service role key and the VAPID private key are never placed here; they live as Supabase Edge Function secrets.

| Variable | Description |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon public key |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | Google Maps JS API key |
| NEXT_PUBLIC_APP_URL | Deployed app URL, used for auth redirects |
| NEXT_PUBLIC_VAPID_PUBLIC_KEY | Web Push VAPID public key |

Edge Function secrets, set with `supabase secrets set`:

| Secret | Description |
| --- | --- |
| VAPID_PUBLIC_KEY | Web Push VAPID public key |
| VAPID_PRIVATE_KEY | Web Push VAPID private key |
| VAPID_SUBJECT | Contact URL or mailto for push |

## Deployment

STRIDE deploys to Cloudflare Pages. It is a full App Router app with middleware and a dynamic route, so it builds through the next-on-pages adapter rather than a static export.

| Setting | Value |
| --- | --- |
| Build command | npx @cloudflare/next-on-pages |
| Build output directory | .vercel/output/static |
| Compatibility flag | nodejs_compat |

The five NEXT_PUBLIC variables above are set as build-time environment variables in the Pages dashboard. Pushing to the main branch triggers an automatic build and deploy. Edge Functions are deployed separately with `supabase functions deploy`.

## Database schema

Six tables, all with row level security enabled. Reads for the map and leaderboard are public; writes are restricted to the owning user.

| Table | What it holds |
| --- | --- |
| users | Profile, city, territory color, total km, streak, assigned rival |
| runs | GPS route as a GeoJSON LineString plus distance, pace, duration, calories |
| territories | PostGIS GEOGRAPHY polygon, area in m2, capture and last-defended timestamps |
| follows | Follower and following pairs for the social graph |
| activities | Run-to-feed link with like counts |
| push_subscriptions | Web Push endpoint and keys per device |

## Roadmap

Built and live:

- Auth, onboarding, and protected routing
- Full-screen map with polygon overlays and realtime updates
- GPS run tracking, loop detection, and territory capture
- Territory theft through PostGIS intersection and clipping
- Activity feed, follow system, and leaderboards
- Streak system, territory decay, and rival assignment
- Run replay, personal heatmap, push notifications
- Rive and Lottie animations, PWA, Cloudflare deployment

Next:

- Google OAuth provider on top of the existing email auth
- Wiring the push Edge Function to fire automatically on game events
- Named segments with per-segment fastest-time leaderboards
- Frontend visual redesign

## Author

**Rahul Jha**
BTech Computer Science, Bennett University

- GitHub: https://github.com/ShiBui2003
- LinkedIn: https://linkedin.com/in/rahuljha

## License

MIT
