import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format } from 'date-fns';
import { XP_REWARDS, DAILY_XP_CAP, CAP_EXEMPT_ACTIONS } from '@/lib/xp-config';

type XPAction = keyof typeof XP_REWARDS;

export function useXPReward() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (action: XPAction) => {
      if (!user) throw new Error('Not authenticated');

      const xpAmount = XP_REWARDS[action];
      const isExempt = (CAP_EXEMPT_ACTIONS as readonly string[]).includes(action);
      const today = format(new Date(), 'yyyy-MM-dd');

      // Get current profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, level')
        .eq('user_id', user.id)
        .single();

      if (!profile) return null;

      let effectiveXp = xpAmount;

      // Check daily cap for non-exempt actions
      if (!isExempt) {
        const { data: todayAnalytics } = await supabase
          .from('user_analytics')
          .select('daily_xp_earned')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        const dailyXpEarned = (todayAnalytics as any)?.daily_xp_earned || 0;

        if (dailyXpEarned >= DAILY_XP_CAP) {
          return { capped: true, xpAmount: 0 };
        }

        effectiveXp = Math.min(xpAmount, DAILY_XP_CAP - dailyXpEarned);

        // Update daily tracker
        if (todayAnalytics) {
          await supabase
            .from('user_analytics')
            .update({ daily_xp_earned: dailyXpEarned + effectiveXp } as any)
            .eq('user_id', user.id)
            .eq('date', today);
        } else {
          await supabase
            .from('user_analytics')
            .insert({
              user_id: user.id,
              date: today,
              daily_xp_earned: effectiveXp,
            } as any);
        }
      }

      // Calculate new total and level in one go
      const newTotal = (profile.total_points || 0) + effectiveXp;
      const { data: levelData } = await supabase.rpc('calculate_user_level', { points: newTotal });

      // Single update for both points and level
      await supabase
        .from('profiles')
        .update({
          total_points: newTotal,
          level: levelData ?? profile.level,
        })
        .eq('user_id', user.id);

      return { capped: false, xpAmount: effectiveXp, newTotal };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}
