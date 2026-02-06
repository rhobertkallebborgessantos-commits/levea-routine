import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, CheckCircle2, TrendingUp } from 'lucide-react';

interface QuickStatsRowProps {
  currentStreak: number;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

export function QuickStatsRow({ 
  currentStreak, 
  completedCount, 
  totalCount, 
  progressPercent 
}: QuickStatsRowProps) {
  const stats = [
    {
      icon: Flame,
      iconClass: 'text-destructive',
      value: currentStreak,
      label: 'dias',
      gradient: 'from-levea-warm to-levea-rose',
    },
    {
      icon: CheckCircle2,
      iconClass: 'text-primary',
      value: `${completedCount}/${totalCount}`,
      label: 'tarefas',
      gradient: 'from-levea-mint to-levea-sky',
    },
    {
      icon: TrendingUp,
      iconClass: 'text-accent-foreground',
      value: `${Math.round(progressPercent)}%`,
      label: 'hoje',
      gradient: 'from-levea-lavender to-levea-sky',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Card className={`bg-gradient-to-br ${stat.gradient} border-0 cursor-default transition-shadow hover:shadow-md`}>
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center mb-1"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className={`h-5 w-5 ${stat.iconClass}`} />
                </motion.div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
