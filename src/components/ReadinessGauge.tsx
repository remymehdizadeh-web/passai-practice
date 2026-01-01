import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
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

  const handleClick = () => {
    navigate('/', { state: { tab: 'stats' } });
  };

  return (
    <button
      onClick={handleClick}
      className="flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]"
    >
      <div className={cn(
        "text-2xl font-bold",
        getScoreColor()
      )}>
        {score}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Readiness</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-3 h-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                <p className="font-medium mb-1">How it's calculated:</p>
                <ul className="space-y-0.5 text-muted-foreground">
                  <li>• 60% from accuracy</li>
                  <li>• 20% from question volume</li>
                  <li>• 10% from streak consistency</li>
                  <li>• 10% from category coverage</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {trend && (
            <div className={cn(
              "flex items-center gap-0.5 text-[10px] font-medium",
              trend === 'up' && "text-success",
              trend === 'down' && "text-destructive",
              trend === 'stable' && "text-muted-foreground"
            )}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend === 'stable' && <Minus className="w-3 h-3" />}
            </div>
          )}
        </div>
        <p className={cn("text-sm font-medium", getScoreColor())}>
          {getReadinessLabel()}
        </p>
      </div>
    </button>
  );
}
