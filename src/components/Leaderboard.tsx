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
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="w-5 text-center text-sm font-bold text-muted-foreground">{rank}</span>;
}

function getRankBg(rank: number) {
  if (rank === 1) return 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5';
  if (rank === 2) return 'bg-gradient-to-r from-slate-400/10 to-slate-300/5';
  if (rank === 3) return 'bg-gradient-to-r from-amber-600/10 to-orange-500/5';
  return '';
}

export function Leaderboard({ entries, currentUserRank, totalUsers }: LeaderboardProps) {
  return (
    <div className="card-organic">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Leaderboard</h3>
            <p className="text-sm text-muted-foreground">This week's top performers</p>
          </div>
          {currentUserRank && totalUsers && (
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">#{currentUserRank}</p>
              <p className="text-xs text-muted-foreground">of {totalUsers}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-2">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={cn(
              "leaderboard-row",
              getRankBg(entry.rank),
              entry.isCurrentUser && "leaderboard-row-highlight"
            )}
          >
            <div className="w-8 flex items-center justify-center">
              {getRankIcon(entry.rank)}
            </div>
            
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-semibold truncate",
                entry.isCurrentUser ? "text-primary" : "text-foreground"
              )}>
                {entry.name}
                {entry.isCurrentUser && <span className="text-xs ml-1.5 text-muted-foreground">(You)</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.questionsCompleted} questions
              </p>
            </div>

            <div className="text-right">
              <p className={cn(
                "text-lg font-bold",
                entry.accuracy >= 85 ? "text-success" :
                entry.accuracy >= 70 ? "text-primary" : "text-foreground"
              )}>
                {entry.accuracy}%
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">accuracy</p>
            </div>
          </div>
        ))}
      </div>

      {currentUserRank && currentUserRank > 10 && (
        <div className="px-5 pb-4">
          <div className="text-center py-2 text-sm text-muted-foreground">
            ···
          </div>
          <div className="leaderboard-row leaderboard-row-highlight">
            <div className="w-8 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">#{currentUserRank}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">You</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
