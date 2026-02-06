-- Drop and recreate view with SECURITY INVOKER (default, safer)
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  full_name,
  avatar_url,
  total_points,
  level,
  ROW_NUMBER() OVER (ORDER BY total_points DESC, created_at ASC) as rank
FROM public.profiles
WHERE total_points > 0
ORDER BY total_points DESC;

-- Grant access to the view
GRANT SELECT ON public.leaderboard TO anon, authenticated;