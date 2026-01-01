import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Target, Brain, Flame, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface WeeklyReportData {
  questionsThisWeek: number;
  questionsLastWeek: number;
  accuracyThisWeek: number;
  accuracyLastWeek: number;
  strongestCategory: string;
  weakestCategory: string;
  daysStudied: number;
  streakDays?: number;
  totalCompleted?: number;
}

interface WeeklyReportProps {
  data: WeeklyReportData;
}

export function WeeklyReport({ data }: WeeklyReportProps) {
  const questionsTrend = data.questionsThisWeek - data.questionsLastWeek;
  const accuracyTrend = data.accuracyThisWeek - data.accuracyLastWeek;

  const getReadinessMessage = () => {
    if (data.accuracyThisWeek >= 85 && data.daysStudied >= 5) {
      return "You're showing strong exam readiness. Keep this pace.";
    }
    if (data.accuracyThisWeek >= 75) {
      return "Solid progress this week. Focus on your weak areas to level up.";
    }
    if (data.daysStudied >= 4) {
      return "Great consistency. Work on accuracy to boost your score.";
    }
    return "Try to study more consistently for better results.";
  };

  return (
    <div className="space-y-5">
      {/* Summary Header */}
      <div className="text-center pb-4 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground mb-1">This Week</h2>
        <p className="text-muted-foreground text-sm">{getReadinessMessage()}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Questions */}
        <div className="card-organic p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Questions</span>
            {questionsTrend !== 0 && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                questionsTrend > 0 ? "text-success" : "text-destructive"
              )}>
                {questionsTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(questionsTrend)}
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-foreground">{data.questionsThisWeek}</p>
          <p className="text-xs text-muted-foreground mt-1">vs {data.questionsLastWeek} last week</p>
        </div>

        {/* Accuracy */}
        <div className="card-organic p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Accuracy</span>
            {accuracyTrend !== 0 && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                accuracyTrend > 0 ? "text-success" : "text-destructive"
              )}>
                {accuracyTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(accuracyTrend)}%
              </div>
            )}
          </div>
          <p className={cn(
            "text-3xl font-bold",
            data.accuracyThisWeek >= 80 ? "text-success" :
            data.accuracyThisWeek >= 65 ? "text-warning" : "text-foreground"
          )}>{data.accuracyThisWeek}%</p>
          <p className="text-xs text-muted-foreground mt-1">vs {data.accuracyLastWeek}% last week</p>
        </div>
      </div>

      {/* Streak & Consistency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10">
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{data.streakDays || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{data.daysStudied}/7</p>
            <p className="text-xs text-muted-foreground">Days Active</p>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Category Performance
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Best</span>
            </div>
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {data.strongestCategory}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground">Focus</span>
            </div>
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {data.weakestCategory}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
