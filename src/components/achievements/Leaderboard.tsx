import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-chart-4" />;
    case 2:
      return <Medal className="h-5 w-5 text-muted-foreground" />;
    case 3:
      return <Medal className="h-5 w-5 text-chart-3" />;
    default:
      return null;
  }
};

const getRankBgClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-chart-4/20 to-chart-4/5 border-chart-4/30';
    case 2:
      return 'bg-gradient-to-r from-muted/40 to-muted/10 border-muted-foreground/30';
    case 3:
      return 'bg-gradient-to-r from-chart-3/20 to-chart-3/5 border-chart-3/30';
    default:
      return 'bg-card border-border/50';
  }
};

interface LeaderboardProps {
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export function Leaderboard({ limit = 10, showTitle = true, compact = false }: LeaderboardProps) {
  const { leaderboard, userRank, isLoading, currentUserId } = useLeaderboard(limit);

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Ranking
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={cn("space-y-2", !showTitle && "pt-4")}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const isUserInTop = leaderboard.some(entry => entry.user_id === currentUserId);

  return (
    <Card>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Ranking
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("space-y-2", !showTitle && "pt-4")}>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum usuário no ranking ainda</p>
            <p className="text-xs">Desbloqueie conquistas para aparecer aqui!</p>
          </div>
        ) : (
          <>
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.user_id === currentUserId;
              const rankIcon = getRankIcon(entry.rank);
              
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-all',
                    getRankBgClass(entry.rank),
                    isCurrentUser && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    entry.rank <= 3 ? 'bg-transparent' : 'bg-muted'
                  )}>
                    {rankIcon || `#${entry.rank}`}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {entry.full_name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium truncate',
                      isCurrentUser && 'text-primary'
                    )}>
                      {entry.full_name || 'Usuário'}
                      {isCurrentUser && <span className="text-xs ml-1 opacity-70">(você)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nível {entry.level}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="font-bold text-primary">{entry.total_points}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Show user's rank if not in top */}
            {!isUserInTop && userRank && (
              <>
                <div className="flex items-center gap-2 py-2 text-muted-foreground">
                  <div className="flex-1 border-t border-dashed" />
                  <span className="text-xs">···</span>
                  <div className="flex-1 border-t border-dashed" />
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg border ring-2 ring-primary ring-offset-1 ring-offset-background bg-primary/5"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-muted">
                    #{userRank.rank}
                  </div>

                  <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage src={userRank.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userRank.full_name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-primary">
                      {userRank.full_name || 'Usuário'}
                      <span className="text-xs ml-1 opacity-70">(você)</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nível {userRank.level}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary">{userRank.total_points}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
