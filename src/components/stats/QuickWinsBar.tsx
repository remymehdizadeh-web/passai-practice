import { Flame, Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickWinsBarProps {
  streakDays: number;
  todayCount: number;
  weekCount: number;
}

export function QuickWinsBar({ streakDays, todayCount, weekCount }: QuickWinsBarProps) {
  const stats = [
    {
      icon: Flame,
      label: 'Streak',
      value: streakDays,
      suffix: streakDays === 1 ? 'day' : 'days',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      emoji: '🔥',
    },
    {
      icon: Zap,
      label: 'Today',
      value: todayCount,
      suffix: '',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      emoji: '⚡',
    },
    {
      icon: Calendar,
      label: 'This Week',
      value: weekCount,
      suffix: '',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      emoji: '📅',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{stat.emoji}</span>
            <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-2xl font-bold", stat.color)}>
              {stat.value}
            </span>
            {stat.suffix && (
              <span className="text-xs text-muted-foreground">{stat.suffix}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
