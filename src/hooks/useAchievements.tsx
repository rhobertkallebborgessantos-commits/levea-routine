import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
  is_active: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  notified: boolean;
  achievement?: Achievement;
}

export interface UserStats {
  total_points: number;
  level: number;
  meals_count: number;
  teas_count: number;
  weights_count: number;
  checkins_count: number;
  photos_count: number;
  current_streak: number;
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCelebrations, setPendingCelebrations] = useState<Achievement[]>([]);
  const [pendingLevelUp, setPendingLevelUp] = useState<number | null>(null);
  const previousLevelRef = useRef<number | null>(null);

  // Fetch all achievements
  const fetchAchievements = useCallback(async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('requirement_value', { ascending: true });

    if (error) {
      console.error('Error fetching achievements:', error);
      return;
    }

    setAchievements(data || []);
  }, []);

  // Fetch user's unlocked achievements
  const fetchUserAchievements = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user achievements:', error);
      return;
    }

    setUserAchievements(data || []);
  }, [user]);

  // Fetch user stats for checking achievements
  const fetchUserStats = useCallback(async () => {
    if (!user) return;

    try {
      const [mealsRes, teasRes, weightsRes, checkinsRes, photosRes, streakRes, profileRes] = await Promise.all([
        supabase.from('meal_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tea_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('weight_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('weekly_checkins').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('progress_photos').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('total_points, level').eq('user_id', user.id).maybeSingle()
      ]);

      setUserStats({
        total_points: profileRes.data?.total_points || 0,
        level: profileRes.data?.level || 1,
        meals_count: mealsRes.count || 0,
        teas_count: teasRes.count || 0,
        weights_count: weightsRes.count || 0,
        checkins_count: checkinsRes.count || 0,
        photos_count: photosRes.count || 0,
        current_streak: streakRes.data?.current_streak || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [user]);

  // Check and unlock achievements
  const checkAndUnlockAchievements = useCallback(async () => {
    if (!user || !userStats || achievements.length === 0) return;

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
    const toUnlock: Achievement[] = [];

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirement_type) {
        case 'streak_days':
          shouldUnlock = userStats.current_streak >= achievement.requirement_value;
          break;
        case 'meals_logged':
          shouldUnlock = userStats.meals_count >= achievement.requirement_value;
          break;
        case 'teas_logged':
          shouldUnlock = userStats.teas_count >= achievement.requirement_value;
          break;
        case 'weight_logged':
          shouldUnlock = userStats.weights_count >= achievement.requirement_value;
          break;
        case 'checkins_completed':
          shouldUnlock = userStats.checkins_count >= achievement.requirement_value;
          break;
        case 'photos_uploaded':
          shouldUnlock = userStats.photos_count >= achievement.requirement_value;
          break;
      }

      if (shouldUnlock) {
        toUnlock.push(achievement);
      }
    }

    // Unlock achievements
    for (const achievement of toUnlock) {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id
        });

      if (!error) {
        setPendingCelebrations(prev => [...prev, achievement]);
      }
    }

    if (toUnlock.length > 0) {
      fetchUserAchievements();
      fetchUserStats();
    }
  }, [user, userStats, achievements, userAchievements, fetchUserAchievements, fetchUserStats]);

  // Track level changes
  useEffect(() => {
    if (userStats && previousLevelRef.current !== null) {
      if (userStats.level > previousLevelRef.current) {
        setPendingLevelUp(userStats.level);
      }
    }
    if (userStats) {
      previousLevelRef.current = userStats.level;
    }
  }, [userStats?.level]);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchAchievements();
      await fetchUserAchievements();
      await fetchUserStats();
      setIsLoading(false);
    };

    if (user) {
      init();
    }
  }, [user, fetchAchievements, fetchUserAchievements, fetchUserStats]);

  // Check achievements when stats change
  useEffect(() => {
    if (userStats && achievements.length > 0) {
      checkAndUnlockAchievements();
    }
  }, [userStats, achievements, checkAndUnlockAchievements]);

  // Get progress for an achievement
  const getProgress = useCallback((achievement: Achievement): { current: number; max: number; percentage: number } => {
    if (!userStats) return { current: 0, max: achievement.requirement_value, percentage: 0 };

    let current = 0;
    switch (achievement.requirement_type) {
      case 'streak_days':
        current = userStats.current_streak;
        break;
      case 'meals_logged':
        current = userStats.meals_count;
        break;
      case 'teas_logged':
        current = userStats.teas_count;
        break;
      case 'weight_logged':
        current = userStats.weights_count;
        break;
      case 'checkins_completed':
        current = userStats.checkins_count;
        break;
      case 'photos_uploaded':
        current = userStats.photos_count;
        break;
    }

    const max = achievement.requirement_value;
    const percentage = Math.min(100, (current / max) * 100);

    return { current, max, percentage };
  }, [userStats]);

  // Check if achievement is unlocked
  const isUnlocked = useCallback((achievementId: string): boolean => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  }, [userAchievements]);

  // Get achievements by category
  const getByCategory = useCallback((category: string): Achievement[] => {
    return achievements.filter(a => a.category === category);
  }, [achievements]);

  // Get recent unlocks
  const getRecentUnlocks = useCallback((limit: number = 5): UserAchievement[] => {
    return [...userAchievements]
      .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
      .slice(0, limit);
  }, [userAchievements]);

  return {
    achievements,
    userAchievements,
    userStats,
    isLoading,
    isUnlocked,
    getProgress,
    getByCategory,
    getRecentUnlocks,
    pendingCelebrations,
    pendingLevelUp,
    clearPendingCelebration: () => setPendingCelebrations(prev => prev.slice(1)),
    clearPendingLevelUp: () => setPendingLevelUp(null),
    refreshAchievements: async () => {
      await fetchUserStats();
      await fetchUserAchievements();
    }
  };
}
