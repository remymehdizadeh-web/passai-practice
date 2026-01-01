import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DailyGoalProgressProps {
  todayCount: number;
  dailyGoal: number;
  onEditGoal?: () => void;
}

export function DailyGoalProgress({ todayCount, dailyGoal, onEditGoal }: DailyGoalProgressProps) {
  const [hasShownCelebration, setHasShownCelebration] = useState(false);
  const progress = Math.min((todayCount / dailyGoal) * 100, 100);
  const isComplete = todayCount >= dailyGoal;
  const remaining = Math.max(0, dailyGoal - todayCount);

  // Celebration when goal is hit
  useEffect(() => {
    if (isComplete && !hasShownCelebration) {
      setHasShownCelebration(true);
      toast.success('🎉 Daily goal complete!', {
        description: "You're building great momentum. Keep it up!",
      });
    }
  }, [isComplete, hasShownCelebration]);

  // Calculate ring progress
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className={cn(
      "bg-card border rounded-2xl p-4 transition-all duration-300",
      isComplete ? "border-success/30 bg-success/5" : "border-border"
    )}>
      <div className="flex items-center gap-4">
        {/* Progress ring */}
        <div className="relative shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={isComplete ? "hsl(var(--success))" : "hsl(var(--primary))"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out transform -rotate-90 origin-center"
              style={{ transformOrigin: '40px 40px' }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-success" />
            ) : (
              <>
                <span className="text-lg font-bold text-foreground">{todayCount}</span>
                <span className="text-[10px] text-muted-foreground">of {dailyGoal}</span>
              </>
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Target className={cn("w-4 h-4", isComplete ? "text-success" : "text-primary")} />
            <span className="text-sm font-semibold text-foreground">Daily Goal</span>
            {isComplete && <Sparkles className="w-3.5 h-3.5 text-warning animate-pulse" />}
          </div>
          
          {isComplete ? (
            <p className="text-sm text-success font-medium">
              Goal complete! You're on fire 🔥
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {remaining} more question{remaining !== 1 ? 's' : ''} to go
            </p>
          )}
          
          {onEditGoal && (
            <button
              onClick={onEditGoal}
              className="text-xs text-primary font-medium mt-1 hover:underline"
            >
              Adjust goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
