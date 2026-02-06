import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AchievementBadge } from './AchievementBadge';
import { Confetti } from './Confetti';
import { Achievement } from '@/hooks/useAchievements';

interface AchievementUnlockedModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementUnlockedModal({ achievement, isOpen, onClose }: AchievementUnlockedModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && achievement) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, achievement]);

  if (!achievement) return null;

  const tierColors = {
    bronze: 'from-amber-600/20 via-amber-500/10 to-transparent',
    silver: 'from-slate-400/20 via-slate-300/10 to-transparent',
    gold: 'from-yellow-500/20 via-yellow-400/10 to-transparent',
  };

  const tierGlow = {
    bronze: 'shadow-amber-500/30',
    silver: 'shadow-slate-400/30',
    gold: 'shadow-yellow-500/30',
  };

  return (
    <>
      <Confetti isActive={showConfetti} particleCount={60} />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: {
                  type: 'spring',
                  damping: 15,
                  stiffness: 300,
                }
              }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-sm bg-card rounded-2xl border shadow-2xl overflow-hidden ${tierGlow[achievement.tier as keyof typeof tierGlow] || ''}`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-b ${tierColors[achievement.tier as keyof typeof tierColors] || tierColors.bronze}`} />
              
              {/* Animated glow ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-2xl border-2 border-primary/30"
              />

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Content */}
              <div className="relative p-6 pt-8 text-center">
                {/* Header */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Conquista Desbloqueada!
                  </span>
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>

                {/* Badge with animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 10,
                    stiffness: 200,
                    delay: 0.3,
                  }}
                  className="flex justify-center mb-4"
                >
                  <div className="relative">
                    <AchievementBadge
                      achievement={achievement}
                      size="lg"
                      showTooltip={false}
                    />
                    {/* Pulse effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                      className="absolute inset-0 rounded-full bg-primary/20"
                    />
                  </div>
                </motion.div>

                {/* Achievement info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {achievement.description}
                  </p>

                  {/* Points earned */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring' }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold"
                  >
                    <span className="text-lg">+{achievement.points}</span>
                    <span className="text-sm">pontos</span>
                  </motion.div>
                </motion.div>

                {/* Action button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-6"
                >
                  <Button onClick={onClose} className="w-full">
                    Incrível! 🎉
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
