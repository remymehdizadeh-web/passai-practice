import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Bookmark, 
  Trophy, 
  Target,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  type: 'stats' | 'bookmarks' | 'achievements' | 'practice' | 'review';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const emptyStateConfig = {
  stats: {
    icon: BarChart3,
    defaultTitle: 'No stats yet',
    defaultDescription: 'Complete some questions to see your progress',
    gradient: 'from-primary/20 to-accent/20',
    iconColor: 'text-primary',
  },
  bookmarks: {
    icon: Bookmark,
    defaultTitle: 'No saved questions',
    defaultDescription: 'Tap the bookmark icon while practicing to save questions for later',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-500',
  },
  achievements: {
    icon: Trophy,
    defaultTitle: 'No achievements yet',
    defaultDescription: 'Keep practicing to unlock your first achievement',
    gradient: 'from-yellow-500/20 to-amber-500/20',
    iconColor: 'text-yellow-500',
  },
  practice: {
    icon: BookOpen,
    defaultTitle: 'Ready to practice?',
    defaultDescription: 'Start answering questions to build your knowledge',
    gradient: 'from-success/20 to-emerald-500/20',
    iconColor: 'text-success',
  },
  review: {
    icon: Target,
    defaultTitle: 'All caught up!',
    defaultDescription: 'Great job! Check back later for spaced repetition',
    gradient: 'from-primary/20 to-violet-500/20',
    iconColor: 'text-primary',
  },
};

export function EmptyState({ 
  type, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          delay: 0.1, 
          duration: 0.4,
          type: "spring",
          stiffness: 200
        }}
        className={cn(
          "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 relative",
          config.gradient
        )}
      >
        <Icon className={cn("w-10 h-10", config.iconColor)} />
        
        {/* Decorative sparkle */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="w-5 h-5 text-accent" />
        </motion.div>
      </motion.div>

      {/* Text content */}
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-lg font-semibold text-foreground mb-2"
      >
        {title || config.defaultTitle}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-sm text-muted-foreground max-w-[240px]"
      >
        {description || config.defaultDescription}
      </motion.p>

      {/* Optional action button */}
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
