import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyStreakProps {
  days: number;
  compact?: boolean;
}

export function StudyStreak({ days, compact = false }: StudyStreakProps) {
  if (days === 0) return null;

  const getMessage = () => {
    if (days >= 30) return "Incredible dedication!";
    if (days >= 14) return "Two weeks strong!";
    if (days >= 7) return "One week streak!";
    if (days >= 3) return "Keep it going!";
    return "Nice start!";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500/10">
        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
        <span className="text-sm font-bold text-orange-500">{days}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-orange-500">{days}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>
          <p className="text-xs text-muted-foreground">{getMessage()}</p>
        </div>
      </div>
    </div>
  );
}
