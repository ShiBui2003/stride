-- Push subscriptions: stores one Web Push endpoint per device per user
-- Apply in Supabase SQL editor after 003_streak_system.sql

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One row per endpoint; re-subscribing on the same device updates the keys
  UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON public.push_subscriptions (user_id);

-- ============================================================
-- RLS — a user may only read/write their own subscriptions.
-- The Edge Function reads via the service role key, which bypasses RLS.
-- ============================================================
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- DROP-then-CREATE so this migration is safe to re-run
DROP POLICY IF EXISTS "own subscriptions are selectable" ON public.push_subscriptions;
CREATE POLICY "own subscriptions are selectable"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own subscriptions are insertable" ON public.push_subscriptions;
CREATE POLICY "own subscriptions are insertable"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own subscriptions are updatable" ON public.push_subscriptions;
CREATE POLICY "own subscriptions are updatable"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own subscriptions are deletable" ON public.push_subscriptions;
CREATE POLICY "own subscriptions are deletable"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);
