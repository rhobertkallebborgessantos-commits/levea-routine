import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { useXPReward } from './useXPReward';

export interface Tea {
  id: string;
  name: string;
  description: string | null;
  purpose: string[];
  benefits: string[] | null;
  preparation: string | null;
  best_time: string | null;
  safety_notes: string | null;
  intensity: string | null;
  time_of_day: string[] | null;
  alternatives: string[] | null;
  main_benefit: string | null;
  // Structured preparation fields
  preparation_ingredients: string[] | null;
  preparation_steps: string[] | null;
  infusion_time: string | null;
  preparation_notes: string | null;
}

export interface TeaLog {
  id: string;
  user_id: string;
  tea_id: string | null;
  tea_name: string;
  date: string;
  time_consumed: string | null;
  notes: string | null;
  created_at: string;
}

export interface TeaHistoryDay {
  date: string;
  logs: TeaLog[];
}

// Fetch all teas
export function useAllTeas() {
  return useQuery({
    queryKey: ['all_teas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teas')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Tea[];
    },
  });
}

// Fetch teas by purpose
export function useTeasByPurpose(purpose: string | null) {
  return useQuery({
    queryKey: ['teas_by_purpose', purpose],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teas')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (!purpose || purpose === 'all') {
        return data as Tea[];
      }
      
      // Filter by purpose
      return (data as Tea[]).filter(tea => 
        tea.purpose.includes(purpose)
      );
    },
    enabled: true,
  });
}

// Fetch recommended teas based on user struggles
export function useRecommendedTeas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recommended_teas', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user struggles to recommend appropriate teas
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('struggles')
        .eq('user_id', user.id)
        .maybeSingle();

      const struggles = prefs?.struggles || [];

      // Map struggles to tea purposes
      const purposeMap: Record<string, string[]> = {
        'anxiety': ['anxiety', 'ansiedade'],
        'sweet_craving': ['metabolism', 'metabolismo', 'compulsao'],
        'water_retention': ['bloating', 'retencao'],
        'slow_metabolism': ['metabolism', 'metabolismo'],
        'bloating': ['digestion', 'digestao', 'bloating'],
        'snacking': ['metabolism', 'saciedade'],
        'emotional_eating': ['anxiety', 'ansiedade'],
        'night_eating': ['sleep', 'sono'],
      };

      const targetPurposes = struggles
        .flatMap((s: string) => purposeMap[s] || [])
        .filter(Boolean);

      // Fetch all teas
      const { data: teas, error } = await supabase
        .from('teas')
        .select('*');

      if (error) throw error;

      // Sort by relevance (matching purposes first)
      const sortedTeas = (teas || []).sort((a, b) => {
        const aMatches = a.purpose.filter((p: string) => targetPurposes.includes(p)).length;
        const bMatches = b.purpose.filter((p: string) => targetPurposes.includes(p)).length;
        return bMatches - aMatches;
      });

      return sortedTeas.slice(0, 5) as Tea[];
    },
    enabled: !!user,
  });
}

// Fetch today's tea logs
export function useTodayTeaLogs() {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['tea_logs', user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tea_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('time_consumed', { ascending: true });
      
      if (error) throw error;
      return data as TeaLog[];
    },
    enabled: !!user,
  });
}

// Fetch tea history for the past week
export function useTeaHistory(days: number = 7) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tea_history', user?.id, days],
    queryFn: async (): Promise<TeaHistoryDay[]> => {
      if (!user) return [];

      const today = startOfDay(new Date());
      const startDate = subDays(today, days - 1);

      const { data, error } = await supabase
        .from('tea_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(today, 'yyyy-MM-dd'))
        .order('date', { ascending: false })
        .order('time_consumed', { ascending: false });

      if (error) throw error;

      // Group by date
      const daysInRange = eachDayOfInterval({ start: startDate, end: today }).reverse();
      
      return daysInRange.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return {
          date: dateStr,
          logs: (data || []).filter(log => log.date === dateStr),
        };
      });
    },
    enabled: !!user,
  });
}

// Fetch tea stats
export function useTeaStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tea_stats', user?.id],
    queryFn: async () => {
      if (!user) return { totalThisWeek: 0, favoriteTea: null, streak: 0 };

      const today = startOfDay(new Date());
      const weekAgo = subDays(today, 6);

      const { data, error } = await supabase
        .from('tea_logs')
        .select('tea_name, date')
        .eq('user_id', user.id)
        .gte('date', format(weekAgo, 'yyyy-MM-dd'));

      if (error) throw error;

      const totalThisWeek = data?.length || 0;

      // Find most logged tea
      const teaCounts: Record<string, number> = {};
      data?.forEach(log => {
        teaCounts[log.tea_name] = (teaCounts[log.tea_name] || 0) + 1;
      });
      
      const favoriteTea = Object.entries(teaCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      // Calculate streak (consecutive days with at least one tea)
      const datesWithTea = new Set(data?.map(log => log.date) || []);
      let streak = 0;
      let currentDate = today;
      
      while (datesWithTea.has(format(currentDate, 'yyyy-MM-dd'))) {
        streak++;
        currentDate = subDays(currentDate, 1);
      }

      return { totalThisWeek, favoriteTea, streak };
    },
    enabled: !!user,
  });
}

// Log a tea
export function useLogTea() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useMutation({
    mutationFn: async ({ teaId, teaName, notes }: { teaId?: string; teaName: string; notes?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tea_logs')
        .insert({
          user_id: user.id,
          tea_id: teaId || null,
          tea_name: teaName,
          date: today,
          time_consumed: new Date().toISOString(),
          notes: notes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tea_logs', user?.id, today] });
      queryClient.invalidateQueries({ queryKey: ['tea_history', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tea_stats', user?.id] });
      xpReward.mutate('TEA_LOGGED');
    },
  });
}

// Delete a tea log
export function useDeleteTeaLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('tea_logs')
        .delete()
        .eq('id', logId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tea_logs'] });
      queryClient.invalidateQueries({ queryKey: ['tea_history'] });
      queryClient.invalidateQueries({ queryKey: ['tea_stats'] });
    },
  });
}
