import { useMemo } from 'react';
import { useUserProgress, useBookmarks } from '@/hooks/useQuestions';
import { useProfile } from '@/hooks/useProfile';
import { Award, Zap, Target, Brain, Flame, Trophy, Star, BookOpen, Clock, Crown } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  progress?: number;
  total?: number;
  color: string;
  tier?: 'bronze' | 'silver' | 'gold';
  unlockedAt?: string;
}

export function useAchievements() {
  const { data: progress } = useUserProgress();
  const { data: bookmarks } = useBookmarks();
  const { data: profile } = useProfile();

  const achievements = useMemo(() => {
    const totalAnswered = progress?.length || 0;
    const correctCount = progress?.filter(p => p.is_correct).length || 0;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const streakDays = profile?.streak_days || 0;
    const bookmarkCount = bookmarks?.length || 0;

    // Calculate longest correct streak from progress
    let currentCorrectStreak = 0;
    let maxCorrectStreak = 0;
    progress?.forEach(p => {
      if (p.is_correct) {
        currentCorrectStreak++;
        maxCorrectStreak = Math.max(maxCorrectStreak, currentCorrectStreak);
      } else {
        currentCorrectStreak = 0;
      }
    });

    const allAchievements: Achievement[] = [
      // Question milestones
      {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Answer 10 questions',
        icon: Target,
        unlocked: totalAnswered >= 10,
        progress: Math.min(totalAnswered, 10),
        total: 10,
        color: 'text-blue-500',
        tier: 'bronze',
      },
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Answer 25 questions',
        icon: BookOpen,
        unlocked: totalAnswered >= 25,
        progress: Math.min(totalAnswered, 25),
        total: 25,
        color: 'text-cyan-500',
        tier: 'bronze',
      },
      {
        id: 'century',
        title: 'Century Club',
        description: 'Answer 100 questions',
        icon: Award,
        unlocked: totalAnswered >= 100,
        progress: Math.min(totalAnswered, 100),
        total: 100,
        color: 'text-emerald-500',
        tier: 'silver',
      },
      {
        id: 'dedicated',
        title: 'Dedicated Learner',
        description: 'Answer 250 questions',
        icon: Star,
        unlocked: totalAnswered >= 250,
        progress: Math.min(totalAnswered, 250),
        total: 250,
        color: 'text-violet-500',
        tier: 'silver',
      },
      {
        id: 'champion',
        title: 'Champion',
        description: 'Complete 500 questions',
        icon: Trophy,
        unlocked: totalAnswered >= 500,
        progress: Math.min(totalAnswered, 500),
        total: 500,
        color: 'text-yellow-500',
        tier: 'gold',
      },

      // Accuracy achievements
      {
        id: 'sharp-mind',
        title: 'Sharp Mind',
        description: 'Reach 80% accuracy',
        icon: Brain,
        unlocked: totalAnswered >= 10 && accuracy >= 80,
        progress: Math.min(accuracy, 80),
        total: 80,
        color: 'text-purple-500',
        tier: 'silver',
      },
      {
        id: 'perfectionist-10',
        title: 'Hot Streak',
        description: 'Get 10 in a row correct',
        icon: Zap,
        unlocked: maxCorrectStreak >= 10,
        progress: Math.min(maxCorrectStreak, 10),
        total: 10,
        color: 'text-amber-500',
        tier: 'silver',
      },
      {
        id: 'perfectionist-20',
        title: 'Unstoppable',
        description: 'Get 20 in a row correct',
        icon: Crown,
        unlocked: maxCorrectStreak >= 20,
        progress: Math.min(maxCorrectStreak, 20),
        total: 20,
        color: 'text-rose-500',
        tier: 'gold',
      },

      // Streak achievements
      {
        id: 'consistent',
        title: 'Consistent',
        description: '3-day streak',
        icon: Flame,
        unlocked: streakDays >= 3,
        progress: Math.min(streakDays, 3),
        total: 3,
        color: 'text-orange-400',
        tier: 'bronze',
      },
      {
        id: 'on-fire',
        title: 'On Fire',
        description: '7-day streak',
        icon: Flame,
        unlocked: streakDays >= 7,
        progress: Math.min(streakDays, 7),
        total: 7,
        color: 'text-orange-500',
        tier: 'silver',
      },
      {
        id: 'dedicated-student',
        title: 'Dedicated Student',
        description: '14-day streak',
        icon: Flame,
        unlocked: streakDays >= 14,
        progress: Math.min(streakDays, 14),
        total: 14,
        color: 'text-red-500',
        tier: 'gold',
      },

      // Bookmark achievements
      {
        id: 'collector',
        title: 'Collector',
        description: 'Bookmark 10 questions',
        icon: Star,
        unlocked: bookmarkCount >= 10,
        progress: Math.min(bookmarkCount, 10),
        total: 10,
        color: 'text-pink-500',
        tier: 'bronze',
      },
    ];

    const unlockedCount = allAchievements.filter(a => a.unlocked).length;
    const recentUnlocked = allAchievements.filter(a => a.unlocked).slice(-3);

    return {
      all: allAchievements,
      unlocked: allAchievements.filter(a => a.unlocked),
      locked: allAchievements.filter(a => !a.unlocked),
      unlockedCount,
      totalCount: allAchievements.length,
      recentUnlocked,
    };
  }, [progress, profile, bookmarks]);

  return achievements;
}
