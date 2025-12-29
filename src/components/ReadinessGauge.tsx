import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ReadinessGaugeProps {
  score: number;
  trend?: 'up' | 'down' | 'stable';
  questionsNeeded?: number;
}

export function ReadinessGauge({ score, trend, questionsNeeded }: ReadinessGaugeProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 65) return 'text-amber-500';
    return 'text-destructive';
  };

  const getBarColor = () => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-amber-500';
    return 'bg-destructive';
  };

  const getReadinessLabel = () => {
    if (score >= 85) return 'Exam Ready';
    if (score >= 75) return 'Almost There';
    if (score >= 65) return 'Building Confidence';
    if (score >= 50) return 'Keep Practicing';
    return 'Just Starting';
  };

  const getMessage = () => {
    if (score >= 85) return "You're performing well. Trust your preparation.";
    if (score >= 75) return "Strong progress. A few more focused sessions.";
    if (score >= 65) return "You're on track. Stay consistent.";
    if (score >= 50) return "Building your foundation. Keep going.";
    return "Every question helps. You'll get there.";
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Readiness Score
          </p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-4xl font-bold", getScoreColor())}>
              {score}
            </span>
            <span className="text-lg text-muted-foreground">/ 100</span>
          </div>
        </div>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
            trend === 'up' && "bg-emerald-500/10 text-emerald-500",
            trend === 'down' && "bg-destructive/10 text-destructive",
            trend === 'stable' && "bg-muted text-muted-foreground"
          )}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'stable' && <Minus className="w-3 h-3" />}
            <span>{trend === 'up' ? 'Improving' : trend === 'down' ? 'Review needed' : 'Steady'}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
        <div 
          className={cn("h-full rounded-full transition-all duration-700 ease-out", getBarColor())}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", getScoreColor())}>
          {getReadinessLabel()}
        </span>
        {questionsNeeded && questionsNeeded > 0 && (
          <span className="text-xs text-muted-foreground">
            ~{questionsNeeded} questions to level up
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-2">
        {getMessage()}
      </p>
    </div>
  );
}
