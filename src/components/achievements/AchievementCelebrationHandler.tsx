import { useEffect } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { useCelebration } from './CelebrationProvider';

export function AchievementCelebrationHandler() {
  const { 
    pendingCelebrations, 
    pendingLevelUp, 
    clearPendingCelebration, 
    clearPendingLevelUp 
  } = useAchievements();
  
  const { celebrateAchievement, celebrateLevelUp } = useCelebration();

  // Handle pending achievements
  useEffect(() => {
    if (pendingCelebrations.length > 0) {
      const achievement = pendingCelebrations[0];
      celebrateAchievement(achievement);
      clearPendingCelebration();
    }
  }, [pendingCelebrations, celebrateAchievement, clearPendingCelebration]);

  // Handle level up
  useEffect(() => {
    if (pendingLevelUp !== null) {
      celebrateLevelUp(pendingLevelUp);
      clearPendingLevelUp();
    }
  }, [pendingLevelUp, celebrateLevelUp, clearPendingLevelUp]);

  return null;
}
