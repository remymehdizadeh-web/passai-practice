import { cn } from '@/lib/utils';

interface PercentileRankProps {
  percentile: number;
  totalUsers?: number;
  compact?: boolean;
}

export function PercentileRank({ percentile, totalUsers, compact = false }: PercentileRankProps) {
  const getColor = () => {
    if (percentile >= 90) return 'text-success';
    if (percentile >= 75) return 'text-primary';
    if (percentile >= 50) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getMessage = () => {
    if (percentile >= 95) return "Top performer";
    if (percentile >= 90) return "Excellent standing";
    if (percentile >= 75) return "Above average";
    if (percentile >= 50) return "On track";
    return "Building momentum";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={cn("text-lg font-bold", getColor())}>
          Top {100 - percentile}%
        </span>
        {totalUsers && (
          <span className="text-xs text-muted-foreground">
            of {totalUsers.toLocaleString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="card-organic p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Your Ranking</p>
          <p className={cn("text-3xl font-bold", getColor())}>
            Top {100 - percentile}%
          </p>
        </div>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full progress-ring" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray={`${percentile} 100`}
              strokeLinecap="round"
              className="progress-ring-circle"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-foreground">{percentile}th</span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">{getMessage()}</p>
      {totalUsers && (
        <p className="text-xs text-muted-foreground mt-1">
          Compared to {totalUsers.toLocaleString()} students
        </p>
      )}
    </div>
  );
}
