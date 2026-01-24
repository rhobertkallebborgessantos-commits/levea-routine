import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format } from 'date-fns';

export interface MealLog {
  id: string;
  user_id: string;
  date: string;
  meal_type: string;
  food_name: string;
  food_id: string | null;
  calories: number | null;
  protein: number | null;
  portion_grams: number | null;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface MealSummary {
  totalCalories: number;
  totalProtein: number;
  mealsCompleted: number;
  targetCalories: number;
  targetProtein: number;
}

export function useTodayMeals() {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['meal_logs', user?.id, today],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as MealLog[];
    },
    enabled: !!user,
  });
}

export function useMealSummary() {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['meal_summary', user?.id, today],
    queryFn: async (): Promise<MealSummary> => {
      if (!user) {
        return {
          totalCalories: 0,
          totalProtein: 0,
          mealsCompleted: 0,
          targetCalories: 1500,
          targetProtein: 100,
        };
      }

      // Get today's meals
      const { data: meals } = await supabase
        .from('meal_logs')
        .select('calories, protein, is_completed')
        .eq('user_id', user.id)
        .eq('date', today);

      // Get user targets
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('daily_calorie_target, protein_target')
        .eq('user_id', user.id)
        .maybeSingle();

      const totalCalories = meals?.reduce((sum, m) => sum + (m.is_completed ? (m.calories || 0) : 0), 0) || 0;
      const totalProtein = meals?.reduce((sum, m) => sum + (m.is_completed ? (m.protein || 0) : 0), 0) || 0;
      const mealsCompleted = meals?.filter(m => m.is_completed).length || 0;

      return {
        totalCalories,
        totalProtein,
        mealsCompleted,
        targetCalories: prefs?.daily_calorie_target || 1500,
        targetProtein: prefs?.protein_target || 100,
      };
    },
    enabled: !!user,
  });
}

export function useToggleMealCompletion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  return useMutation({
    mutationFn: async ({ mealId, isCompleted }: { mealId: string; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('meal_logs')
        .update({ is_completed: isCompleted })
        .eq('id', mealId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal_logs', user?.id, today] });
      queryClient.invalidateQueries({ queryKey: ['meal_summary', user?.id, today] });
    },
  });
}
