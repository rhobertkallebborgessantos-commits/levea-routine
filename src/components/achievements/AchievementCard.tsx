import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Utensils, 
  Coffee, 
  Scale, 
  Target, 
  ClipboardCheck, 
  Camera, 
  Trophy,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Achievement } from '@/hooks/useAchievements';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: { current: number; max: number; percentage: number };
  unlockedAt?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  utensils: Utensils,
  coffee: Coffee,
  scale: Scale,
  target: Target,
  'clipboard-check': ClipboardCheck,
  camera: Camera,
  trophy: Trophy
};

const tierColors: Record<string, {
  bg: string;
  border: string;
  icon: string;
  glow: string;
}> = {
  bronze: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-300 dark:border-amber-700',
    icon: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-200/50 dark:shadow-amber-800/30'
  },
  silver: {
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    border: 'border-slate-300 dark:border-slate-600',
    icon: 'text-slate-500 dark:text-slate-400',
    glow: 'shadow-slate-200/50 dark:shadow-slate-700/30'
  },
  gold: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-500 dark:border-amber-500',
    icon: 'text-amber-500 dark:text-amber-400',
    glow: 'shadow-amber-300/50 dark:shadow-amber-600/30'
  },
  diamond: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    border: 'border-cyan-400 dark:border-cyan-500',
    icon: 'text-cyan-500 dark:text-cyan-400',
    glow: 'shadow-cyan-300/50 dark:shadow-cyan-600/30'
  },
  legendary: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-500 dark:border-purple-400',
    icon: 'text-purple-500 dark:text-purple-400',
    glow: 'shadow-purple-300/50 dark:shadow-purple-500/30'
  }
};

export const AchievementCard = React.forwardRef<HTMLDivElement, AchievementCardProps>(
  function AchievementCard({ achievement, isUnlocked, progress, unlockedAt }, ref) {
    const Icon = iconMap[achievement.icon] || Trophy;
    const tier = achievement.tier as keyof typeof tierColors;
    const tierStyle = tierColors[tier] || tierColors.bronze;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={isUnlocked ? { scale: 1.02 } : undefined}
        className={cn(
          'relative p-4 rounded-xl border-2 transition-all duration-300',
          isUnlocked 
            ? cn(tierStyle.bg, tierStyle.border, 'shadow-lg', tierStyle.glow)
            : 'bg-muted/30 border-muted-foreground/20 opacity-60'
        )}
      >
        {/* Lock overlay for locked achievements */}
        {!isUnlocked && (
          <div className="absolute top-2 right-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 p-3 rounded-full',
            isUnlocked 
              ? cn(tierStyle.bg, tierStyle.icon) 
              : 'bg-muted text-muted-foreground'
          )}>
            <Icon className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-semibold truncate',
                isUnlocked ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {achievement.name}
              </h3>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                isUnlocked ? tierStyle.bg : 'bg-muted',
                isUnlocked ? tierStyle.icon : 'text-muted-foreground'
              )}>
                {achievement.tier}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              {achievement.description}
            </p>

            {/* Progress bar for locked achievements */}
            {!isUnlocked && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span>{progress.current}/{progress.max}</span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
              </div>
            )}

            {/* Points and unlock date */}
            <div className="flex items-center justify-between mt-3">
              <span className={cn(
                'text-sm font-medium',
                isUnlocked ? 'text-primary' : 'text-muted-foreground'
              )}>
                +{achievement.points} pontos
              </span>
              
              {isUnlocked && unlockedAt && (
                <span className="text-xs text-muted-foreground">
                  Desbloqueado em {new Date(unlockedAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Shimmer effect for unlocked achievements */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={cn(
              'absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent',
              'animate-shimmer'
            )} />
          </motion.div>
        )}
      </motion.div>
    );
  }
);
