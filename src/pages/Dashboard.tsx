import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RequireAuth, useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTodayRoutines, useInitializeDailyRoutines, useToggleRoutineCompletion } from '@/hooks/useRoutines';
import { useUserStreak, useUpdateStreak } from '@/hooks/useStreaks';
import { useMotivationalMessage } from '@/hooks/useMotivationalMessage';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { TIME_BLOCK_STYLES } from '@/lib/constants';
import { Leaf, LogOut, Flame, Sun, Coffee, CloudSun, Moon, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const timeBlockIcons = {
  morning: Sun,
  lunch: Coffee,
  afternoon: CloudSun,
  evening: Moon,
};

function DashboardContent() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: routines, isLoading: routinesLoading } = useTodayRoutines();
  const { data: streak } = useUserStreak();
  const { data: motivationalMessage } = useMotivationalMessage();
  const initializeRoutines = useInitializeDailyRoutines();
  const toggleCompletion = useToggleRoutineCompletion();
  const updateStreak = useUpdateStreak();
  const navigate = useNavigate();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!profileLoading && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [profile, profileLoading, navigate]);

  // Initialize daily routines
  useEffect(() => {
    if (user && !routinesLoading && routines && routines.length === 0) {
      initializeRoutines.mutate();
    }
  }, [user, routines, routinesLoading]);

  // Update streak on page load
  useEffect(() => {
    if (user) {
      updateStreak.mutate();
    }
  }, [user]);

  const handleToggleRoutine = async (routineId: string, isCompleted: boolean) => {
    await toggleCompletion.mutateAsync({ routineId, isCompleted: !isCompleted });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const completedCount = routines?.filter(r => r.is_completed).length || 0;
  const totalCount = routines?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Group routines by time block
  const routinesByBlock = routines?.reduce((acc, routine) => {
    const block = routine.time_block;
    if (!acc[block]) acc[block] = [];
    acc[block].push(routine);
    return acc;
  }, {} as Record<string, typeof routines>) || {};

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">LEVEA</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-display font-bold text-foreground">
            {greeting()}, {profile?.full_name?.split(' ')[0] || 'você'}! 👋
          </h1>
          {motivationalMessage && (
            <p className="text-muted-foreground">{motivationalMessage}</p>
          )}
        </motion.section>

        {/* Stats Row */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          {/* Streak Card */}
          <Card className="bg-gradient-to-br from-levea-warm to-levea-rose border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
                <Flame className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {streak?.current_streak || 0}
                </p>
                <p className="text-sm text-muted-foreground">Dias seguidos</p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="bg-gradient-to-br from-levea-mint to-levea-sky border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
                <div className="relative">
                  <svg className="w-8 h-8 -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-background/50"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${progressPercent * 0.754} 100`}
                      className="text-primary"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {completedCount}/{totalCount}
                </p>
                <p className="text-sm text-muted-foreground">Tarefas de hoje</p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Today's Routine */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-display font-semibold text-foreground">
            Rotina de Hoje
          </h2>

          {routinesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(['morning', 'lunch', 'afternoon', 'evening'] as const).map((block) => {
                const blockRoutines = routinesByBlock[block] || [];
                if (blockRoutines.length === 0) return null;

                const style = TIME_BLOCK_STYLES[block];
                const Icon = timeBlockIcons[block];

                return (
                  <Card key={block} className="overflow-hidden border-border/50">
                    <CardHeader className={cn("py-3 px-4", style.bg)}>
                      <CardTitle className={cn("text-base font-medium flex items-center gap-2", style.text)}>
                        <Icon className="h-4 w-4" />
                        {style.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-border/50">
                      {blockRoutines.map((routine) => (
                        <div
                          key={routine.id}
                          className={cn(
                            "p-4 flex items-start gap-3 transition-colors",
                            routine.is_completed && "bg-muted/30"
                          )}
                        >
                          <Checkbox
                            checked={routine.is_completed || false}
                            onCheckedChange={() => handleToggleRoutine(routine.id, routine.is_completed || false)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium text-foreground",
                              routine.is_completed && "line-through text-muted-foreground"
                            )}>
                              {routine.action_title}
                            </p>
                            {routine.action_description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {routine.action_description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}