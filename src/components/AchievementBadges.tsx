import { Award, Zap, Target, Brain, Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  progress?: number;
  total?: number;
  color: string;
}

interface AchievementBadgesProps {
  totalAnswered: number;
  accuracy: number;
  streakDays: number;
}

export function AchievementBadges({ totalAnswered, accuracy, streakDays }: AchievementBadgesProps) {
  const achievements: Achievement[] = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Answer 10 questions',
      icon: Target,
      unlocked: totalAnswered >= 10,
      progress: Math.min(totalAnswered, 10),
      total: 10,
      color: 'text-blue-500',
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
    },
    {
      id: 'sharp-mind',
      title: 'Sharp Mind',
      description: 'Reach 80% accuracy',
      icon: Brain,
      unlocked: accuracy >= 80,
      progress: Math.min(accuracy, 80),
      total: 80,
      color: 'text-purple-500',
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
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Get 10 in a row correct',
      icon: Zap,
      unlocked: false, // Would need session tracking
      progress: 0,
      total: 10,
      color: 'text-amber-500',
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
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="card-organic p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm text-foreground">Achievements</p>
        <span className="text-xs text-muted-foreground">
          {unlockedCount}/{achievements.length} unlocked
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {achievements.slice(0, 6).map((achievement) => {
          const Icon = achievement.icon;
          const progressPercent = achievement.total 
            ? Math.round((achievement.progress || 0) / achievement.total * 100)
            : 0;
          
          return (
            <div
              key={achievement.id}
              className={cn(
                "relative p-3 rounded-xl text-center transition-all",
                achievement.unlocked 
                  ? "bg-primary/5 border border-primary/20" 
                  : "bg-muted/30 opacity-60"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center",
                achievement.unlocked ? "bg-primary/10" : "bg-muted"
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  achievement.unlocked ? achievement.color : "text-muted-foreground"
                )} />
              </div>
              <p className="text-[10px] font-medium text-foreground truncate">
                {achievement.title}
              </p>
              {!achievement.unlocked && achievement.total && (
                <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary/50 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
