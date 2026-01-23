import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function useMotivationalMessage() {
  const { user } = useAuth();
  const timeOfDay = getTimeOfDay();

  return useQuery({
    queryKey: ['motivational_message', timeOfDay, user?.id],
    queryFn: async () => {
      // First, get the user's goal from preferences
      let userGoal: string | null = null;
      
      if (user) {
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('goal')
          .eq('user_id', user.id)
          .maybeSingle();
        
        userGoal = preferences?.goal || null;
      }

      // Try to get goal-specific messages first
      if (userGoal) {
        const { data: goalMessages } = await supabase
          .from('motivational_messages')
          .select('*')
          .eq('category', timeOfDay)
          .eq('goal', userGoal as "lose_weight" | "maintain_weight" | "build_habits");
        
        if (goalMessages && goalMessages.length > 0) {
          const randomIndex = Math.floor(Math.random() * goalMessages.length);
          return goalMessages[randomIndex].message;
        }
      }

      // Fall back to general messages (goal is null)
      const { data, error } = await supabase
        .from('motivational_messages')
        .select('*')
        .eq('category', timeOfDay)
        .is('goal', null);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        return data[randomIndex].message;
      }
      
      return "Cada passo em frente é progresso. Você está indo muito bem! 🌟";
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    enabled: !!user,
  });
}
