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
    <section className="space-y-3">
      <div className="space-y-3">
        {(['morning', 'lunch', 'afternoon', 'evening'] as const).map((block, blockIndex) => {
          const blockRoutines = routinesByBlock[block] || [];
          if (blockRoutines.length === 0) return null;

          const style = TIME_BLOCK_STYLES[block];
          const Icon = timeBlockIcons[block];
          const completedInBlock = blockRoutines.filter(r => r.is_completed).length;
          const allCompleted = completedInBlock === blockRoutines.length;

          return (
            <motion.div
              key={block}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: blockIndex * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.005 }}
            >
              <Card 
                className={cn(
                  "overflow-hidden border-border/50 transition-all",
                  allCompleted && "ring-1 ring-success/30"
                )}
              >
                <CardHeader className={cn("py-2.5 px-4", style.bg)}>
                  <CardTitle className={cn("text-sm font-medium flex items-center justify-between", style.text)}>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={allCompleted ? { rotate: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                      {style.label}
                    </div>
                    <span className="text-xs opacity-70">
                      {completedInBlock}/{blockRoutines.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-border/30">
                  {blockRoutines.map((routine, routineIndex) => (
                    <motion.div
                      key={routine.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: blockIndex * 0.1 + routineIndex * 0.05 }}
                      className={cn(
                        "p-3 flex items-start gap-3 transition-colors",
                        routine.is_completed && "bg-muted/20"
                      )}
                    >
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="mt-0.5"
                      >
                        <Checkbox
                          checked={routine.is_completed || false}
                          onCheckedChange={() => onToggle(routine.id, routine.is_completed || false)}
                        />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium text-foreground transition-all",
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
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
