import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RequireAuth, useAuth } from '@/hooks/useAuth';
import { useProfile, useUserPreferences } from '@/hooks/useProfile';
import { useTodayRoutines, useInitializeDailyRoutines, useToggleRoutineCompletion } from '@/hooks/useRoutines';
import { useUserStreak, useUpdateStreak } from '@/hooks/useStreaks';
import { useMotivationalMessage } from '@/hooks/useMotivationalMessage';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WeeklyProgressSummary } from '@/components/WeeklyProgressSummary';
import { DailyFocusCard } from '@/components/dashboard/DailyFocusCard';
import { NutritionProgress } from '@/components/dashboard/NutritionProgress';
import { TeaRecommendations } from '@/components/dashboard/TeaRecommendations';
import { QuickStatsRow } from '@/components/dashboard/QuickStatsRow';
import { ProgressPreviewCard } from '@/components/dashboard/ProgressPreviewCard';
import { RoutineSection } from '@/components/dashboard/RoutineSection';
import { WeeklyCheckinPrompt } from '@/components/dashboard/WeeklyCheckinPrompt';
import { AchievementsWidget } from '@/components/dashboard/AchievementsWidget';
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection';
import { StaggeredItem } from '@/components/dashboard/StaggeredList';
import { BottomNav } from '@/components/BottomNav';
import { DashboardSkeleton } from '@/components/skeletons';
import { 
  Leaf, 
  LogOut, 
  Target, 
  Utensils, 
  LeafIcon, 
  TrendingUp, 
  Trophy, 
  Calendar,
  ListChecks
} from 'lucide-react';

function DashboardContent() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: preferences } = useUserPreferences();
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <span className="font-display font-semibold text-foreground">LEVEA</span>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {profileLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Welcome Section - Always visible, staggered entry */}
            <StaggeredItem index={0} baseDelay={0.1}>
              <section className="space-y-1">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {greeting()}, {profile?.full_name?.split(' ')[0] || 'você'}! 👋
                </h1>
                {motivationalMessage && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-muted-foreground"
                  >
                    {motivationalMessage}
                  </motion.p>
                )}
              </section>
            </StaggeredItem>

            {/* Quick Stats - Always visible */}
            <StaggeredItem index={1} baseDelay={0.1}>
              <QuickStatsRow
                currentStreak={streak?.current_streak || 0}
                completedCount={completedCount}
                totalCount={totalCount}
                progressPercent={progressPercent}
              />
            </StaggeredItem>

            {/* Daily Focus - Collapsible */}
            {(preferences?.weekly_focus || preferences?.diagnosis_summary) && (
              <CollapsibleSection
                id="daily-focus"
                title="Foco do Dia"
                icon={<Target className="h-4 w-4" />}
                defaultOpen={true}
                delay={0.2}
              >
                <DailyFocusCard
                  weeklyFocus={preferences?.weekly_focus || null}
                  diagnosisSummary={preferences?.diagnosis_summary || null}
                />
              </CollapsibleSection>
            )}

            {/* Weekly Check-in Prompt - Not in collapsible, shows conditionally */}
            <StaggeredItem index={3} baseDelay={0.1}>
              <WeeklyCheckinPrompt />
            </StaggeredItem>

            {/* Nutrition - Collapsible */}
            <CollapsibleSection
              id="nutrition"
              title="Nutrição"
              icon={<Utensils className="h-4 w-4" />}
              defaultOpen={true}
              delay={0.25}
            >
              <NutritionProgress />
            </CollapsibleSection>

            {/* Tea Recommendations - Collapsible */}
            <CollapsibleSection
              id="tea-recommendations"
              title="Chás"
              icon={<LeafIcon className="h-4 w-4" />}
              defaultOpen={true}
              delay={0.3}
            >
              <TeaRecommendations />
            </CollapsibleSection>

            {/* Progress Preview - Collapsible */}
            <CollapsibleSection
              id="progress-preview"
              title="Meu Progresso"
              icon={<TrendingUp className="h-4 w-4" />}
              defaultOpen={true}
              delay={0.35}
            >
              <ProgressPreviewCard />
            </CollapsibleSection>

            {/* Achievements - Collapsible */}
            <CollapsibleSection
              id="achievements"
              title="Conquistas"
              icon={<Trophy className="h-4 w-4" />}
              defaultOpen={true}
              delay={0.4}
            >
              <AchievementsWidget />
            </CollapsibleSection>

            {/* Weekly Progress Summary - Collapsible */}
            <CollapsibleSection
              id="weekly-summary"
              title="Resumo Semanal"
              icon={<Calendar className="h-4 w-4" />}
              defaultOpen={false}
              delay={0.45}
            >
              <WeeklyProgressSummary />
            </CollapsibleSection>

            {/* Today's Routine - Always visible (core feature) */}
            <StaggeredItem index={10} baseDelay={0.1}>
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-display font-semibold text-foreground">
                    Rotina de Hoje
                  </h2>
                </div>
                <RoutineSection
                  routines={routines}
                  isLoading={routinesLoading}
                  onToggle={handleToggleRoutine}
                />
              </section>
            </StaggeredItem>
          </>
        )}
      </main>

      <BottomNav />
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
