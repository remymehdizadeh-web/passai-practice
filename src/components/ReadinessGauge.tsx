import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  const getBgColor = () => {
    if (score >= 80) return 'from-success/10 to-success/5';
    if (score >= 65) return 'from-warning/10 to-warning/5';
    return 'from-destructive/10 to-destructive/5';
  };

  const getReadinessLabel = () => {
    if (score >= 85) return 'Exam Ready';
    if (score >= 75) return 'Almost There';
    if (score >= 65) return 'Building';
    if (score >= 50) return 'Progressing';
    return 'Starting';
  };

  const getMotivation = () => {
    if (score >= 85) return "You're on track to pass!";
    if (score >= 75) return "Almost exam ready!";
    if (score >= 65) return "Good progress, keep going!";
    if (score >= 50) return "Building momentum!";
    return "Every question counts!";
  };

  return (
    <div className={cn("card-organic p-4 bg-gradient-to-br", getBgColor())}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Readiness Score</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                <p className="font-medium mb-1">How it's calculated:</p>
                <ul className="space-y-0.5 text-muted-foreground">
                  <li>• 75% from your accuracy</li>
                  <li>• 15% from questions completed</li>
                  <li>• 10% from study streak</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            trend === 'up' && "bg-success/20 text-success",
            trend === 'down' && "bg-destructive/20 text-destructive",
            trend === 'stable' && "bg-muted text-muted-foreground"
          )}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'stable' && <Minus className="w-3 h-3" />}
            {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-3">
        <span className={cn("text-4xl font-bold leading-none", getScoreColor())}>
          {score}
        </span>
        <div className="flex-1 pb-1">
          <p className={cn("text-sm font-medium", getScoreColor())}>
            {getReadinessLabel()}
          </p>
          <p className="text-xs text-muted-foreground">
            {getMotivation()}
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 h-2 bg-muted/50 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score >= 80 ? "bg-success" : score >= 65 ? "bg-warning" : "bg-destructive"
          )}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}
