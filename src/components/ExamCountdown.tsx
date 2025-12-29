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
        "w-full rounded-2xl border p-4 text-left transition-all hover:opacity-90 active:scale-[0.99]",
        getBgColor()
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          daysUntil !== null && daysUntil <= 7 ? "bg-destructive/10" :
          daysUntil !== null && daysUntil <= 14 ? "bg-amber-500/10" : "bg-primary/10"
        )}>
          <Calendar className={cn("w-6 h-6", getUrgencyColor())} />
        </div>

        <div className="flex-1 min-w-0">
          {daysUntil !== null ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className={cn("text-2xl font-bold", getUrgencyColor())}>
                  {daysUntil}
                </span>
                <span className="text-sm text-muted-foreground">
                  days until exam
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {examDate && new Date(examDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                {getPhaseMessage()}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">Set your exam date</p>
              <p className="text-xs text-muted-foreground">Track your countdown to test day</p>
            </>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
}
