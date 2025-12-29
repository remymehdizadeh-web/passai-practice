import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Target, Brain, Zap, Calendar } from 'lucide-react';

interface WeeklyReportData {
  questionsThisWeek: number;
  questionsLastWeek: number;
  accuracyThisWeek: number;
  accuracyLastWeek: number;
  strongestCategory: string;
  weakestCategory: string;
  daysStudied: number;
  percentileRank: number;
}

interface WeeklyReportProps {
  data: WeeklyReportData;
  onClose?: () => void;
}

export function WeeklyReport({ data }: WeeklyReportProps) {
  const questionsTrend = data.questionsThisWeek - data.questionsLastWeek;
  const accuracyTrend = data.accuracyThisWeek - data.accuracyLastWeek;

  const getPercentileMessage = () => {
    if (data.percentileRank >= 90) return "You're in the top 10% of students!";
    if (data.percentileRank >= 75) return "You're outperforming most students.";
    if (data.percentileRank >= 50) return "You're on track. Keep pushing.";
    return "More practice will help you climb.";
  };

  const getAccuracyMessage = () => {
    if (data.accuracyThisWeek >= 85) return "Excellent accuracy. You're exam-ready.";
    if (data.accuracyThisWeek >= 75) return "Strong performance. Almost there.";
    if (data.accuracyThisWeek >= 65) return "Good progress. Focus on weak areas.";
    return "Keep practicing. Accuracy improves with repetition.";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-organic p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Weekly Report</h2>
            <p className="text-sm text-muted-foreground">Your progress this week</p>
          </div>
        </div>

        {/* Percentile Rank */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Your Ranking</span>
            <span className="text-3xl font-bold text-primary">Top {100 - data.percentileRank}%</span>
          </div>
          <p className="text-sm text-muted-foreground">{getPercentileMessage()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-organic p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase">Questions</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{data.questionsThisWeek}</p>
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium mt-1",
            questionsTrend >= 0 ? "text-success" : "text-destructive"
          )}>
            {questionsTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(questionsTrend)} vs last week</span>
          </div>
        </div>

        <div className="card-organic p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-xs font-medium text-muted-foreground uppercase">Accuracy</span>
          </div>
          <p className={cn(
            "text-2xl font-bold",
            data.accuracyThisWeek >= 75 ? "text-success" : 
            data.accuracyThisWeek >= 60 ? "text-warning" : "text-foreground"
          )}>{data.accuracyThisWeek}%</p>
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium mt-1",
            accuracyTrend >= 0 ? "text-success" : "text-destructive"
          )}>
            {accuracyTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{accuracyTrend >= 0 ? '+' : ''}{accuracyTrend}% vs last week</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="card-organic p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Category Insights</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-success/10">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Strongest</p>
              <p className="text-sm font-semibold text-foreground">{data.strongestCategory}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-warning/10">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Focus Area</p>
              <p className="text-sm font-semibold text-foreground">{data.weakestCategory}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Message */}
      <div className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl p-5 border border-primary/10">
        <p className="text-sm text-foreground leading-relaxed">
          {getAccuracyMessage()} You studied <strong>{data.daysStudied} days</strong> this week. 
          {data.daysStudied >= 5 ? " Excellent consistency!" : data.daysStudied >= 3 ? " Try for more days next week." : " Aim for at least 4-5 days."}
        </p>
      </div>
    </div>
  );
}
