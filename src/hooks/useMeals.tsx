import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useXPReward } from './useXPReward';

export interface Food {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  is_low_carb: boolean;
  is_custom: boolean;
  swap_suggestion: string | null;
}

export interface MealLogInput {
  mealType: string;
  foodId?: string;
  foodName: string;
  portionGrams: number;
  calories: number;
  protein: number;
  notes?: string;
}

export function useFoods() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const { data: foods = [], isLoading } = useQuery({
    queryKey: ['foods', searchTerm, category],
    queryFn: async () => {
      let query = supabase
        .from('foods')
        .select('*')
        .order('name', { ascending: true });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as Food[];
    },
  });

  return {
    foods,
    isLoading,
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
  };
}

export function useMealLogs(date?: string) {
  const { user } = useAuth();
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['meal_logs', user?.id, targetDate],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddMeal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const xpReward = useXPReward();

  return useMutation({
    mutationFn: async (input: MealLogInput) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('meal_logs').insert({
        user_id: user.id,
        date: today,
        meal_type: input.mealType,
        food_id: input.foodId || null,
        food_name: input.foodName,
        portion_grams: input.portionGrams,
        calories: input.calories,
        protein: input.protein,
        is_completed: true,
        notes: input.notes || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal_logs'] });
      queryClient.invalidateQueries({ queryKey: ['meal_summary'] });
      xpReward.mutate('MEAL_LOGGED');
      toast.success('Refeição registrada!');
    },
    onError: () => {
      toast.error('Erro ao registrar refeição');
    },
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealId: string) => {
      const { error } = await supabase
        .from('meal_logs')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal_logs'] });
      queryClient.invalidateQueries({ queryKey: ['meal_summary'] });
      toast.success('Refeição removida');
    },
    onError: () => {
      toast.error('Erro ao remover refeição');
    },
  });
}

export function useAddCustomFood() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (food: {
      name: string;
      category: string;
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g?: number;
      fatPer100g?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('foods')
        .insert({
          name: food.name,
          category: food.category,
          calories_per_100g: food.caloriesPer100g,
          protein_per_100g: food.proteinPer100g,
          carbs_per_100g: food.carbsPer100g || null,
          fat_per_100g: food.fatPer100g || null,
          is_custom: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Food;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      toast.success('Alimento adicionado!');
    },
    onError: () => {
      toast.error('Erro ao adicionar alimento');
    },
  });
}

// Calculate nutrition based on portion size
export function calculateNutrition(food: Food, portionGrams: number) {
  const multiplier = portionGrams / 100;
  return {
    calories: Math.round((food.calories_per_100g || 0) * multiplier),
    protein: Math.round((food.protein_per_100g || 0) * multiplier * 10) / 10,
    carbs: Math.round((food.carbs_per_100g || 0) * multiplier * 10) / 10,
    fat: Math.round((food.fat_per_100g || 0) * multiplier * 10) / 10,
  };
}
