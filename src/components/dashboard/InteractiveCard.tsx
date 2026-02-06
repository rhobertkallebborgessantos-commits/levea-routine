import { ReactNode, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  index?: number;
  delay?: number;
}

export const InteractiveCard = forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ children, className, onClick, disabled, index = 0, delay = 0 }, ref) => {
    const isClickable = !!onClick && !disabled;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: delay + index * 0.05,
          duration: 0.35,
          ease: 'easeOut',
        }}
        whileHover={isClickable ? { 
          scale: 1.01, 
          y: -2,
          transition: { duration: 0.2 }
        } : undefined}
        whileTap={isClickable ? { 
          scale: 0.98,
          transition: { duration: 0.1 }
        } : undefined}
      >
        <Card
          className={cn(
            'border-border/50 transition-all duration-200',
            isClickable && [
              'cursor-pointer',
              'hover:border-primary/30',
              'hover:shadow-md',
              'hover:shadow-primary/5',
              'active:shadow-sm',
            ],
            className
          )}
          onClick={onClick}
        >
          {children}
        </Card>
      </motion.div>
    );
  }
);

InteractiveCard.displayName = 'InteractiveCard';
