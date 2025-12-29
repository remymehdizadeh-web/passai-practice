import { TrendingUp, TrendingDown, Minus, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyInsightsProps {
  recentAccuracy: number;
  previousAccuracy: number;
  avgTimePerQuestion: number; // in seconds
  strongestCategory: string;
  weakestCategory: string;
}

export function StudyInsights({ 
  recentAccuracy, 
  previousAccuracy,
  avgTimePerQuestion,
  strongestCategory,
  weakestCategory
}: StudyInsightsProps) {
  const accuracyDiff = recentAccuracy - previousAccuracy;
  const trend = accuracyDiff > 2 ? 'up' : accuracyDiff < -2 ? 'down' : 'stable';

  return (
    <div className="card-organic p-4 space-y-3">
      <p className="font-semibold text-sm text-foreground">Study Insights</p>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Accuracy Trend */}
        <div className="bg-muted/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-4 h-4 text-destructive" />
            ) : (
              <Minus className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">Trend</span>
          </div>
          <p className={cn(
            "text-lg font-bold",
            trend === 'up' ? "text-success" : 
            trend === 'down' ? "text-destructive" : 
            "text-foreground"
          )}>
            {trend === 'up' ? '+' : ''}{accuracyDiff}%
          </p>
          <p className="text-[10px] text-muted-foreground">vs last 20 Qs</p>
        </div>

        {/* Avg Time */}
        <div className="bg-muted/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Avg Time</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {avgTimePerQuestion}s
          </p>
          <p className="text-[10px] text-muted-foreground">per question</p>
        </div>
      </div>

      {/* Quick tips based on data */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">Focus Tip</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {weakestCategory !== strongestCategory 
                ? `Spend more time on ${weakestCategory.split(' ').slice(0, 2).join(' ')}...`
                : "Keep up the great work across all categories!"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
