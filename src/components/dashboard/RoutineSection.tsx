import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Sun, Coffee, CloudSun, Moon } from 'lucide-react';
import { TIME_BLOCK_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Routine {
  id: string;
  time_block: 'morning' | 'lunch' | 'afternoon' | 'evening';
  action_title: string;
  action_description: string | null;
  is_completed: boolean | null;
}

interface RoutineSectionProps {
  routines: Routine[] | undefined;
  isLoading: boolean;
  onToggle: (routineId: string, isCompleted: boolean) => void;
}

const timeBlockIcons = {
  morning: Sun,
  lunch: Coffee,
  afternoon: CloudSun,
  evening: Moon,
};

export function RoutineSection({ routines, isLoading, onToggle }: RoutineSectionProps) {
  // Group routines by time block
  const routinesByBlock = routines?.reduce((acc, routine) => {
    const block = routine.time_block;
    if (!acc[block]) acc[block] = [];
    acc[block].push(routine);
    return acc;
  }, {} as Record<string, Routine[]>) || {};

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="space-y-4"
    >
      <h2 className="text-lg font-display font-semibold text-foreground">
        Rotina de Hoje
      </h2>

      <div className="space-y-3">
        {(['morning', 'lunch', 'afternoon', 'evening'] as const).map((block) => {
          const blockRoutines = routinesByBlock[block] || [];
          if (blockRoutines.length === 0) return null;

          const style = TIME_BLOCK_STYLES[block];
          const Icon = timeBlockIcons[block];
          const completedInBlock = blockRoutines.filter(r => r.is_completed).length;
          const allCompleted = completedInBlock === blockRoutines.length;

          return (
            <Card 
              key={block} 
              className={cn(
                "overflow-hidden border-border/50 transition-all",
                allCompleted && "ring-1 ring-success/30"
              )}
            >
              <CardHeader className={cn("py-2.5 px-4", style.bg)}>
                <CardTitle className={cn("text-sm font-medium flex items-center justify-between", style.text)}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {style.label}
                  </div>
                  <span className="text-xs opacity-70">
                    {completedInBlock}/{blockRoutines.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/30">
                {blockRoutines.map((routine) => (
                  <div
                    key={routine.id}
                    className={cn(
                      "p-3 flex items-start gap-3 transition-colors",
                      routine.is_completed && "bg-muted/20"
                    )}
                  >
                    <Checkbox
                      checked={routine.is_completed || false}
                      onCheckedChange={() => onToggle(routine.id, routine.is_completed || false)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium text-foreground",
                        routine.is_completed && "line-through text-muted-foreground"
                      )}>
                        {routine.action_title}
                      </p>
                      {routine.action_description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {routine.action_description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.section>
  );
}
