import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { xpForNextLevel, totalXpForLevel, getLevelTitle, getLevelColor, XP_REWARDS, DAILY_XP_CAP } from '@/lib/xp-config';

interface LevelProgressProps {
  level: number;
  totalPoints: number;
  className?: string;
}

function getDynamicMilestones(level: number): number[] {
  const base = [5, 10, 20, 50];
  const milestones: number[] = [];
  for (const m of base) {
    if (m > level + 20) break;
    milestones.push(m);
  }
  let next = 50;
  while (milestones.length < 4 || milestones[milestones.length - 1] <= level) {
    next = next < 100 ? next + 25 : next + 50;
    if (!milestones.includes(next)) milestones.push(next);
    if (milestones.length >= 6) break;
  }
  return milestones.slice(-4);
}

export function LevelProgress({ level, totalPoints, className }: LevelProgressProps) {
  // New formula: XP_next = 120 × (level ^ 1.35)
  const xpForCurrent = totalXpForLevel(level);
  const xpNeeded = xpForNextLevel(level);
  const xpInCurrentLevel = totalPoints - xpForCurrent;
  const progressPercent = Math.min(100, (xpInCurrentLevel / xpNeeded) * 100);

  const title = getLevelTitle(level);
  const titleColor = getLevelColor(level);

  return (
    <div className={cn('p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-lg font-bold text-primary-foreground">{level}</span>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-1 border-2 border-dashed border-primary/30 rounded-full"
            />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">Nível</p>
            <p className={cn('font-semibold', titleColor)}>
              {title}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-primary">
            <Zap className="h-4 w-4" />
            <span className="font-bold">{totalPoints}</span>
          </div>
          <p className="text-xs text-muted-foreground">XP total</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso para nível {level + 1}</span>
          <span>{xpInCurrentLevel}/{xpNeeded} XP</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* XP info */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-primary/10">
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground">Limite diário</p>
          <p className="text-sm font-medium">{DAILY_XP_CAP} XP</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground">Por hábito</p>
          <p className="text-sm font-medium">{XP_REWARDS.HABIT_COMPLETED} XP</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground">Login diário</p>
          <p className="text-sm font-medium">{XP_REWARDS.DAILY_LOGIN} XP</p>
        </div>
      </div>

      {/* Level milestones */}
      <div className="flex justify-between mt-3 pt-3 border-t border-primary/10">
        {getDynamicMilestones(level).map((milestone) => (
          <div key={milestone} className="flex flex-col items-center">
            <Star 
              className={cn(
                'h-4 w-4',
                level >= milestone ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'
              )} 
            />
            <span className={cn(
              'text-xs mt-1',
              level >= milestone ? 'text-foreground font-medium' : 'text-muted-foreground/50'
            )}>
              {milestone}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
