-- Adds weekly-km-sorted leaderboard variants and friends leaderboard
-- Apply this in the Supabase SQL editor after 001_initial_schema.sql

-- ============================================================
-- CITY LEADERBOARD — sorted by weekly km
-- ============================================================
CREATE OR REPLACE FUNCTION get_leaderboard_by_city_weekly_km(
  p_city  TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  rank             BIGINT,
  user_id          UUID,
  username         TEXT,
  avatar_url       TEXT,
  territory_color  TEXT,
  total_km         NUMERIC,
  streak_count     INTEGER,
  email            TEXT,
  city             TEXT,
  rival_id         UUID,
  created_at       TIMESTAMPTZ,
  total_area_m2    NUMERIC,
  territory_count  BIGINT,
  weekly_km        NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH weekly AS (
    SELECT user_id, COALESCE(SUM(distance_m) / 1000, 0) AS km
    FROM public.runs
    WHERE started_at >= NOW() - INTERVAL '7 days'
    GROUP BY user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY COALESCE(w.km, 0) DESC NULLS LAST) AS rank,
    u.id              AS user_id,
    u.username,
    u.avatar_url,
    u.territory_color,
    u.total_km,
    u.streak_count,
    u.email,
    u.city,
    u.rival_id,
    u.created_at,
    COALESCE(SUM(t.area_m2), 0)   AS total_area_m2,
    COUNT(t.id)                    AS territory_count,
    COALESCE(w.km, 0)              AS weekly_km
  FROM public.users u
  LEFT JOIN public.territories t ON t.user_id = u.id
  LEFT JOIN weekly w              ON w.user_id = u.id
  WHERE u.city = p_city
  GROUP BY u.id, w.km
  ORDER BY weekly_km DESC NULLS LAST
  LIMIT p_limit;
$$;

-- ============================================================
-- GLOBAL LEADERBOARD — sorted by weekly km
-- ============================================================
CREATE OR REPLACE FUNCTION get_global_leaderboard_weekly_km(
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  rank             BIGINT,
  user_id          UUID,
  username         TEXT,
  avatar_url       TEXT,
  territory_color  TEXT,
  total_km         NUMERIC,
  streak_count     INTEGER,
  email            TEXT,
  city             TEXT,
  rival_id         UUID,
  created_at       TIMESTAMPTZ,
  total_area_m2    NUMERIC,
  territory_count  BIGINT,
  weekly_km        NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH weekly AS (
    SELECT user_id, COALESCE(SUM(distance_m) / 1000, 0) AS km
    FROM public.runs
    WHERE started_at >= NOW() - INTERVAL '7 days'
    GROUP BY user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY COALESCE(w.km, 0) DESC NULLS LAST) AS rank,
    u.id              AS user_id,
    u.username,
    u.avatar_url,
    u.territory_color,
    u.total_km,
    u.streak_count,
    u.email,
    u.city,
    u.rival_id,
    u.created_at,
    COALESCE(SUM(t.area_m2), 0)   AS total_area_m2,
    COUNT(t.id)                    AS territory_count,
    COALESCE(w.km, 0)              AS weekly_km
  FROM public.users u
  LEFT JOIN public.territories t ON t.user_id = u.id
  LEFT JOIN weekly w              ON w.user_id = u.id
  GROUP BY u.id, w.km
  ORDER BY weekly_km DESC NULLS LAST
  LIMIT p_limit;
$$;

-- ============================================================
-- FRIENDS LEADERBOARD — sorted by territory
-- ============================================================
CREATE OR REPLACE FUNCTION get_friends_leaderboard(
  p_user_id UUID,
  p_limit   INTEGER DEFAULT 50
)
RETURNS TABLE (
  rank             BIGINT,
  user_id          UUID,
  username         TEXT,
  avatar_url       TEXT,
  territory_color  TEXT,
  total_km         NUMERIC,
  streak_count     INTEGER,
  email            TEXT,
  city             TEXT,
  rival_id         UUID,
  created_at       TIMESTAMPTZ,
  total_area_m2    NUMERIC,
  territory_count  BIGINT,
  weekly_km        NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH friend_ids AS (
    SELECT following_id AS uid FROM public.follows WHERE follower_id = p_user_id
    UNION ALL SELECT p_user_id
  ),
  weekly AS (
    SELECT user_id, COALESCE(SUM(distance_m) / 1000, 0) AS km
    FROM public.runs
    WHERE started_at >= NOW() - INTERVAL '7 days'
    GROUP BY user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(t.area_m2), 0) DESC NULLS LAST) AS rank,
    u.id              AS user_id,
    u.username,
    u.avatar_url,
    u.territory_color,
    u.total_km,
    u.streak_count,
    u.email,
    u.city,
    u.rival_id,
    u.created_at,
    COALESCE(SUM(t.area_m2), 0)   AS total_area_m2,
    COUNT(t.id)                    AS territory_count,
    COALESCE(w.km, 0)              AS weekly_km
  FROM public.users u
  JOIN friend_ids fi              ON fi.uid = u.id
  LEFT JOIN public.territories t  ON t.user_id = u.id
  LEFT JOIN weekly w              ON w.user_id = u.id
  GROUP BY u.id, w.km
  ORDER BY total_area_m2 DESC NULLS LAST
  LIMIT p_limit;
$$;

-- ============================================================
-- FRIENDS LEADERBOARD — sorted by weekly km
-- ============================================================
CREATE OR REPLACE FUNCTION get_friends_leaderboard_weekly_km(
  p_user_id UUID,
  p_limit   INTEGER DEFAULT 50
)
RETURNS TABLE (
  rank             BIGINT,
  user_id          UUID,
  username         TEXT,
  avatar_url       TEXT,
  territory_color  TEXT,
  total_km         NUMERIC,
  streak_count     INTEGER,
  email            TEXT,
  city             TEXT,
  rival_id         UUID,
  created_at       TIMESTAMPTZ,
  total_area_m2    NUMERIC,
  territory_count  BIGINT,
  weekly_km        NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH friend_ids AS (
    SELECT following_id AS uid FROM public.follows WHERE follower_id = p_user_id
    UNION ALL SELECT p_user_id
  ),
  weekly AS (
    SELECT user_id, COALESCE(SUM(distance_m) / 1000, 0) AS km
    FROM public.runs
    WHERE started_at >= NOW() - INTERVAL '7 days'
    GROUP BY user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY COALESCE(w.km, 0) DESC NULLS LAST) AS rank,
    u.id              AS user_id,
    u.username,
    u.avatar_url,
    u.territory_color,
    u.total_km,
    u.streak_count,
    u.email,
    u.city,
    u.rival_id,
    u.created_at,
    COALESCE(SUM(t.area_m2), 0)   AS total_area_m2,
    COUNT(t.id)                    AS territory_count,
    COALESCE(w.km, 0)              AS weekly_km
  FROM public.users u
  JOIN friend_ids fi              ON fi.uid = u.id
  LEFT JOIN public.territories t  ON t.user_id = u.id
  LEFT JOIN weekly w              ON w.user_id = u.id
  GROUP BY u.id, w.km
  ORDER BY weekly_km DESC NULLS LAST
  LIMIT p_limit;
$$;
