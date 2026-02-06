import { ReactNode, Children, isValidElement, cloneElement } from 'react';
import { motion } from 'framer-motion';

interface StaggeredListProps {
  children: ReactNode;
  baseDelay?: number;
  staggerDelay?: number;
  className?: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export function StaggeredList({ 
  children, 
  baseDelay = 0, 
  staggerDelay = 0.08,
  className,
}: StaggeredListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: baseDelay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          return (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          );
        }
        return child;
      })}
    </motion.div>
  );
}

// For simple items without wrapper
export function StaggeredItem({ 
  children, 
  index = 0,
  baseDelay = 0,
}: { 
  children: ReactNode; 
  index?: number;
  baseDelay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: baseDelay + index * 0.06,
        duration: 0.35,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}
