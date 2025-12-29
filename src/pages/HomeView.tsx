import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestions, useUserProgress, useBookmarks, useMissedQuestions } from '@/hooks/useQuestions';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Target, 
  TrendingUp, 
  Bookmark, 
  AlertCircle,
  ChevronRight,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeViewProps {
  onNavigate: (tab: 'practice' | 'review' | 'settings') => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const { data: questions } = useQuestions();
  const { data: progress } = useUserProgress();
  const { data: bookmarks } = useBookmarks();
  const { data: missedQuestions } = useMissedQuestions();

  const stats = useMemo(() => {
    const totalQuestions = questions?.length || 0;
    const answeredCount = progress?.length || 0;
    const correctCount = progress?.filter(p => p.is_correct).length || 0;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    const completionRate = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    
    // Calculate category performance
    const categoryStats: Record<string, { correct: number; total: number }> = {};
    progress?.forEach((p) => {
      const q = questions?.find((q) => q.id === p.question_id);
      if (q) {
        if (!categoryStats[q.category]) {
          categoryStats[q.category] = { correct: 0, total: 0 };
        }
        categoryStats[q.category].total++;
        if (p.is_correct) categoryStats[q.category].correct++;
      }
    });

    // Find weak categories (< 70% accuracy, min 2 questions)
    const weakCategories = Object.entries(categoryStats)
      .filter(([_, stats]) => stats.total >= 2 && (stats.correct / stats.total) < 0.7)
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
      .slice(0, 3);

    return {
      totalQuestions,
      answeredCount,
      correctCount,
      accuracy,
      completionRate,
      bookmarkCount: bookmarks?.length || 0,
      missedCount: missedQuestions?.length || 0,
      weakCategories,
    };
  }, [questions, progress, bookmarks, missedQuestions]);

  // Simple daily goal (10 questions per day for now - stored in session)
  const dailyGoal = 10;
  const todayAnswered = Math.min(stats.answeredCount, dailyGoal); // Simplified for MVP
  const dailyProgress = Math.round((todayAnswered / dailyGoal) * 100);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Ready to study?</p>
      </div>

      {/* Daily Goal Card */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Daily Goal</p>
              <p className="text-xs text-muted-foreground">{todayAnswered} of {dailyGoal} questions</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-semibold">1</span>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(dailyProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => onNavigate('practice')}
          className="bg-primary text-primary-foreground rounded-xl p-4 text-left hover:bg-primary/90 transition-colors"
        >
          <Play className="w-5 h-5 mb-2" />
          <p className="text-sm font-medium">Continue Practice</p>
          <p className="text-xs opacity-80">{stats.totalQuestions - stats.answeredCount} remaining</p>
        </button>
        
        <button
          onClick={() => onNavigate('review')}
          className="bg-card border border-border rounded-xl p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <AlertCircle className="w-5 h-5 mb-2 text-destructive" />
          <p className="text-sm font-medium text-foreground">Review Missed</p>
          <p className="text-xs text-muted-foreground">{stats.missedCount} questions</p>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Your Progress
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.answeredCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className={cn(
              "text-2xl font-semibold",
              stats.accuracy >= 70 ? "text-success" : stats.accuracy >= 50 ? "text-foreground" : "text-destructive"
            )}>{stats.accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.completionRate}%</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
        </div>
      </div>

      {/* Weak Categories */}
      {stats.weakCategories.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Focus Areas
            </p>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {stats.weakCategories.map(([category, catStats]) => {
              const catAccuracy = Math.round((catStats.correct / catStats.total) * 100);
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{category}</span>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded",
                    catAccuracy < 50 ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"
                  )}>
                    {catAccuracy}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bookmarks Quick Access */}
      {stats.bookmarkCount > 0 && (
        <button
          onClick={() => onNavigate('review')}
          className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">{stats.bookmarkCount} Bookmarked</p>
            <p className="text-xs text-muted-foreground">Questions you saved for later</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}