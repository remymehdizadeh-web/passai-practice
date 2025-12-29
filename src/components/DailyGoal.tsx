import { cn } from '@/lib/utils';
import { Target, CheckCircle2, ChevronRight } from 'lucide-react';

interface DailyGoalProps {
  target: number;
  completed: number;
  onStartPractice: () => void;
}

export function DailyGoal({ target, completed, onStartPractice }: DailyGoalProps) {
  const progress = Math.min((completed / target) * 100, 100);
  const remaining = Math.max(target - completed, 0);
  const isComplete = completed >= target;

  const getMessage = () => {
    if (isComplete) return "Great work today. Come back tomorrow.";
    if (remaining <= 3) return "Almost there. Quick finish.";
    if (completed === 0) return "Ready when you are.";
    return `${remaining} more to hit your goal.`;
  };

  return (
    <button
      onClick={onStartPractice}
      disabled={isComplete}
      className={cn(
        "w-full rounded-2xl p-4 text-left transition-all",
        isComplete 
          ? "bg-emerald-500/10 border border-emerald-500/20" 
          : "bg-card border border-border hover:bg-muted/30 active:scale-[0.99]"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          isComplete ? "bg-emerald-500/20" : "bg-primary/10"
        )}>
          {isComplete ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          ) : (
            <Target className="w-6 h-6 text-primary" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-foreground">
              Today's Goal
            </span>
            <span className={cn(
              "text-sm font-bold",
              isComplete ? "text-emerald-500" : "text-foreground"
            )}>
              {completed}/{target}
            </span>
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isComplete ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            {getMessage()}
          </p>
        </div>

        {!isComplete && (
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </div>
    </button>
  );
}
