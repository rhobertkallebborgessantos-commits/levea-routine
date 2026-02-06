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
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 bg-gradient-to-br from-levea-mint to-levea-sky overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/10">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Target className="h-4 w-4 text-primary" />
            </motion.div>
            <h3 className="font-semibold text-foreground">O que focar hoje</h3>
          </div>
          
          {weeklyFocus && (
            <motion.div 
              className="flex items-start gap-2 bg-background/60 rounded-lg p-3"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{weeklyFocus}</p>
            </motion.div>
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
