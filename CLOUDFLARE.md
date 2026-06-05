# Deploying STRIDE to Cloudflare Pages

STRIDE is a full Next.js 14 App Router app with middleware and dynamic SSR routes.
It **cannot** use `output: 'export'` (static export), so it deploys via the official
**`@cloudflare/next-on-pages`** adapter, which compiles the app to run on Cloudflare's
Edge runtime.

The repo is already configured (`wrangler.toml`, `next.config.mjs`). The only thing not
done is installing the adapter — it is **not** in PROMPT.md's package list, so it was left
for explicit approval.

## One-time: install the adapter

```bash
npm install -D @cloudflare/next-on-pages
```

(Optional, for local preview: `npm install -g wrangler`.)

## Build

```bash
npx @cloudflare/next-on-pages
```

This produces `.vercel/output/static` — the directory `wrangler.toml` points Pages at.
`CF_PAGES=1` is set automatically on Cloudflare, which disables next-pwa during that build
(its workbox output is incompatible with the Edge runtime) and serves images unoptimized.

## Local preview (optional)

```bash
npx wrangler pages dev .vercel/output/static
```

## Deploy

**Via dashboard (recommended):** connect the Git repo in the Cloudflare Pages dashboard and set:
- Build command: `npx @cloudflare/next-on-pages`
- Build output directory: `.vercel/output/static`
- Root directory: `stride`

**Via CLI:**

```bash
npx wrangler pages deploy .vercel/output/static --project-name stride
```

## Environment variables (set in Pages dashboard → Settings → Environment variables)

Public (safe to expose, must be present at build time):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your Pages URL, e.g. `https://stride.pages.dev`)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

**Never** set service-role or VAPID *private* keys here — those live only as Supabase
function secrets.

## Notes

- The compatibility flag `nodejs_compat` (in `wrangler.toml`) is required for Supabase/Next
  Node built-ins on the Edge runtime.
- After the first deploy, update `NEXT_PUBLIC_APP_URL` and the Supabase Auth redirect URLs
  to the real Pages domain so OAuth login redirects correctly.
