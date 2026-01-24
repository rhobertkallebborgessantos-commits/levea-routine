import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  message: string;
  scheduled_time: string;
  time_block: 'morning' | 'lunch' | 'afternoon' | 'evening';
  reminder_type: string | null;
  category: string | null;
  tone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useReminders(type?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reminders', user?.id, type],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_time', { ascending: true });

      if (type) {
        query = query.eq('reminder_type', type);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Reminder[];
    },
    enabled: !!user,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reminder: {
      title: string;
      message: string;
      scheduled_time: string;
      time_block: 'morning' | 'lunch' | 'afternoon' | 'evening';
      reminder_type?: string;
      category?: string;
      tone?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          ...reminder,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reminder> & { id: string }) => {
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    },
  });
}

export function useToggleReminder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    },
  });
}
