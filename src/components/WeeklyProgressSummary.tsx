import { motion } from 'framer-motion';
import { useWeeklyProgress } from '@/hooks/useWeeklyProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Trophy, Calendar, Target, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WeeklyProgressSummary() {
  const { data: stats, isLoading } = useWeeklyProgress();

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const maxCompleted = Math.max(...stats.days.map((d) => d.total), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-levea-mint/50 to-levea-sky/50">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4" />
            Resumo Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-5">
          {/* Weekly Chart */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Progresso por dia</p>
            <div className="flex items-end justify-between gap-1 h-20">
              {stats.days.map((day, index) => {
                const isToday = index === stats.days.length - 1;
                const barHeight = day.total > 0 ? (day.completed / maxCompleted) * 100 : 0;
                const bgHeight = day.total > 0 ? (day.total / maxCompleted) * 100 : 10;

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full h-16 flex items-end justify-center">
                      {/* Background bar (total tasks) */}
                      <div
                        className="absolute bottom-0 w-full max-w-6 rounded-t bg-muted/50 transition-all"
                        style={{ height: `${bgHeight}%` }}
                      />
                      {/* Completed bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}%` }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        className={cn(
                          "relative w-full max-w-6 rounded-t transition-colors",
                          day.percentage === 100
                            ? "bg-success"
                            : day.percentage >= 50
                            ? "bg-primary"
                            : day.percentage > 0
                            ? "bg-primary/60"
                            : "bg-transparent"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs",
                        isToday ? "font-semibold text-primary" : "text-muted-foreground"
                      )}
                    >
                      {day.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Average Completion */}
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{stats.averageCompletion}%</p>
              <p className="text-xs text-muted-foreground">Média</p>
            </div>

            {/* Streak */}
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Flame className="h-4 w-4 mx-auto mb-1 text-destructive" />
              <p className="text-lg font-bold text-foreground">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">Dias seguidos</p>
            </div>

            {/* Longest Streak */}
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Trophy className="h-4 w-4 mx-auto mb-1 text-accent-foreground" />
              <p className="text-lg font-bold text-foreground">{stats.longestStreak}</p>
              <p className="text-xs text-muted-foreground">Recorde</p>
            </div>
          </div>

          {/* Total Summary */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="text-sm">Tarefas concluídas esta semana</span>
            </div>
            <span className="font-semibold text-foreground">
              {stats.totalCompleted}/{stats.totalTasks}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
