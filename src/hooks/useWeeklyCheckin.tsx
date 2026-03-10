import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, startOfWeek, subDays } from 'date-fns';
import { toast } from 'sonner';

interface WeeklyCheckin {
  id: string;
  user_id: string;
  week_start: string;
  weight_change: number | null;
  meals_completed: number | null;
  teas_consumed: number | null;
  adherence_score: number | null;
  analysis_summary: string | null;
  new_calorie_target: number | null;
  new_focus: string | null;
  adjustments: string[] | null;
  created_at: string;
}

interface WeeklyStats {
  mealsCompleted: number;
  totalMeals: number;
  teasConsumed: number;
  routinesCompleted: number;
  totalRoutines: number;
  daysActive: number;
}

interface CheckinInput {
  currentWeight: number;
  weeklyStats: WeeklyStats;
  previousWeight: number | null;
}

export function useWeeklyCheckins() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('weekly_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as WeeklyCheckin[];
    },
    enabled: !!user,
  });
}

export function useLatestCheckin() {
  const { user } = useAuth();
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['weekly-checkin', user?.id, weekStart],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('weekly_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .maybeSingle();

      if (error) throw error;
      return data as WeeklyCheckin | null;
    },
    enabled: !!user,
  });
}

export function useWeeklyStats() {
  const { user } = useAuth();
  const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['weekly-stats', user?.id],
    queryFn: async (): Promise<WeeklyStats> => {
      if (!user) {
        return {
          mealsCompleted: 0,
          totalMeals: 0,
          teasConsumed: 0,
          routinesCompleted: 0,
          totalRoutines: 0,
          daysActive: 0,
        };
      }

      // Get meals from last 7 days
      const { data: meals } = await supabase
        .from('meal_logs')
        .select('id, is_completed, date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo)
        .lte('date', today);

      // Get teas from last 7 days
      const { data: teas } = await supabase
        .from('tea_logs')
        .select('id, date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo)
        .lte('date', today);

      // Get routines from last 7 days
      const { data: routines } = await supabase
        .from('daily_routines')
        .select('id, is_completed, date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo)
        .lte('date', today);

      const mealsCompleted = meals?.filter((m) => m.is_completed).length || 0;
      const routinesCompleted = routines?.filter((r) => r.is_completed).length || 0;

      // Count unique active days
      const activeDays = new Set([
        ...(meals?.map((m) => m.date) || []),
        ...(routines?.filter((r) => r.is_completed).map((r) => r.date) || []),
      ]).size;

      return {
        mealsCompleted,
        totalMeals: meals?.length || 0,
        teasConsumed: teas?.length || 0,
        routinesCompleted,
        totalRoutines: routines?.length || 0,
        daysActive: activeDays,
      };
    },
    enabled: !!user,
  });
}

export function useLatestWeight() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['latest-weight', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('weight_logs')
        .select('weight, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.weight || null;
    },
    enabled: !!user,
  });
}

export function useSubmitCheckin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return useMutation({
    mutationFn: async (input: CheckinInput) => {
      if (!user) throw new Error('Not authenticated');

      const weightChange = input.previousWeight
        ? input.currentWeight - input.previousWeight
        : null;

      // Calculate adherence score (0-100)
      const mealScore = input.weeklyStats.totalMeals > 0
        ? (input.weeklyStats.mealsCompleted / input.weeklyStats.totalMeals) * 100
        : 0;
      const routineScore = input.weeklyStats.totalRoutines > 0
        ? (input.weeklyStats.routinesCompleted / input.weeklyStats.totalRoutines) * 100
        : 0;
      const activityScore = (input.weeklyStats.daysActive / 7) * 100;
      
      const adherenceScore = Math.round((mealScore * 0.4) + (routineScore * 0.4) + (activityScore * 0.2));

      // Generate analysis and recommendations
      const { summary, focus, adjustments, newCalorieAdjustment } = generateAnalysis({
        adherenceScore,
        weightChange,
        weeklyStats: input.weeklyStats,
      });

      // Log the new weight
      const { error: weightError } = await supabase.from('weight_logs').insert({
        user_id: user.id,
        weight: input.currentWeight,
        notes: 'Check-in semanal',
        date: format(new Date(), 'yyyy-MM-dd'),
      });

      if (weightError) throw weightError;

      // Save the check-in
      const { error } = await supabase.from('weekly_checkins').insert({
        user_id: user.id,
        week_start: weekStart,
        weight_change: weightChange,
        meals_completed: input.weeklyStats.mealsCompleted,
        teas_consumed: input.weeklyStats.teasConsumed,
        adherence_score: adherenceScore,
        analysis_summary: summary,
        new_focus: focus,
        adjustments,
        new_calorie_target: newCalorieAdjustment,
      });

      if (error) throw error;

      // Update user preferences with new focus if needed
      if (focus) {
        await supabase
          .from('user_preferences')
          .update({ weekly_focus: focus })
          .eq('user_id', user.id);
      }

      return { adherenceScore, summary, focus, adjustments, weightChange };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-checkin'] });
      queryClient.invalidateQueries({ queryKey: ['weight-logs'] });
      queryClient.invalidateQueries({ queryKey: ['latest-weight'] });
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      xpReward.mutate('CHECKIN_COMPLETED');
      toast.success('Check-in semanal salvo!');
    },
    onError: () => {
      toast.error('Erro ao salvar check-in');
    },
  });
}

function generateAnalysis(data: {
  adherenceScore: number;
  weightChange: number | null;
  weeklyStats: WeeklyStats;
}): { summary: string; focus: string; adjustments: string[]; newCalorieAdjustment: number | null } {
  const { adherenceScore, weightChange, weeklyStats } = data;
  const adjustments: string[] = [];
  let summary = '';
  let focus = '';
  let newCalorieAdjustment: number | null = null;

  // Analyze adherence
  if (adherenceScore >= 80) {
    summary = '🎉 Excelente semana! Você manteve uma consistência impressionante. ';
    focus = 'Manter o ritmo e celebrar pequenas vitórias';
  } else if (adherenceScore >= 60) {
    summary = '👍 Boa semana! Você está no caminho certo, com espaço para melhorar. ';
    focus = 'Aumentar consistência nas refeições principais';
  } else if (adherenceScore >= 40) {
    summary = '💪 Semana desafiadora, mas cada dia é uma nova chance. ';
    focus = 'Simplificar a rotina e focar no básico';
  } else {
    summary = '🌱 Esta semana foi difícil, mas amanhã é um novo começo. ';
    focus = 'Começar com apenas 1 hábito por dia';
  }

  // Analyze weight change
  if (weightChange !== null) {
    if (weightChange < -0.5) {
      summary += `Você perdeu ${Math.abs(weightChange).toFixed(1)}kg - ótimo progresso! `;
    } else if (weightChange > 0.5) {
      summary += `Houve um aumento de ${weightChange.toFixed(1)}kg. Vamos ajustar a estratégia. `;
      adjustments.push('Revisar porções das refeições');
      newCalorieAdjustment = -100;
    } else {
      summary += 'Seu peso está estável, o que pode ser um bom sinal de manutenção. ';
    }
  }

  // Specific recommendations based on stats
  if (weeklyStats.mealsCompleted < weeklyStats.totalMeals * 0.5) {
    adjustments.push('Priorizar registro das refeições principais');
  }

  if (weeklyStats.teasConsumed < 7) {
    adjustments.push('Incluir pelo menos 1 chá por dia');
  }

  if (weeklyStats.daysActive < 5) {
    adjustments.push('Aumentar dias ativos para pelo menos 5 por semana');
  }

  if (weeklyStats.routinesCompleted < weeklyStats.totalRoutines * 0.6) {
    adjustments.push('Simplificar rotina diária para aumentar conclusão');
  }

  // Add positive reinforcement if doing well
  if (adjustments.length === 0) {
    adjustments.push('Continue com a rotina atual - está funcionando!');
    adjustments.push('Considere adicionar um novo hábito saudável');
  }

  return { summary, focus, adjustments, newCalorieAdjustment };
}
