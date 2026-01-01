import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Leaderboard } from '@/components/Leaderboard';
import { Trophy, Loader2 } from 'lucide-react';

interface FullLeaderboardProps {
  compact?: boolean;
}

export function FullLeaderboard({ compact }: FullLeaderboardProps) {
  const { data: leaderboard, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!leaderboard || leaderboard.entries.length === 0) {
    return (
      <div className="card-organic p-6 text-center">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Complete some questions to see the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <Leaderboard
      entries={leaderboard.entries}
      currentUserRank={leaderboard.currentUserRank}
      totalUsers={leaderboard.totalUsers}
      compact={compact}
    />
  );
}
