import { cn } from '@/lib/utils';
import { Calendar, ChevronRight } from 'lucide-react';

interface ExamCountdownProps {
  daysUntil: number | null;
  examDate?: string | null;
  onPress: () => void;
}

export function ExamCountdown({ daysUntil, examDate, onPress }: ExamCountdownProps) {
  const getPhaseMessage = () => {
    if (daysUntil === null) return null;
    if (daysUntil <= 0) return "Exam day. You're ready.";
    if (daysUntil <= 3) return "Final review. Trust your prep.";
    if (daysUntil <= 7) return "Last week. Light practice, stay calm.";
    if (daysUntil <= 14) return "Final push. Focus on weak areas.";
    if (daysUntil <= 30) return "Crunch time. Stay consistent.";
    return "Build your foundation. You have time.";
  };

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
        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:opacity-90 active:scale-[0.98]",
        getBgColor()
      )}
    >
      <Calendar className={cn("w-4 h-4", getUrgencyColor())} />
      {daysUntil !== null ? (
        <span className="text-sm">
          <span className={cn("font-bold", getUrgencyColor())}>{daysUntil}</span>
          <span className="text-muted-foreground"> days</span>
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">Set exam date</span>
      )}
    </button>
  );
}
