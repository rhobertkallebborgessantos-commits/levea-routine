import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { useAchievements } from '@/hooks/useAchievements';
import { Skeleton } from '@/components/ui/skeleton';

export function AchievementsWidget() {
  const { userAchievements, userStats, achievements, isLoading, getRecentUnlocks, isUnlocked, getProgress } = useAchievements();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-12 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentUnlocks = getRecentUnlocks(3);
  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

  // Find next achievement to unlock
  const nextToUnlock = achievements
    .filter(a => !isUnlocked(a.id))
    .map(a => ({ achievement: a, progress: getProgress(a) }))
    .sort((a, b) => b.progress.percentage - a.progress.percentage)[0];

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md hover:shadow-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                <Trophy className="h-5 w-5 text-yellow-500" />
              </motion.div>
              Conquistas
            </CardTitle>
            <Link to="/achievements">
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                Ver todas
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Stats row */}
          <motion.div 
            className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {userStats?.level || 1}
              </motion.div>
              <div>
                <p className="text-sm font-medium">Nível {userStats?.level || 1}</p>
                <p className="text-xs text-muted-foreground">{unlockedCount}/{totalCount} conquistas</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="h-4 w-4" />
              <span className="font-bold">{userStats?.total_points || 0}</span>
            </div>
          </motion.div>

          {/* Recent unlocks */}
          {recentUnlocks.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Recentes</p>
              <div className="flex gap-2">
                {recentUnlocks.map((ua) => (
                  <motion.div
                    key={ua.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <AchievementBadge 
                      achievement={ua.achievement as any} 
                      size="md" 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Next to unlock */}
          {nextToUnlock && (
            <motion.div 
              className="p-3 rounded-lg border border-dashed border-muted-foreground/30"
              whileHover={{ borderColor: 'hsl(var(--primary) / 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs text-muted-foreground mb-1">Próxima conquista</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{nextToUnlock.achievement.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(nextToUnlock.progress.percentage)}% completo
                  </p>
                </div>
                <span className="text-xs text-primary font-medium">
                  +{nextToUnlock.achievement.points} pts
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nextToUnlock.progress.percentage}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {recentUnlocks.length === 0 && !nextToUnlock && (
            <div className="text-center py-4">
              <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Continue usando o app para desbloquear conquistas!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
