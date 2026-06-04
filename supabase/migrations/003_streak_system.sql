-- Streak system: trigger on run insert + stale-streak reset function
-- Apply in Supabase SQL editor after 002_leaderboard_weekly_km.sql

-- ============================================================
-- STREAK UPDATE — fires on every run INSERT
-- Increments streak if the gap from last run ≤ 36 h.
-- Resets to 1 if the gap is longer (missed a day).
-- Also accumulates total_km on the user row.
-- ============================================================
CREATE OR REPLACE FUNCTION update_streak_on_run()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_ended_at  TIMESTAMPTZ;
  v_current_streak INTEGER;
BEGIN
  -- Most recent previous run for this user (before the new one started)
  SELECT ended_at INTO v_last_ended_at
  FROM public.runs
  WHERE user_id = NEW.user_id
    AND id <> NEW.id
    AND started_at < NEW.started_at
  ORDER BY started_at DESC
  LIMIT 1;

  SELECT streak_count INTO v_current_streak
  FROM public.users
  WHERE id = NEW.user_id;

  IF v_last_ended_at IS NULL THEN
    -- First run ever: start the streak
    UPDATE public.users
    SET
      streak_count = 1,
      total_km     = total_km + (NEW.distance_m / 1000)
    WHERE id = NEW.user_id;

  ELSIF NEW.started_at - v_last_ended_at <= INTERVAL '36 hours' THEN
    -- Within the grace window: keep the streak alive
    UPDATE public.users
    SET
      streak_count = v_current_streak + 1,
      total_km     = total_km + (NEW.distance_m / 1000)
    WHERE id = NEW.user_id;

  ELSE
    -- Gap too long: reset streak to 1 for this new run
    UPDATE public.users
    SET
      streak_count = 1,
      total_km     = total_km + (NEW.distance_m / 1000)
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_run_inserted_update_streak
  AFTER INSERT ON public.runs
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_on_run();

-- ============================================================
-- RESET STALE STREAKS — called by the territory-decay Edge Function
-- Zeros out streak for anyone who hasn't run in the last 36 hours.
-- ============================================================
CREATE OR REPLACE FUNCTION reset_stale_streaks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET streak_count = 0
  WHERE streak_count > 0
    AND id NOT IN (
      SELECT DISTINCT user_id
      FROM public.runs
      WHERE ended_at >= NOW() - INTERVAL '36 hours'
    );
END;
$$;

-- ============================================================
-- CRON SETUP (requires pg_cron extension)
-- Enable pg_cron in Supabase Dashboard → Database → Extensions,
-- then run the two statements below once in the SQL editor.
--
-- Territory decay every 48 h at 03:00 UTC:
--   SELECT cron.schedule(
--     'territory-decay',
--     '0 3 */2 * *',
--     $$ SELECT apply_territory_decay(); $$
--   );
--
-- Streak reset every 24 h at 02:00 UTC:
--   SELECT cron.schedule(
--     'streak-reset',
--     '0 2 * * *',
--     $$ SELECT reset_stale_streaks(); $$
--   );
-- ============================================================
