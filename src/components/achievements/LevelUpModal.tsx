import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Confetti } from './Confetti';

interface LevelUpModalProps {
  newLevel: number;
  isOpen: boolean;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, isOpen, onClose }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getLevelTitle = (level: number) => {
    if (level <= 5) return 'Iniciante';
    if (level <= 10) return 'Aprendiz';
    if (level <= 20) return 'Praticante';
    if (level <= 35) return 'Experiente';
    if (level <= 50) return 'Mestre';
    return 'Lenda';
  };

  return (
    <>
      <Confetti isActive={showConfetti} particleCount={80} duration={4000} />
      
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
              initial={{ scale: 0.3, opacity: 0, rotateY: -180 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotateY: 0,
                transition: {
                  type: 'spring',
                  damping: 12,
                  stiffness: 200,
                }
              }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-card rounded-2xl border shadow-2xl overflow-hidden"
            >
              {/* Animated background gradient */}
              <motion.div
                animate={{
                  background: [
                    'linear-gradient(0deg, hsl(var(--primary)/0.2), transparent)',
                    'linear-gradient(180deg, hsl(var(--primary)/0.3), transparent)',
                    'linear-gradient(360deg, hsl(var(--primary)/0.2), transparent)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0"
              />

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    x: [0, Math.random() * 10 - 5, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="absolute"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 20}%`,
                  }}
                >
                  <Star className="h-4 w-4 text-primary/40" />
                </motion.div>
              ))}

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
                {/* Header with animation */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex items-center justify-center gap-2 mb-6"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </motion.div>
                  <span className="text-lg font-bold text-primary uppercase tracking-wider">
                    Level Up!
                  </span>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Zap className="h-6 w-6 text-primary" />
                  </motion.div>
                </motion.div>

                {/* Level number with epic animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    damping: 8,
                    stiffness: 150,
                    delay: 0.4,
                  }}
                  className="relative mb-6"
                >
                  {/* Glow effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-32 h-32 rounded-full bg-primary/20 blur-xl" />
                  </motion.div>

                  {/* Level circle */}
                  <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.6, type: 'spring', damping: 10 }}
                      className="text-center"
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-5xl font-bold text-primary-foreground"
                      >
                        {newLevel}
                      </motion.span>
                    </motion.div>
                  </div>

                  {/* Orbiting stars */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0"
                      style={{ transform: `rotate(${i * 120}deg)` }}
                    >
                      <Star 
                        className="absolute -top-2 left-1/2 -translate-x-1/2 h-5 w-5 text-chart-4 fill-chart-4" 
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-2xl font-bold mb-1">Parabéns!</h3>
                  <p className="text-muted-foreground mb-2">
                    Você alcançou o nível {newLevel}
                  </p>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: 'spring' }}
                    className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {getLevelTitle(newLevel)}
                  </motion.span>
                </motion.div>

                {/* Motivational message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4 text-sm text-muted-foreground"
                >
                  Continue assim! Cada conquista te deixa mais perto dos seus objetivos. 💪
                </motion.p>

                {/* Action button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="mt-6"
                >
                  <Button onClick={onClose} className="w-full">
                    Continuar Evoluindo! 🚀
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
