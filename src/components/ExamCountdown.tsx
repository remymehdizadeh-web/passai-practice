import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface ExamCountdownProps {
  daysUntil: number | null;
  examDate?: string | null;
  onPress: () => void;
}

export function ExamCountdown({ daysUntil, examDate, onPress }: ExamCountdownProps) {
  const getUrgencyColor = () => {
    if (daysUntil === null) return 'text-primary';
    if (daysUntil <= 7) return 'text-destructive';
    if (daysUntil <= 14) return 'text-amber-500';
    return 'text-primary';
  };

  const getBgColor = () => {
    if (daysUntil === null) return 'bg-card border-border';
    if (daysUntil <= 7) return 'bg-destructive/5 border-destructive/20';
    if (daysUntil <= 14) return 'bg-amber-500/5 border-amber-500/20';
    return 'bg-card border-border';
  };

  return (
    <button
      onClick={onPress}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all hover:opacity-90 active:scale-[0.98]",
        getBgColor()
      )}
    >
      <Calendar className={cn("w-4 h-4", getUrgencyColor())} />
      {daysUntil !== null ? (
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Exam in</span>
          <span className="text-sm">
            <span className={cn("font-bold text-lg", getUrgencyColor())}>{daysUntil}</span>
            <span className="text-muted-foreground"> days</span>
          </span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Set exam date</span>
      )}
    </button>
  );
}
