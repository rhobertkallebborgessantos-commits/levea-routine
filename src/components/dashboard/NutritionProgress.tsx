import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Utensils, Beef, Flame, ChevronRight } from 'lucide-react';
import { useMealSummary } from '@/hooks/useTodayMeals';
import { Skeleton } from '@/components/ui/skeleton';

export function NutritionProgress() {
  const navigate = useNavigate();
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
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border/50 transition-shadow hover:shadow-md hover:shadow-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-foreground">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Utensils className="h-4 w-4 text-primary" />
            </motion.div>
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

          {/* Link to meals */}
          <motion.button
            onClick={() => navigate('/meals')}
            className="w-full pt-3 border-t border-border/50 flex items-center justify-between text-sm group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Refeições registradas</span>
              <span className="font-medium text-foreground">{summary.mealsCompleted}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
