import { Clock, TrendingUp } from 'lucide-react';

interface TimeInvestedCardProps {
  totalQuestions: number;
  weekQuestions: number;
}

export function TimeInvestedCard({ totalQuestions, weekQuestions }: TimeInvestedCardProps) {
  // Estimate time based on average 2 minutes per question
  const totalHours = Math.round((totalQuestions * 2) / 60);
  const weekHours = Math.round((weekQuestions * 2) / 60 * 10) / 10;

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time invested</p>
            <p className="text-xl font-bold text-foreground">{totalHours}+ hours</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-success">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{weekHours}h this week</span>
          </div>
        </div>
      </div>
    </div>
  );
}
