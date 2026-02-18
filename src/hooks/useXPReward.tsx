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

      // Check daily cap for non-exempt actions
      if (!isExempt) {
        // Simple approach: track daily XP via a lightweight check
        // We use the user_analytics table to track daily XP (reusing session data)
        const { data: todayAnalytics } = await supabase
          .from('user_analytics')
          .select('total_session_duration_seconds')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        // We repurpose total_session_duration_seconds as daily_xp_earned for tracking
        const dailyXpEarned = todayAnalytics?.total_session_duration_seconds || 0;

        if (dailyXpEarned >= DAILY_XP_CAP) {
          return { capped: true, xpAmount: 0 };
        }

        const allowedXp = Math.min(xpAmount, DAILY_XP_CAP - dailyXpEarned);

        // Update daily tracker
        if (todayAnalytics) {
          await supabase
            .from('user_analytics')
            .update({ total_session_duration_seconds: dailyXpEarned + allowedXp })
            .eq('user_id', user.id)
            .eq('date', today);
        } else {
          await supabase
            .from('user_analytics')
            .insert({
              user_id: user.id,
              date: today,
              total_session_duration_seconds: allowedXp,
            });
        }

        // Update profile points
        const newTotal = (profile.total_points || 0) + allowedXp;
        await supabase
          .from('profiles')
          .update({
            total_points: newTotal,
            level: undefined, // trigger will handle via calculate_user_level
          })
          .eq('user_id', user.id);

        // Recalculate level via DB function
        const { data: levelData } = await supabase.rpc('calculate_user_level', { points: newTotal });
        if (levelData) {
          await supabase
            .from('profiles')
            .update({ level: levelData })
            .eq('user_id', user.id);
        }

        return { capped: false, xpAmount: allowedXp, newTotal };
      }

      // Exempt actions (streaks) - no cap
      const newTotal = (profile.total_points || 0) + xpAmount;
      await supabase
        .from('profiles')
        .update({ total_points: newTotal })
        .eq('user_id', user.id);

      const { data: levelData } = await supabase.rpc('calculate_user_level', { points: newTotal });
      if (levelData) {
        await supabase
          .from('profiles')
          .update({ level: levelData })
          .eq('user_id', user.id);
      }

      return { capped: false, xpAmount, newTotal };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}
