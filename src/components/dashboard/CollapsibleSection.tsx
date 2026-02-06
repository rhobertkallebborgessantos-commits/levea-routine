import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  delay?: number;
}

const STORAGE_KEY = 'levea-dashboard-sections';

function getSectionState(id: string, defaultOpen: boolean): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const sections = JSON.parse(stored);
      return sections[id] ?? defaultOpen;
    }
  } catch {
    // Ignore errors
  }
  return defaultOpen;
}

function saveSectionState(id: string, isOpen: boolean) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const sections = stored ? JSON.parse(stored) : {};
    sections[id] = isOpen;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  } catch {
    // Ignore errors
  }
}

export function CollapsibleSection({
  id,
  title,
  icon,
  children,
  defaultOpen = true,
  className,
  delay = 0,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(() => getSectionState(id, defaultOpen));
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    saveSectionState(id, isOpen);
  }, [id, isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      onAnimationComplete={() => setHasAnimated(true)}
      className={cn('space-y-3', className)}
    >
      {/* Header */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between group py-1 px-1 -mx-1 rounded-lg transition-colors hover:bg-muted/50 active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-primary">{icon}</span>
          )}
          <h2 className="text-base font-display font-semibold text-foreground">
            {title}
          </h2>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground group-hover:text-foreground transition-colors"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={cn(hasAnimated ? '' : 'animate-fade-in')}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
