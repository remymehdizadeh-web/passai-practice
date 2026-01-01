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
      bgColor: 'bg-gradient-to-br from-accent/15 to-accent/5',
      borderColor: 'border-accent/20',
      emoji: '🔥',
    },
    {
      icon: Zap,
      label: 'Today',
      value: todayCount,
      suffix: '',
      color: 'text-warning',
      bgColor: 'bg-gradient-to-br from-warning/15 to-warning/5',
      borderColor: 'border-warning/20',
      emoji: '⚡',
    },
    {
      icon: Calendar,
      label: 'This Week',
      value: weekCount,
      suffix: '',
      color: 'text-primary',
      bgColor: 'bg-gradient-to-br from-primary/15 to-primary/5',
      borderColor: 'border-primary/20',
      emoji: '📅',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "rounded-2xl p-3 border transition-all duration-200",
            stat.bgColor,
            stat.borderColor
          )}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">{stat.emoji}</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-xl font-bold", stat.color)}>
              {stat.value}
            </span>
            {stat.suffix && (
              <span className="text-[10px] text-muted-foreground">{stat.suffix}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
