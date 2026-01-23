import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format } from 'date-fns';
import { DEFAULT_ROUTINE_ACTIONS } from '@/lib/constants';

export interface DailyRoutine {
  id: string;
  user_id: string;
  date: string;
  time_block: 'morning' | 'lunch' | 'afternoon' | 'evening';
  action_title: string;
  action_description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export function useTodayRoutines() {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['daily_routines', user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as DailyRoutine[];
    },
    enabled: !!user,
  });
}

export function useInitializeDailyRoutines() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if routines exist for today
      const { data: existing } = await supabase
        .from('daily_routines')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1);
      
      if (existing && existing.length > 0) {
        return existing; // Already initialized
      }
      
      // Create default routines for today
      const routinesToInsert = Object.entries(DEFAULT_ROUTINE_ACTIONS).flatMap(
        ([timeBlock, actions]) =>
          actions.map((action) => ({
            user_id: user.id,
            date: today,
            time_block: timeBlock as DailyRoutine['time_block'],
            action_title: action.title,
            action_description: action.description,
            is_completed: false,
          }))
      );
      
      const { data, error } = await supabase
        .from('daily_routines')
        .insert(routinesToInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      queryClient.invalidateQueries({ queryKey: ['daily_routines', user?.id, today] });
    },
  });
}

export function useToggleRoutineCompletion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ routineId, isCompleted }: { routineId: string; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('daily_routines')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', routineId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      queryClient.invalidateQueries({ queryKey: ['daily_routines', user?.id, today] });
      queryClient.invalidateQueries({ queryKey: ['user_streaks', user?.id] });
    },
  });
}