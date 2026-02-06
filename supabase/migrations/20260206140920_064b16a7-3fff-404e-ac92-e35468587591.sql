-- Fix the function search path for calculate_user_level
CREATE OR REPLACE FUNCTION calculate_user_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(SQRT(points / 50.0)) + 1)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;