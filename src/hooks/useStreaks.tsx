import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, differenceInDays, parseISO } from 'date-fns';

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserStreak() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user_streaks', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserStreak | null;
    },
    enabled: !!user,
  });
}

export function useUpdateStreak() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get current streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!streakData) {
        // Create initial streak
        const { data, error } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_active_date: today,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      // Calculate streak
      let newStreak = 1;
      let longestStreak = streakData.longest_streak;
      
      if (streakData.last_active_date) {
        const lastDate = parseISO(streakData.last_active_date);
        const daysDiff = differenceInDays(new Date(), lastDate);
        
        if (daysDiff === 0) {
          // Already updated today
          return streakData;
        } else if (daysDiff === 1) {
          // Consecutive day
          newStreak = streakData.current_streak + 1;
        }
        // else: streak broken, reset to 1
      }
      
      if (newStreak > longestStreak) {
        longestStreak = newStreak;
      }
      
      const { data, error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_active_date: today,
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_streaks', user?.id] });
    },
  });
}