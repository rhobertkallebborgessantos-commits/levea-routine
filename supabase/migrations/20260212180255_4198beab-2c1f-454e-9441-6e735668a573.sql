-- Update calculate_user_level to use new formula: XP_next = 120 × (level ^ 1.35)
-- This is iterative: accumulate XP thresholds until total_xp is exceeded
CREATE OR REPLACE FUNCTION public.calculate_user_level(points integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  lvl integer := 1;
  xp_used integer := 0;
  xp_needed integer;
BEGIN
  LOOP
    xp_needed := round(120 * power(lvl, 1.35))::integer;
    IF xp_used + xp_needed > points THEN
      EXIT;
    END IF;
    xp_used := xp_used + xp_needed;
    lvl := lvl + 1;
  END LOOP;
  RETURN lvl;
END;
$$;