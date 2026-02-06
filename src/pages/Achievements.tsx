import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Utensils, Coffee, Scale, ClipboardCheck, Camera, Filter } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { BottomNav } from '@/components/BottomNav';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { LevelProgress } from '@/components/achievements/LevelProgress';
import { useAchievements } from '@/hooks/useAchievements';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'Todas', icon: Trophy },
  { id: 'streak', label: 'Sequência', icon: Flame },
  { id: 'meals', label: 'Refeições', icon: Utensils },
  { id: 'tea', label: 'Chás', icon: Coffee },
  { id: 'weight', label: 'Peso', icon: Scale },
  { id: 'checkin', label: 'Check-ins', icon: ClipboardCheck },
  { id: 'photos', label: 'Fotos', icon: Camera },
];

export default function Achievements() {
  const { achievements, userAchievements, userStats, isLoading, isUnlocked, getProgress } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const filteredAchievements = achievements.filter(a => {
    const categoryMatch = selectedCategory === 'all' || a.category === selectedCategory;
    const unlockedMatch = !showUnlockedOnly || isUnlocked(a.id);
    return categoryMatch && unlockedMatch;
  });

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background pb-20">
          <div className="p-4 space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="flex gap-2 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 w-20 rounded-full flex-shrink-0" />
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <BottomNav />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background p-4 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-7 w-7 text-yellow-500" />
            <h1 className="text-2xl font-bold">Conquistas</h1>
          </div>
          
          {/* Stats summary */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 p-3 rounded-lg bg-background/50 backdrop-blur">
              <p className="text-2xl font-bold text-primary">{unlockedCount}</p>
              <p className="text-xs text-muted-foreground">Desbloqueadas</p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-background/50 backdrop-blur">
              <p className="text-2xl font-bold">{totalCount - unlockedCount}</p>
              <p className="text-xs text-muted-foreground">Restantes</p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-background/50 backdrop-blur">
              <p className="text-2xl font-bold text-yellow-500">
                {Math.round((unlockedCount / totalCount) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Completo</p>
            </div>
          </div>

          {/* Level progress */}
          <LevelProgress 
            level={userStats?.level || 1} 
            totalPoints={userStats?.total_points || 0} 
          />
        </div>

        {/* Category filter */}
        <div className="p-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex-shrink-0 gap-1.5',
                    selectedCategory === cat.id && 'shadow-md'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Filter toggle */}
        <div className="px-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            className={cn(
              'gap-2',
              showUnlockedOnly && 'bg-primary/10 text-primary'
            )}
          >
            <Filter className="h-4 w-4" />
            {showUnlockedOnly ? 'Mostrando desbloqueadas' : 'Mostrar apenas desbloqueadas'}
          </Button>
        </div>

        {/* Achievements list */}
        <div className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achievement) => {
              const unlocked = isUnlocked(achievement.id);
              const progress = getProgress(achievement);
              const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
              
              return (
                <motion.div
                  key={achievement.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <AchievementCard
                    achievement={achievement}
                    isUnlocked={unlocked}
                    progress={progress}
                    unlockedAt={userAchievement?.unlocked_at}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {showUnlockedOnly 
                  ? 'Nenhuma conquista desbloqueada nesta categoria'
                  : 'Nenhuma conquista encontrada'}
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </PageTransition>
  );
}
