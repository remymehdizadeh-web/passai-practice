import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ReadinessGaugeProps {
  score: number;
  trend?: 'up' | 'down' | 'stable';
}

export function ReadinessGauge({ score, trend }: ReadinessGaugeProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-success';
    if (score >= 65) return 'text-warning';
    return 'text-destructive';
  };

  const getReadinessLabel = () => {
    if (score >= 85) return 'Exam Ready';
    if (score >= 75) return 'Almost There';
    if (score >= 65) return 'Building';
    if (score >= 50) return 'Progressing';
    return 'Starting';
  };

  // Calculate circumference for the ring
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="card-organic p-4 flex items-center gap-4">
      {/* Circular progress */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-full h-full progress-ring" viewBox="0 0 80 80">
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
            stroke={score >= 80 ? 'hsl(var(--success))' : score >= 65 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="progress-ring-circle"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-xl font-bold", getScoreColor())}>
            {score}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Readiness
          </p>
          {trend && (
            <div className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium",
              trend === 'up' && "bg-success/10 text-success",
              trend === 'down' && "bg-destructive/10 text-destructive",
              trend === 'stable' && "bg-muted text-muted-foreground"
            )}>
              {trend === 'up' && <TrendingUp className="w-2.5 h-2.5" />}
              {trend === 'down' && <TrendingDown className="w-2.5 h-2.5" />}
              {trend === 'stable' && <Minus className="w-2.5 h-2.5" />}
            </div>
          )}
        </div>
        <p className={cn("text-sm font-semibold", getScoreColor())}>
          {getReadinessLabel()}
        </p>
      </div>
    </div>
  );
}
