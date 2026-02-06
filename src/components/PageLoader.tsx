import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-levea-mint/10 via-background to-levea-cream/20" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-4"
        >
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
            <Leaf className="h-7 w-7 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Loading indicator */}
        <div className="flex items-center gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.12,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
