import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Sparkles } from 'lucide-react';

interface DailyFocusCardProps {
  weeklyFocus: string | null;
  diagnosisSummary: string | null;
}

export function DailyFocusCard({ weeklyFocus, diagnosisSummary }: DailyFocusCardProps) {
  if (!weeklyFocus && !diagnosisSummary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="border-0 bg-gradient-to-br from-levea-mint to-levea-sky overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">O que focar hoje</h3>
          </div>
          
          {weeklyFocus && (
            <div className="flex items-start gap-2 bg-background/60 rounded-lg p-3">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{weeklyFocus}</p>
            </div>
          )}
          
          {diagnosisSummary && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {diagnosisSummary}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
