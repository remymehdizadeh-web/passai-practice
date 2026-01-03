import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Spring physics for native-feeling animations
const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, className }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.25,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

// Pressable button wrapper with haptic-style scale effect
interface PressableProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  asChild?: boolean;
}

export function Pressable({ children, className, onClick, disabled }: PressableProps) {
  return (
    <motion.div
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className={className}
      onClick={disabled ? undefined : onClick}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}

// Staggered list animation
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className, staggerDelay = 0.04 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.05,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }
        },
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

// Slide up from bottom (for modals, sheets)
export function SlideUp({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        ...springTransition,
      }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}
