import { Flame, Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickWinsBarProps {
  streakDays: number;
  todayCount: number;
  weekCount: number;
}

export function QuickWinsBar({ streakDays, todayCount, weekCount }: QuickWinsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Streak */}
      <div className="bg-card border border-border rounded-xl p-3 text-center hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Flame className="w-4 h-4 text-accent" />
        </div>
        <p className="text-xl font-bold text-foreground">{streakDays}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {streakDays === 1 ? 'Day' : 'Days'} 🔥
        </p>
      </div>

      {/* Today */}
      <div className="bg-card border border-border rounded-xl p-3 text-center hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Zap className="w-4 h-4 text-warning" />
        </div>
        <p className="text-xl font-bold text-foreground">{todayCount}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Today ⚡</p>
      </div>

      {/* This Week */}
      <div className="bg-card border border-border rounded-xl p-3 text-center hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xl font-bold text-foreground">{weekCount}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">This Week</p>
      </div>
    </div>
  );
}
