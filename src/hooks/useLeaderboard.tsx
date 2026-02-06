import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  level: number;
  rank: number;
}

export function useLeaderboard(limit: number = 50) {
  const { user } = useAuth();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
    enabled: !!user,
  });

  const { data: userRank } = useQuery({
    queryKey: ['userRank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) return null;
      return data as LeaderboardEntry;
    },
    enabled: !!user?.id,
  });

  return {
    leaderboard,
    userRank,
    isLoading,
    currentUserId: user?.id,
  };
}
