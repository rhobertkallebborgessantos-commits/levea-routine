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

// Dynamic tier names that cycle infinitely
const TIER_CYCLE = ['bronze', 'silver', 'gold', 'diamond', 'legendary'] as const;
const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  diamond: 'Diamante',
  legendary: 'Lendário',
};

// Generate the next milestone value using exponential scaling
function getNextMilestone(lastValue: number): number {
  if (lastValue < 50) return lastValue * 2;
  if (lastValue < 200) return Math.round(lastValue * 1.5);
  return Math.round(lastValue * 1.3);
}

// Generate dynamic achievements beyond the fixed DB ones
function generateDynamicAchievements(
  fixedAchievements: Achievement[],
  userStats: UserStats
): Achievement[] {
  const byType = new Map<string, Achievement[]>();
  for (const a of fixedAchievements) {
    const list = byType.get(a.requirement_type) || [];
    list.push(a);
    byType.set(a.requirement_type, list);
  }

  const dynamicAchievements: Achievement[] = [];

  for (const [reqType, achievements] of byType) {
    const sorted = [...achievements].sort((a, b) => a.requirement_value - b.requirement_value);
    const highest = sorted[sorted.length - 1];
    
    // Get current user value for this type
    let currentValue = 0;
    switch (reqType) {
      case 'streak_days': currentValue = userStats.current_streak; break;
      case 'meals_logged': currentValue = userStats.meals_count; break;
      case 'teas_logged': currentValue = userStats.teas_count; break;
      case 'weight_logged': currentValue = userStats.weights_count; break;
      case 'checkins_completed': currentValue = userStats.checkins_count; break;
      case 'photos_uploaded': currentValue = userStats.photos_count; break;
    }

    // Generate up to 3 milestones beyond the highest fixed one
    let lastValue = highest.requirement_value;
    const tierIndex = TIER_CYCLE.indexOf(highest.tier as any);
    
    for (let i = 0; i < 3; i++) {
      const nextValue = getNextMilestone(lastValue);
      // Only generate if user is within reasonable range or already past
      if (nextValue > currentValue * 3 && nextValue > lastValue * 2) break;
      
      const cycleIdx = (tierIndex + 1 + i) % TIER_CYCLE.length;
      const tier = TIER_CYCLE[cycleIdx];
      const tierNum = Math.floor((tierIndex + 1 + i) / TIER_CYCLE.length) + 1;
      const tierLabel = tierNum > 1 ? `${TIER_LABELS[tier]} ${tierNum}` : TIER_LABELS[tier];
      
      const dynamicId = `dynamic_${reqType}_${nextValue}`;
      dynamicAchievements.push({
        id: dynamicId,
        slug: dynamicId,
        name: `${highest.name.replace(/\d+/, String(nextValue))}`,
        description: highest.description.replace(/\d+/, String(nextValue)),
        icon: highest.icon,
        category: highest.category,
        tier: tier,
        points: Math.round(highest.points * (1.5 + i * 0.5)),
        requirement_type: reqType,
        requirement_value: nextValue,
        is_active: true,
      });
      
      lastValue = nextValue;
    }
  }

  return dynamicAchievements;
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

  // Check and unlock achievements (only fixed DB achievements)
  const checkAndUnlockAchievements = useCallback(async () => {
    if (!user || !userStats || achievements.length === 0) return;

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
    const toUnlock: Achievement[] = [];

    // Only check fixed (non-dynamic) achievements for DB unlock
    for (const achievement of achievements.filter(a => !a.id.startsWith('dynamic_'))) {
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

  // Generate dynamic achievements when stats change
  const dynamicAchievements = userStats && achievements.length > 0
    ? generateDynamicAchievements(achievements, userStats)
    : [];

  // Combined list: fixed + dynamic
  const allAchievements = [...achievements, ...dynamicAchievements];

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

  // Check if achievement is unlocked (supports dynamic achievements)
  const isUnlocked = useCallback((achievementId: string): boolean => {
    if (achievementId.startsWith('dynamic_')) {
      // Dynamic achievements are "unlocked" if user stats meet the requirement
      if (!userStats) return false;
      const allAchievements = [...achievements, ...dynamicAchievements];
      const achievement = allAchievements.find(a => a.id === achievementId);
      if (!achievement) return false;
      let current = 0;
      switch (achievement.requirement_type) {
        case 'streak_days': current = userStats.current_streak; break;
        case 'meals_logged': current = userStats.meals_count; break;
        case 'teas_logged': current = userStats.teas_count; break;
        case 'weight_logged': current = userStats.weights_count; break;
        case 'checkins_completed': current = userStats.checkins_count; break;
        case 'photos_uploaded': current = userStats.photos_count; break;
      }
      return current >= achievement.requirement_value;
    }
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  }, [userAchievements, userStats, achievements]);

  // Get achievements by category (includes dynamic)
  const getByCategory = useCallback((category: string): Achievement[] => {
    return allAchievements.filter(a => a.category === category);
  }, [allAchievements]);

  // Get recent unlocks
  const getRecentUnlocks = useCallback((limit: number = 5): UserAchievement[] => {
    return [...userAchievements]
      .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
      .slice(0, limit);
  }, [userAchievements]);

  return {
    achievements: allAchievements,
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
