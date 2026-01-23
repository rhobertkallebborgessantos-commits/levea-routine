import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function useMotivationalMessage() {
  const timeOfDay = getTimeOfDay();

  return useQuery({
    queryKey: ['motivational_message', timeOfDay],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('motivational_messages')
        .select('*')
        .eq('category', timeOfDay);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Return a random message from the category
        const randomIndex = Math.floor(Math.random() * data.length);
        return data[randomIndex].message;
      }
      
      return "Every step forward is progress. You're doing great! 🌟";
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}