import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Crown, User } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  accuracy: number;
  questionsCompleted: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  totalUsers?: number;
  compact?: boolean;
}

function getRankIcon(rank: number, compact?: boolean) {
  const size = compact ? "w-4 h-4" : "w-5 h-5";
  if (rank === 1) return <Crown className={cn(size, "text-amber-500")} />;
  if (rank === 2) return <Medal className={cn(size, "text-slate-400")} />;
  if (rank === 3) return <Award className={cn(size, "text-amber-600")} />;
  return <span className="w-5 text-center text-sm font-bold text-muted-foreground">{rank}</span>;
}

export function Leaderboard({ entries, currentUserRank, totalUsers, compact }: LeaderboardProps) {
  const displayEntries = compact ? entries.slice(0, 3) : entries;
  
  return (
    <div className="card-organic h-full flex flex-col">
      <div className={cn("border-b border-border/50", compact ? "p-3" : "p-5")}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={cn("font-bold text-foreground", compact ? "text-sm" : "text-lg")}>Leaderboard</h3>
            {!compact && <p className="text-sm text-muted-foreground">This week's top performers</p>}
          </div>
          {currentUserRank && totalUsers && (
            <div className="text-right">
              <p className={cn("font-bold text-primary", compact ? "text-lg" : "text-2xl")}>#{currentUserRank}</p>
              <p className="text-xs text-muted-foreground">of {totalUsers}</p>
            </div>
          )}
        </div>
      </div>

      <div className={cn("flex-1", compact ? "p-1.5" : "p-2")}>
        {displayEntries.map((entry) => (
          <div
            key={entry.rank}
            className={cn(
              "flex items-center gap-2 rounded-xl transition-all",
              compact ? "p-2" : "p-3",
              entry.isCurrentUser && "bg-primary/10 border border-primary/20"
            )}
          >
            <div className="w-6 flex items-center justify-center">
              {getRankIcon(entry.rank, compact)}
            </div>
            
            <div className={cn(
              "rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center",
              compact ? "w-7 h-7" : "w-10 h-10"
            )}>
              <User className={cn(compact ? "w-3.5 h-3.5" : "w-5 h-5", "text-primary")} />
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-semibold truncate",
                compact ? "text-xs" : "text-sm",
                entry.isCurrentUser ? "text-primary" : "text-foreground"
              )}>
                {entry.name}
                {entry.isCurrentUser && <span className="text-xs ml-1 text-muted-foreground">(You)</span>}
              </p>
            </div>

            <div className="text-right">
              <p className={cn(
                "font-bold",
                compact ? "text-sm" : "text-lg",
                entry.accuracy >= 85 ? "text-success" : "text-foreground"
              )}>
                {entry.accuracy}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
