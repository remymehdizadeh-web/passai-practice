import { cn } from '@/lib/utils';
import { Target, CheckCircle2, ChevronRight, PartyPopper } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface DailyGoalProps {
  target: number;
  completed: number;
  onStartPractice: () => void;
}

// Confetti particle component
function ConfettiParticle({ delay, left }: { delay: number; left: number }) {
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <div
      className="absolute w-2 h-2 rounded-full animate-confetti"
      style={{
        left: `${left}%`,
        backgroundColor: color,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

export function DailyGoal({ target, completed, onStartPractice }: DailyGoalProps) {
  const progress = Math.min((completed / target) * 100, 100);
  const remaining = Math.max(target - completed, 0);
  const isComplete = completed >= target;
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompleted = useRef(completed);
  const hasShownCelebration = useRef(false);

  // Detect when goal is just completed (transition from incomplete to complete)
  useEffect(() => {
    const wasComplete = prevCompleted.current >= target;
    const nowComplete = completed >= target;
    
    // Only show celebration on the transition to complete, and only once per session
    if (!wasComplete && nowComplete && !hasShownCelebration.current) {
      setShowCelebration(true);
      hasShownCelebration.current = true;
      
      // Hide celebration after animation
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    prevCompleted.current = completed;
  }, [completed, target]);

  const getMessage = () => {
    if (isComplete) return "Great work today! 🎉";
    if (remaining <= 3) return "Almost there. Quick finish.";
    if (completed === 0) return "Ready when you are.";
    return `${remaining} more to hit your goal.`;
  };

  return (
    <button
      onClick={onStartPractice}
      disabled={isComplete}
      className={cn(
        "w-full rounded-2xl p-4 text-left transition-all relative overflow-hidden",
        isComplete 
          ? "bg-emerald-500/10 border border-emerald-500/20" 
          : "bg-card border border-border hover:bg-muted/30 active:scale-[0.99]"
      )}
    >
      {/* Confetti celebration */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiParticle 
              key={i} 
              delay={i * 50} 
              left={Math.random() * 100} 
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 relative z-10">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-transform",
          isComplete ? "bg-emerald-500/20" : "bg-primary/10",
          showCelebration && "animate-bounce"
        )}>
          {isComplete ? (
            showCelebration ? (
              <PartyPopper className="w-6 h-6 text-emerald-500" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            )
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
          
          <p className={cn(
            "text-xs",
            isComplete ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"
          )}>
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
