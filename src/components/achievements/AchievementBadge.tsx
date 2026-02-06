import { motion } from 'framer-motion';
import { 
  Flame, 
  Utensils, 
  Coffee, 
  Scale, 
  Target, 
  ClipboardCheck, 
  Camera, 
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Achievement } from '@/hooks/useAchievements';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
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

const sizeClasses = {
  sm: 'h-8 w-8 p-1.5',
  md: 'h-12 w-12 p-2.5',
  lg: 'h-16 w-16 p-3'
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

const tierColors: Record<string, string> = {
  bronze: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/40',
  silver: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-400/40',
  gold: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/40'
};

export function AchievementBadge({ achievement, size = 'md', showTooltip = true }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Trophy;
  const tierClass = tierColors[achievement.tier] || tierColors.bronze;
  
  const badge = (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'rounded-full flex items-center justify-center shadow-lg',
        sizeClasses[size],
        tierClass
      )}
    >
      <Icon className={iconSizes[size]} />
    </motion.div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="text-center">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            <p className="text-xs text-primary mt-1">+{achievement.points} pontos</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
