import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

export interface DayProgress {
  date: string;
  dayName: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface WeeklyStats {
  days: DayProgress[];
  totalCompleted: number;
  totalTasks: number;
  averageCompletion: number;
  bestDay: DayProgress | null;
  currentStreak: number;
  longestStreak: number;
}

export function useWeeklyProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly_progress', user?.id],
    queryFn: async (): Promise<WeeklyStats> => {
      if (!user) {
        return {
          days: [],
          totalCompleted: 0,
          totalTasks: 0,
          averageCompletion: 0,
          bestDay: null,
          currentStreak: 0,
          longestStreak: 0,
        };
      }

      const today = startOfDay(new Date());
      const weekAgo = subDays(today, 6);

      // Fetch routines for the last 7 days
      const { data: routines, error } = await supabase
        .from('daily_routines')
        .select('date, is_completed')
        .eq('user_id', user.id)
        .gte('date', format(weekAgo, 'yyyy-MM-dd'))
        .lte('date', format(today, 'yyyy-MM-dd'));

      if (error) throw error;

      // Fetch streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      // Generate all days in the interval
      const daysInWeek = eachDayOfInterval({ start: weekAgo, end: today });
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

      // Process data by day
      const days: DayProgress[] = daysInWeek.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayRoutines = routines?.filter((r) => r.date === dateStr) || [];
        const completed = dayRoutines.filter((r) => r.is_completed).length;
        const total = dayRoutines.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          date: dateStr,
          dayName: dayNames[day.getDay()],
          completed,
          total,
          percentage,
        };
      });

      const totalCompleted = days.reduce((sum, d) => sum + d.completed, 0);
      const totalTasks = days.reduce((sum, d) => sum + d.total, 0);
      const daysWithTasks = days.filter((d) => d.total > 0);
      const averageCompletion =
        daysWithTasks.length > 0
          ? Math.round(
              daysWithTasks.reduce((sum, d) => sum + d.percentage, 0) / daysWithTasks.length
            )
          : 0;

      const bestDay = daysWithTasks.length > 0
        ? daysWithTasks.reduce((best, d) => (d.percentage > best.percentage ? d : best))
        : null;

      return {
        days,
        totalCompleted,
        totalTasks,
        averageCompletion,
        bestDay,
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
