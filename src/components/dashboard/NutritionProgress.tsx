import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Utensils, Beef, Flame } from 'lucide-react';
import { useMealSummary } from '@/hooks/useTodayMeals';
import { Skeleton } from '@/components/ui/skeleton';

export function NutritionProgress() {
  const { data: summary, isLoading } = useMealSummary();

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const caloriePercent = Math.min(100, (summary.totalCalories / summary.targetCalories) * 100);
  const proteinPercent = Math.min(100, (summary.totalProtein / summary.targetProtein) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-foreground">
            <Utensils className="h-4 w-4 text-primary" />
            Nutrição de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-foreground">Calorias</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {summary.totalCalories} / {summary.targetCalories} kcal
              </span>
            </div>
            <Progress 
              value={caloriePercent} 
              className="h-2"
            />
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beef className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Proteína</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {summary.totalProtein}g / {summary.targetProtein}g
              </span>
            </div>
            <Progress 
              value={proteinPercent} 
              className="h-2"
            />
          </div>

          {/* Meals count */}
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Refeições registradas</span>
            <span className="font-medium text-foreground">{summary.mealsCompleted}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
