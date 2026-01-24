import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RequireAuth, useAuth } from '@/hooks/useAuth';
import { useProfile, useUserPreferences } from '@/hooks/useProfile';
import { useTodayRoutines, useInitializeDailyRoutines, useToggleRoutineCompletion } from '@/hooks/useRoutines';
import { useUserStreak, useUpdateStreak } from '@/hooks/useStreaks';
import { useMotivationalMessage } from '@/hooks/useMotivationalMessage';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WeeklyProgressSummary } from '@/components/WeeklyProgressSummary';
import { DailyFocusCard } from '@/components/dashboard/DailyFocusCard';
import { NutritionProgress } from '@/components/dashboard/NutritionProgress';
import { TeaRecommendations } from '@/components/dashboard/TeaRecommendations';
import { QuickStatsRow } from '@/components/dashboard/QuickStatsRow';
import { ProgressPreviewCard } from '@/components/dashboard/ProgressPreviewCard';
import { RoutineSection } from '@/components/dashboard/RoutineSection';
import { WeeklyCheckinPrompt } from '@/components/dashboard/WeeklyCheckinPrompt';
import { BottomNav } from '@/components/BottomNav';
import { Leaf, LogOut, Bell } from 'lucide-react';

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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">LEVEA</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-display font-bold text-foreground">
            {greeting()}, {profile?.full_name?.split(' ')[0] || 'você'}! 👋
          </h1>
          {motivationalMessage && (
            <p className="text-sm text-muted-foreground">{motivationalMessage}</p>
          )}
        </motion.section>

        {/* Quick Stats */}
        <QuickStatsRow
          currentStreak={streak?.current_streak || 0}
          completedCount={completedCount}
          totalCount={totalCount}
          progressPercent={progressPercent}
        />

        {/* Daily Focus */}
        <DailyFocusCard
          weeklyFocus={preferences?.weekly_focus || null}
          diagnosisSummary={preferences?.diagnosis_summary || null}
        />

        {/* Nutrition Progress */}
        <NutritionProgress />

        {/* Weekly Check-in Prompt */}
        <WeeklyCheckinPrompt />

        {/* Tea Recommendations */}
        <TeaRecommendations />

        {/* Progress Preview */}
        <ProgressPreviewCard />

        {/* Weekly Progress Summary */}
        <WeeklyProgressSummary />

        {/* Today's Routine */}
        <RoutineSection
          routines={routines}
          isLoading={routinesLoading}
          onToggle={handleToggleRoutine}
        />
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
