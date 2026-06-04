-- Initial STRIDE schema: all tables, PostGIS, RLS policies, and geospatial RPC functions

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT        NOT NULL UNIQUE,
  email            TEXT        NOT NULL UNIQUE,
  avatar_url       TEXT,
  city             TEXT        NOT NULL DEFAULT '',
  territory_color  TEXT        NOT NULL DEFAULT '#C8FF00',
  total_km         NUMERIC     NOT NULL DEFAULT 0,
  streak_count     INTEGER     NOT NULL DEFAULT 0,
  rival_id         UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read any profile"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- RUNS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.runs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  route         JSONB       NOT NULL, -- GeoJSON LineString
  distance_m    NUMERIC     NOT NULL DEFAULT 0,
  duration_s    INTEGER     NOT NULL DEFAULT 0,
  pace_s_per_km NUMERIC     NOT NULL DEFAULT 0,
  calories      NUMERIC     NOT NULL DEFAULT 0,
  elevation_m   NUMERIC     NOT NULL DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Runs are publicly readable"
  ON public.runs FOR SELECT USING (true);

CREATE POLICY "Users can insert own runs"
  ON public.runs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own runs"
  ON public.runs FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TERRITORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.territories (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  polygon           GEOGRAPHY(POLYGON, 4326) NOT NULL,
  area_m2           NUMERIC     NOT NULL DEFAULT 0,
  captured_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_defended_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS territories_polygon_idx
  ON public.territories USING GIST (polygon);

CREATE INDEX IF NOT EXISTS territories_user_id_idx
  ON public.territories (user_id);

ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Territories are publicly readable"
  ON public.territories FOR SELECT USING (true);

CREATE POLICY "Users can insert own territories"
  ON public.territories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own territories"
  ON public.territories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own territories"
  ON public.territories FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id   UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id  UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are publicly readable"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================
-- ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  run_id      UUID        NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  likes_count INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities are publicly readable"
  ON public.activities FOR SELECT USING (true);

CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- PUSH SUBSCRIPTIONS (for Web Push API in Phase 4)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint   TEXT        NOT NULL UNIQUE,
  p256dh     TEXT        NOT NULL,
  auth       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TERRITORY CAPTURE — clips stolen sections via PostGIS
-- ============================================================
CREATE OR REPLACE FUNCTION capture_territory(
  p_user_id   UUID,
  p_polygon   TEXT,  -- GeoJSON string
  p_area_m2   NUMERIC
)
RETURNS SETOF public.territories
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_geom   GEOGRAPHY;
  v_existing   RECORD;
BEGIN
  v_new_geom := ST_GeomFromGeoJSON(p_polygon)::GEOGRAPHY;

  -- Validate the incoming polygon
  IF NOT ST_IsValid(v_new_geom::GEOMETRY) THEN
    v_new_geom := ST_MakeValid(v_new_geom::GEOMETRY)::GEOGRAPHY;
  END IF;

  -- Clip any overlapping territory from other users (the Splix.io mechanic)
  FOR v_existing IN
    SELECT id, polygon, user_id
    FROM public.territories
    WHERE user_id <> p_user_id
      AND ST_Intersects(polygon, v_new_geom)
  LOOP
    UPDATE public.territories
    SET
      polygon  = ST_Difference(v_existing.polygon::GEOMETRY, v_new_geom::GEOMETRY)::GEOGRAPHY,
      area_m2  = ST_Area(ST_Difference(v_existing.polygon::GEOMETRY, v_new_geom::GEOMETRY)::GEOGRAPHY)
    WHERE id = v_existing.id;

    -- Remove the territory if the remaining area is negligible (<1 m²)
    DELETE FROM public.territories
    WHERE id = v_existing.id
      AND area_m2 < 1;
  END LOOP;

  -- Insert the new territory
  RETURN QUERY
  INSERT INTO public.territories (user_id, polygon, area_m2)
  VALUES (p_user_id, v_new_geom, p_area_m2)
  RETURNING *;
END;
$$;

-- ============================================================
-- TERRITORY DECAY — called by the Edge Function cron job
-- ============================================================
CREATE OR REPLACE FUNCTION apply_territory_decay()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Shrink territories not defended in the last 48 hours by 10%
  UPDATE public.territories
  SET
    polygon = ST_Scale(
      polygon::GEOMETRY,
      0.9, 0.9,
      ST_Centroid(polygon::GEOMETRY)
    )::GEOGRAPHY,
    area_m2 = area_m2 * 0.9
  WHERE last_defended_at < NOW() - INTERVAL '48 hours';

  -- Remove territories that have decayed below 1 m²
  DELETE FROM public.territories WHERE area_m2 < 1;
END;
$$;

-- ============================================================
-- LEADERBOARD RPCs
-- ============================================================
CREATE OR REPLACE FUNCTION get_leaderboard_by_city(p_city TEXT, p_limit INTEGER DEFAULT 50)
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
  territory_count  BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(t.area_m2) DESC NULLS LAST) AS rank,
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
    COUNT(t.id)                    AS territory_count
  FROM public.users u
  LEFT JOIN public.territories t ON t.user_id = u.id
  WHERE u.city = p_city
  GROUP BY u.id
  ORDER BY total_area_m2 DESC NULLS LAST
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION get_global_leaderboard(p_limit INTEGER DEFAULT 50)
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
  territory_count  BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(t.area_m2) DESC NULLS LAST) AS rank,
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
    COALESCE(SUM(t.area_m2), 0) AS total_area_m2,
    COUNT(t.id)                  AS territory_count
  FROM public.users u
  LEFT JOIN public.territories t ON t.user_id = u.id
  GROUP BY u.id
  ORDER BY total_area_m2 DESC NULLS LAST
  LIMIT p_limit;
$$;

-- ============================================================
-- AUTO-ASSIGN RIVAL on user insert
-- ============================================================
CREATE OR REPLACE FUNCTION assign_rival()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rival_id UUID;
BEGIN
  -- Find the user in the same city with the closest total_km who isn't the new user
  SELECT id INTO v_rival_id
  FROM public.users
  WHERE city = NEW.city
    AND id <> NEW.id
  ORDER BY ABS(total_km - NEW.total_km)
  LIMIT 1;

  IF v_rival_id IS NOT NULL THEN
    UPDATE public.users SET rival_id = v_rival_id WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_assign_rival
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION assign_rival();
