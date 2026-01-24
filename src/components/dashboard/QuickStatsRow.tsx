import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, CheckCircle2, TrendingUp } from 'lucide-react';

interface QuickStatsRowProps {
  currentStreak: number;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

export function QuickStatsRow({ 
  currentStreak, 
  completedCount, 
  totalCount, 
  progressPercent 
}: QuickStatsRowProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-3 gap-3"
    >
      {/* Streak */}
      <Card className="bg-gradient-to-br from-levea-warm to-levea-rose border-0">
        <CardContent className="p-3 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center mb-1">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-xl font-bold text-foreground">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">dias</p>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card className="bg-gradient-to-br from-levea-mint to-levea-sky border-0">
        <CardContent className="p-3 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center mb-1">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">{completedCount}/{totalCount}</p>
          <p className="text-xs text-muted-foreground">tarefas</p>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card className="bg-gradient-to-br from-levea-lavender to-levea-sky border-0">
        <CardContent className="p-3 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center mb-1">
            <TrendingUp className="h-5 w-5 text-accent-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground">{Math.round(progressPercent)}%</p>
          <p className="text-xs text-muted-foreground">hoje</p>
        </CardContent>
      </Card>
    </motion.section>
  );
}
