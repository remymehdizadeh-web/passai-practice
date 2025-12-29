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
import { PercentileRank } from '@/components/PercentileRank';
import { Leaderboard } from '@/components/Leaderboard';
import { WeeklyReport } from '@/components/WeeklyReport';
import { 
  Play, 
  Bookmark, 
  AlertCircle,
  ChevronRight,
  LogIn,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

// Mock leaderboard data - in production this would come from the database
const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Sarah M.', accuracy: 94, questionsCompleted: 847 },
  { rank: 2, name: 'James L.', accuracy: 91, questionsCompleted: 723 },
  { rank: 3, name: 'Emily R.', accuracy: 89, questionsCompleted: 654 },
  { rank: 4, name: 'Michael K.', accuracy: 87, questionsCompleted: 598 },
  { rank: 5, name: 'Jessica T.', accuracy: 85, questionsCompleted: 521 },
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
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  const daysUntilExam = calculateDaysUntilExam(profile?.exam_date || null);
  const streakDays = profile?.streak_days || 0;
  const dailyGoal = profile?.study_goal_daily || 15;

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

    // Find weakest and strongest areas with enough data
    const categoriesWithData = categoryMastery.filter(c => c.total >= 3);
    const weakestArea = categoriesWithData.sort((a, b) => a.accuracy - b.accuracy)[0];
    const strongestArea = categoriesWithData.sort((a, b) => b.accuracy - a.accuracy)[0];

    // Readiness score (weighted by accuracy primarily)
    let readinessScore: number | null = null;
    if (answeredCount >= 10) {
      const accuracyWeight = accuracy * 0.75;
      const completionWeight = Math.min(completionRate, 100) * 0.15;
      const streakWeight = Math.min(streakDays * 2, 10);
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

    // Mock percentile (in production, calculate from all users)
    const percentile = Math.min(95, Math.max(20, Math.round(accuracy * 0.9 + completionRate * 0.1)));

    // Weekly stats (mock - would be calculated from last 7 days of progress)
    const weeklyData = {
      questionsThisWeek: Math.min(answeredCount, 87),
      questionsLastWeek: Math.round(Math.min(answeredCount, 87) * 0.8),
      accuracyThisWeek: accuracy,
      accuracyLastWeek: Math.max(0, accuracy - 3),
      strongestCategory: strongestArea?.category || 'Safety and Infection Control',
      weakestCategory: weakestArea?.category || 'Pharmacological and Parenteral Therapies',
      daysStudied: Math.min(7, streakDays || 3),
      percentileRank: percentile,
    };

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
      strongestArea,
      percentile,
      weeklyData,
    };
  }, [questions, progress, bookmarks, missedQuestions, streakDays]);

  return (
    <div className="pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your NCLEX journey</p>
        </div>
        {user && streakDays > 0 && (
          <StudyStreak days={streakDays} compact />
        )}
      </div>

      {/* Sign in prompt */}
      {!user && (
        <button
          onClick={() => navigate('/auth')}
          className="w-full card-organic p-4 flex items-center gap-4 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <LogIn className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Sign in to compete</p>
            <p className="text-sm text-muted-foreground">Track progress, join leaderboards</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Exam Countdown */}
      {user && (
        <ExamCountdown
          daysUntil={daysUntilExam}
          examDate={profile?.exam_date}
          onPress={() => setShowExamDate(true)}
        />
      )}

      {/* Readiness Score + Percentile Row */}
      {stats.readinessScore !== null && (
        <div className="grid grid-cols-2 gap-4">
          <ReadinessGauge 
            score={stats.readinessScore} 
            trend={stats.trend}
          />
          <PercentileRank 
            percentile={stats.percentile}
            totalUsers={12847}
          />
        </div>
      )}

      {/* Daily Goal */}
      <DailyGoal
        target={dailyGoal}
        completed={todayProgress}
        onStartPractice={() => onNavigate('practice')}
      />

      {/* Weekly Report Button */}
      {stats.answeredCount >= 10 && (
        <button
          onClick={() => setShowWeeklyReport(true)}
          className="w-full card-organic p-4 flex items-center gap-4 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-accent-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Weekly Report</p>
            <p className="text-sm text-muted-foreground">View your progress insights</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Weak Area Alert */}
      {stats.weakestArea && stats.weakestArea.accuracy < 70 && stats.weakestArea.total >= 5 && (
        <WeakAreaAlert
          category={stats.weakestArea.category}
          accuracy={stats.weakestArea.accuracy}
          onPractice={() => onNavigate('practice')}
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-foreground">{stats.answeredCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Completed</p>
        </div>
        <div className="stat-card text-center">
          <p className={cn(
            "text-2xl font-bold",
            stats.accuracy >= 75 ? "text-success" : 
            stats.accuracy >= 60 ? "text-warning" : 
            stats.accuracy > 0 ? "text-destructive" : "text-foreground"
          )}>{stats.accuracy}%</p>
          <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-foreground">{stats.missedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">To Review</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('practice')}
          className="btn-premium text-primary-foreground p-5 text-left"
        >
          <Play className="w-7 h-7 mb-3" />
          <p className="font-bold text-lg">Practice</p>
          <p className="text-sm opacity-80">{stats.totalQuestions - stats.answeredCount} remaining</p>
        </button>
        
        <button
          onClick={() => onNavigate('review', 'missed')}
          className={cn(
            "card-organic p-5 text-left transition-all hover:shadow-lg",
            stats.missedCount > 0 && "border-2 border-destructive/20"
          )}
        >
          <AlertCircle className={cn(
            "w-7 h-7 mb-3",
            stats.missedCount > 0 ? "text-destructive" : "text-muted-foreground"
          )} />
          <p className="font-bold text-lg text-foreground">Review</p>
          <p className="text-sm text-muted-foreground">{stats.missedCount} missed</p>
        </button>
      </div>

      {/* Leaderboard */}
      <Leaderboard
        entries={MOCK_LEADERBOARD.map((entry, i) => ({
          ...entry,
          isCurrentUser: i === 3, // Mock: current user is 4th
        }))}
        currentUserRank={4}
        totalUsers={12847}
      />

      {/* Category Mastery */}
      <CategoryMastery 
        categories={stats.categoryMastery}
        onCategoryClick={() => onNavigate('practice')}
      />

      {/* Bookmarks */}
      {stats.bookmarkCount > 0 && (
        <button
          onClick={() => onNavigate('review', 'bookmarked')}
          className="w-full card-organic p-4 flex items-center gap-4 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">{stats.bookmarkCount} Saved</p>
            <p className="text-sm text-muted-foreground">Review your bookmarks</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Streak Celebration */}
      {user && streakDays >= 3 && (
        <StudyStreak days={streakDays} />
      )}

      {/* Modals */}
      <ExamDateModal
        isOpen={showExamDate}
        onClose={() => setShowExamDate(false)}
        currentDate={profile?.exam_date}
      />

      <Dialog open={showWeeklyReport} onOpenChange={setShowWeeklyReport}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Weekly Report</DialogTitle>
          </DialogHeader>
          <WeeklyReport data={stats.weeklyData} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
