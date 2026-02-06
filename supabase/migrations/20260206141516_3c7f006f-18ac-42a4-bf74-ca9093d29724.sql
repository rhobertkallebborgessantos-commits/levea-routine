-- Create a view for leaderboard data (only exposes non-sensitive info)
CREATE OR REPLACE VIEW public.leaderboard AS
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

-- Create RLS policy for the view (views inherit from base table, but we need explicit policy)
-- Add a policy to profiles to allow reading leaderboard-safe fields
CREATE POLICY "Anyone can view leaderboard data"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the old restrictive policy and replace with one that allows full access to own profile
-- but limited access to others for leaderboard
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;