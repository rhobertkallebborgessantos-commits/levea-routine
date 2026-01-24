import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format } from 'date-fns';

export interface Tea {
  id: string;
  name: string;
  description: string | null;
  purpose: string[];
  benefits: string[] | null;
  preparation: string | null;
  best_time: string | null;
  safety_notes: string | null;
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
      const purposeMap: Record<string, string> = {
        'anxiety': 'ansiedade',
        'sweet_craving': 'compulsao',
        'water_retention': 'retencao',
        'slow_metabolism': 'metabolismo',
        'bloating': 'digestao',
        'snacking': 'saciedade',
      };

      const targetPurposes = struggles
        .map((s: string) => purposeMap[s])
        .filter(Boolean);

      // Fetch all teas and filter by purpose
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

export function useLogTea() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useMutation({
    mutationFn: async ({ teaId, teaName }: { teaId?: string; teaName: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tea_logs')
        .insert({
          user_id: user.id,
          tea_id: teaId || null,
          tea_name: teaName,
          date: today,
          time_consumed: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tea_logs', user?.id, today] });
    },
  });
}
