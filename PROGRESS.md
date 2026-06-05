# STRIDE Build Progress

## Phase 1 — Foundation ✅ COMPLETE

- [x] Next.js 14 scaffold, Tailwind tokens, font families (Space Grotesk, Inter, Bebas Neue)
- [x] Supabase schema — 5 tables, PostGIS, RLS, capture_territory() RPC, rival auto-assign trigger
- [x] Auth flow — email + Google OAuth login, onboarding (username, avatar, city, colour)
- [x] PWA config — manifest.json, next-pwa, middleware protecting all (app) routes

## Phase 2 — Core Loop ✅ COMPLETE

- [x] Map page — full-screen Google Maps dark theme, territory polygon overlays, FAB, Realtime subscription
- [x] Run active page — GPS tracking, live trail (RunTrail), HUD stats, pause/resume, territory capture RPC

## Phase 3 — Social + Gamification ✅ COMPLETE

- [x] Home page — stats bar (territory/streak/weekly km), stories row, SWR activity feed
- [x] Leaderboard page — city/global/friends toggle, Bebas Neue ranks, self pinned, staggered animation
- [x] Streak system + territory decay Edge Functions (migrations 002 + 003 applied, pg_cron scheduled)
- [x] Rival system — auto-assign trigger, rival territory in danger color, Realtime rival run banner
- [x] Profile page — avatar, stats (km/territory/streak), run history, follow/unfollow with SWR optimistic update

## Phase 4 — Animations & Polish

- [ ] Rive stride animation integration (RiveStride.tsx) — needs stride.riv file
- [ ] Lottie micro-interactions (LottiePlayer.tsx) — needs streak-fire.json file
- [ ] Skeleton loaders on all async content (partially done)
- [ ] Push notifications (Web Push API + Supabase Edge Functions)
- [ ] Run replay animation
- [ ] Personal heatmap
- [ ] Run summary page (currently placeholder)
- [ ] Cloudflare Pages deployment

---

## Bug Fixes Applied (2026-06-05)

### Auth / Onboarding
- **409 on INSERT** — `createUser` changed from `.insert()` to `.upsert({ onConflict: 'id' })`. Re-submitted onboarding no longer conflicts when a previous attempt wrote the row but failed before setting `onboarding_complete` metadata.
- **Race condition** — added `redirecting` guard state; form is disabled while the healing `getUserById` check is in flight.
- **Error messages** — username/email unique constraint violations now show human-readable strings instead of raw Postgres errors.

### Map & GPS
- **GPS showing Delhi** — `getUserCenter()` previously fell back to `DEFAULT_CENTER` (New Delhi) on any failure. Now returns `null` on failure. Map starts at neutral world view (lat 20, lng 0, zoom 3) and only zooms to the user when GPS actually resolves.
- **GPS options improved** — `maximumAge: 60000` (uses cached fix instantly), `enableHighAccuracy: false` (faster), timeout raised to 10s.
- **Locate button** — `⊕` Crosshair FAB added to map page. Shows spinner while fetching, red error toast with specific message if denied/unavailable, centers + zooms map on success.
- **Neon location dot** — `UserLocationDot` component (follows RunTrail pattern): solid `#C8FF00` dot (scale 8) with semi-transparent halo ring (scale 18). Appears on map page when GPS resolves (either on load or via locate button). Follows runner's position tick-by-tick on the run page.
- **`centerMapOnUser`** — now returns `{ error, position }` so callers can both center the map and get the coordinates back for the dot.
- **`onLocationResolved` callback** — added to `MapContainer` props; fires when the background GPS request succeeds on mount.

### Run Page
- **HUD overlapping map** — changed from all-absolute overlay to `flex flex-col h-screen`. RunHUD is now a `flex-shrink-0` block; map fills `flex-1` below it. RunControls stay `absolute bottom-0` within the map section.
- **BottomNav covering RunControls** — `BottomNav` returns `null` on `/run/active`. Full-screen immersive run experience, no nav chrome.
- **Map auto-follows runner** — `useEffect` on `activeRun.coordinates` calls `map.panTo()` + ensures zoom ≥ 15 on every GPS tick.
- **GPS error surfaced** — `useRunTracking` now has a real error callback on `watchPosition`. Sets `gpsError` state with readable message (permission denied / unavailable / timeout). Red banner shown in run page map area when GPS is blocked.
- **Activity feed not updating** — after `insertRun` succeeds, global SWR `mutate` called on `feed-${userId}` and `stats-${userId}` to bust caches. Home page shows the new run immediately on next visit.

### Profile
- **404 on /profile** — BottomNav linked to `/profile` but route is `/profile/[username]`. Created `app/(app)/profile/page.tsx` redirect: fetches current user's profile via SWR, redirects to `/profile/{username}`.
- **Full profile page built** — avatar, username, city, follow/unfollow button (SWR optimistic), 3-column stats (total km / territory / streak), scrollable run history (distance, date, duration, pace per run).
- **`checkIsFollowing` query** — added to `users.ts` using `.maybeSingle()` (avoids 406 when no row exists).

---

## Bug Fixes Applied (2026-06-05, session 4)

### insertRun 400 Bad Request
- **Root cause: `duration_s` float sent to INTEGER DB column** — `(Date.now() - start) / 1000` produces a decimal like `45.321`. PostgREST rejects decimals for INTEGER columns with a 400. Fixed with `Math.round(activeRun.duration_s)` at insert time.
- **Error message was always "Failed to save run"** — Supabase throws `PostgrestError` (a plain object, not an `Error` instance), so `err instanceof Error` was always false. Fixed to check for `err.message` as a string property.

### Distance guard removing test runs from log
- **`distance_m < 10` guard discarded every test run** — since browser GPS doesn't move, every test run was silently skipped. Removed the distance guard; any completed run is now saved regardless of distance. Route is padded to a valid 2-point LineString if GPS produced fewer than 2 coords.

### Stats and activity always showing zero / empty
- **`total_km` always 0** — `getUserStats` was reading `users.total_km`, a column that is NEVER written after onboarding (no code path updates it). Fixed to aggregate `distance_m` directly from the `runs` table, same as `weekly_km` already did.
- **Profile page runs not refreshing** — `runs-${userId}` SWR key was never invalidated after a run. Now `handleStop` also calls `mutate('runs-${userId}')` after `insertRun`. Profile page also got `revalidateOnMount: true` on both runs and stats SWR keys.
- **`insertRun` errors swallowed silently** — catch block previously just did `router.push('/run/summary')` with no indication. Now sets `saveError` state and renders a red banner on the run page showing the actual error message. This makes it possible to diagnose RLS or schema issues.

## Bug Fixes Applied (2026-06-05, session 3)

### Activity feed + run trail
- **Activity not updating after run** — two-part fix: (1) `run/active/page.tsx` now calls `mutate(key, undefined, { revalidate: true })` which clears and re-fetches (previously just `mutate(key)` which could skip refetch inside the 2s dedup window). (2) `home/page.tsx` feed SWR now has `revalidateOnMount: true` so every navigation back to home forces a fresh fetch regardless of cache age.
- **Route thumbnail in activity card** — replaced placeholder div with an SVG rendered from the stored GeoJSON LineString. Coordinates are normalized with uniform scale + centered within the viewport. Start dot (solid accent) and end dot (dim accent) mark the run endpoints.

## Bug Fixes Applied (2026-06-05, session 2)

### Run tracking
- **Duration frozen between GPS ticks** — added a 1-second `setInterval` (`timerRef`) inside `useRunTracking`. Duration and calories now tick every second independently of GPS fire rate. GPS callback still updates all fields on each position event; the timer fills the gaps.
- **Calories formula wrong** — old formula `MET × weight × hours × km` scaled with distance-squared (e.g. 5 km/30 min showed ~1715 kcal instead of ~343). Fixed to use speed-adjusted MET derived from actual pace: `MET ≈ 0.9 × speed_kmh + 1.5` for running zone, capped at 18. Correct formula: `MET(speed) × weight_kg × hours`.
- **distanceRef** added to hook so the 1-second timer can read latest distance without stale closure.

## Known Remaining Issues / Blockers

### Must fix before Phase 4
- [ ] **Run summary page** is still a placeholder — needs actual stats display (distance, pace, duration, territory captured)
- [ ] **Run saves with 0M distance** if GPS permission is denied — need to guard against saving sub-10m runs (already partially guarded: `activeRun.distance_m < 10` check exists in handleStop)

### Assets needed (Phase 4 cannot start without these)
- [ ] `public/icons/icon-192.png` and `icon-512.png` — STRIDE brand icons, dark `#0A0A0A` background
- [ ] `public/animations/stride.riv` — Rive animation file for loader / capture celebration
- [ ] `public/animations/streak-fire.json` — Lottie animation for streak counter

### Nice to have
- [ ] Map page: territory count / area summary chip (how much territory the user owns at a glance)
- [ ] Run page: distance milestone haptic/visual feedback (every 1km)
- [ ] Notifications page is still a placeholder
