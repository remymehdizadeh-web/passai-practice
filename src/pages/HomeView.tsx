import { useMemo, useState } from 'react';
import { useQuestions, useUserProgress, useBookmarks, useMissedQuestions } from '@/hooks/useQuestions';
import { useProfile, calculateDaysUntilExam } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { ExamDateModal } from '@/components/ExamDateModal';
import { ReadinessGauge } from '@/components/ReadinessGauge';
import { CategoryMastery } from '@/components/CategoryMastery';
import { DailyGoal } from '@/components/DailyGoal';
import { ExamCountdown } from '@/components/ExamCountdown';
import { StudyStreak } from '@/components/StudyStreak';
import { WeakAreaAlert } from '@/components/WeakAreaAlert';
import { getPoints } from '@/lib/points';
import { 
  Play, 
  Bookmark, 
  AlertCircle,
  ChevronRight,
  LogIn,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type ReviewFilter = 'bookmarked' | 'missed';

interface HomeViewProps {
  onNavigate: (tab: 'practice' | 'review', filter?: ReviewFilter) => void;
}

// The 8 NCLEX-RN categories
const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion and Maintenance',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological and Parenteral Therapies',
  'Reduction of Risk Potential',
  'Physiological Adaptation',
];

export function HomeView({ onNavigate }: HomeViewProps) {
  const { data: questions } = useQuestions();
  const { data: progress } = useUserProgress();
  const { data: bookmarks } = useBookmarks();
  const { data: missedQuestions } = useMissedQuestions();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showExamDate, setShowExamDate] = useState(false);

  const daysUntilExam = calculateDaysUntilExam(profile?.exam_date || null);
  const streakDays = profile?.streak_days || 0;
  const dailyGoal = profile?.study_goal_daily || 10;

  // Calculate today's progress
  const todayProgress = useMemo(() => {
    if (!progress) return 0;
    const today = new Date().toISOString().split('T')[0];
    return progress.filter(p => p.created_at.split('T')[0] === today).length;
  }, [progress]);

  const stats = useMemo(() => {
    const totalQuestions = questions?.length || 0;
    const answeredCount = progress?.length || 0;
    const correctCount = progress?.filter(p => p.is_correct).length || 0;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    const completionRate = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    
    // Calculate category performance with mastery levels
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

    // Build mastery for all 8 categories
    const categoryMastery = NCLEX_CATEGORIES.map(category => {
      const catStats = categoryStats[category];
      return {
        category,
        accuracy: catStats ? Math.round((catStats.correct / catStats.total) * 100) : 0,
        total: catStats?.total || 0,
        correct: catStats?.correct || 0,
      };
    });

    // Find weakest area with enough data
    const weakestArea = categoryMastery
      .filter(c => c.total >= 3)
      .sort((a, b) => a.accuracy - b.accuracy)[0];

    // Readiness score calculation
    // Weight: 70% accuracy, 20% completion, 10% consistency (streak)
    let readinessScore: number | null = null;
    if (answeredCount >= 10) {
      const accuracyWeight = accuracy * 0.7;
      const completionWeight = Math.min(completionRate, 100) * 0.2;
      const streakWeight = Math.min(streakDays * 2, 10) * 0.1 * 10; // Max 10 points from streak
      readinessScore = Math.round(accuracyWeight + completionWeight + streakWeight);
    }

    // Calculate trend based on recent performance
    const recentProgress = progress?.slice(-20) || [];
    const olderProgress = progress?.slice(-40, -20) || [];
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    if (recentProgress.length >= 10 && olderProgress.length >= 10) {
      const recentAccuracy = recentProgress.filter(p => p.is_correct).length / recentProgress.length;
      const olderAccuracy = olderProgress.filter(p => p.is_correct).length / olderProgress.length;
      const diff = recentAccuracy - olderAccuracy;
      if (diff > 0.05) trend = 'up';
      else if (diff < -0.05) trend = 'down';
    }

    return {
      totalQuestions,
      answeredCount,
      correctCount,
      accuracy,
      completionRate,
      bookmarkCount: bookmarks?.length || 0,
      missedCount: missedQuestions?.length || 0,
      categoryMastery,
      readinessScore,
      trend,
      weakestArea,
      totalPoints: getPoints(),
    };
  }, [questions, progress, bookmarks, missedQuestions, streakDays]);

  return (
    <div className="pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your study overview</p>
        </div>
        {user && streakDays > 0 && (
          <StudyStreak days={streakDays} compact />
        )}
      </div>

      {/* Sign in prompt for non-authenticated users */}
      {!user && (
        <button
          onClick={() => navigate('/auth')}
          className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 hover:bg-primary/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Sign in to track progress</p>
            <p className="text-xs text-muted-foreground">Streaks, exam countdown & more</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>
      )}

      {/* Exam Countdown - Always show for logged in users */}
      {user && (
        <ExamCountdown
          daysUntil={daysUntilExam}
          examDate={profile?.exam_date}
          onPress={() => setShowExamDate(true)}
        />
      )}

      {/* Readiness Score */}
      {stats.readinessScore !== null && (
        <ReadinessGauge 
          score={stats.readinessScore} 
          trend={stats.trend}
          questionsNeeded={stats.readinessScore < 85 ? Math.ceil((85 - stats.readinessScore) * 2) : undefined}
        />
      )}

      {/* Daily Goal */}
      <DailyGoal
        target={dailyGoal}
        completed={todayProgress}
        onStartPractice={() => onNavigate('practice')}
      />

      {/* Weak Area Alert */}
      {stats.weakestArea && stats.weakestArea.accuracy < 70 && (
        <WeakAreaAlert
          category={stats.weakestArea.category}
          accuracy={stats.weakestArea.accuracy}
          onPractice={() => onNavigate('practice')}
        />
      )}

      {/* Points Display */}
      {stats.totalPoints > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Total Points</p>
                <p className="text-xs text-muted-foreground">Keep practicing to earn more</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-emerald-500">{stats.totalPoints.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-foreground">{stats.answeredCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Completed</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className={cn(
            "text-xl font-bold",
            stats.accuracy >= 75 ? "text-emerald-500" : 
            stats.accuracy >= 60 ? "text-amber-500" : 
            stats.accuracy > 0 ? "text-destructive" : "text-foreground"
          )}>{stats.accuracy}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Accuracy</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-foreground">{stats.missedCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">To Review</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('practice')}
          className="bg-primary text-primary-foreground rounded-2xl p-4 text-left hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <Play className="w-6 h-6 mb-2" />
          <p className="font-semibold">Practice</p>
          <p className="text-sm opacity-80">{stats.totalQuestions - stats.answeredCount} remaining</p>
        </button>
        
        <button
          onClick={() => onNavigate('review', 'missed')}
          className={cn(
            "rounded-2xl p-4 text-left transition-all active:scale-[0.98]",
            stats.missedCount > 0 
              ? "bg-destructive/10 border-2 border-destructive/20 hover:bg-destructive/15" 
              : "bg-card border border-border hover:bg-muted/30"
          )}
        >
          <AlertCircle className={cn(
            "w-6 h-6 mb-2",
            stats.missedCount > 0 ? "text-destructive" : "text-muted-foreground"
          )} />
          <p className="font-semibold text-foreground">Review Missed</p>
          <p className="text-sm text-muted-foreground">{stats.missedCount} questions</p>
        </button>
      </div>

      {/* Category Mastery */}
      <CategoryMastery 
        categories={stats.categoryMastery}
        onCategoryClick={() => onNavigate('practice')}
      />

      {/* Bookmarks */}
      {stats.bookmarkCount > 0 && (
        <button
          onClick={() => onNavigate('review', 'bookmarked')}
          className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">{stats.bookmarkCount} Saved Questions</p>
            <p className="text-xs text-muted-foreground">Review your bookmarks</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Streak Celebration (for longer streaks) */}
      {user && streakDays >= 3 && (
        <StudyStreak days={streakDays} />
      )}

      <ExamDateModal
        isOpen={showExamDate}
        onClose={() => setShowExamDate(false)}
        currentDate={profile?.exam_date}
      />
    </div>
  );
}
