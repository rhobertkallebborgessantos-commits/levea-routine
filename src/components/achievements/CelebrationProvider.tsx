import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { AchievementUnlockedModal } from './AchievementUnlockedModal';
import { LevelUpModal } from './LevelUpModal';
import { Achievement } from '@/hooks/useAchievements';

interface CelebrationContextType {
  celebrateAchievement: (achievement: Achievement) => void;
  celebrateLevelUp: (newLevel: number) => void;
}

const CelebrationContext = createContext<CelebrationContextType | null>(null);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}

interface CelebrationProviderProps {
  children: ReactNode;
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [levelUpQueue, setLevelUpQueue] = useState<number[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [isAchievementOpen, setIsAchievementOpen] = useState(false);
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const processingRef = useRef(false);

  const celebrateAchievement = useCallback((achievement: Achievement) => {
    setAchievementQueue(prev => [...prev, achievement]);
  }, []);

  const celebrateLevelUp = useCallback((newLevel: number) => {
    setLevelUpQueue(prev => [...prev, newLevel]);
  }, []);

  // Process queues one by one
  useEffect(() => {
    if (processingRef.current) return;
    if (isAchievementOpen || isLevelUpOpen) return;

    // Prioritize level up celebrations
    if (levelUpQueue.length > 0) {
      processingRef.current = true;
      const [nextLevel, ...rest] = levelUpQueue;
      setLevelUpQueue(rest);
      setCurrentLevel(nextLevel);
      setIsLevelUpOpen(true);
      setTimeout(() => {
        processingRef.current = false;
      }, 100);
      return;
    }

    // Then process achievements
    if (achievementQueue.length > 0) {
      processingRef.current = true;
      const [nextAchievement, ...rest] = achievementQueue;
      setAchievementQueue(rest);
      setCurrentAchievement(nextAchievement);
      setIsAchievementOpen(true);
      setTimeout(() => {
        processingRef.current = false;
      }, 100);
    }
  }, [achievementQueue, levelUpQueue, isAchievementOpen, isLevelUpOpen]);

  const handleCloseAchievement = useCallback(() => {
    setIsAchievementOpen(false);
    setTimeout(() => {
      setCurrentAchievement(null);
    }, 300);
  }, []);

  const handleCloseLevelUp = useCallback(() => {
    setIsLevelUpOpen(false);
    setTimeout(() => {
      setCurrentLevel(null);
    }, 300);
  }, []);

  return (
    <CelebrationContext.Provider value={{ celebrateAchievement, celebrateLevelUp }}>
      {children}
      <AchievementUnlockedModal
        achievement={currentAchievement}
        isOpen={isAchievementOpen}
        onClose={handleCloseAchievement}
      />
      <LevelUpModal
        newLevel={currentLevel || 1}
        isOpen={isLevelUpOpen}
        onClose={handleCloseLevelUp}
      />
    </CelebrationContext.Provider>
  );
}
