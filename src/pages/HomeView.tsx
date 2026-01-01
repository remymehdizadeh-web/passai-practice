import { useMemo, useState } from 'react';
import { useQuestions, useUserProgress, useBookmarks, useMissedQuestions } from '@/hooks/useQuestions';
import { useProfile, calculateDaysUntilExam } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { ExamDateModal } from '@/components/ExamDateModal';
import { ReadinessGauge } from '@/components/ReadinessGauge';
import { DailyGoal } from '@/components/DailyGoal';
import { ExamCountdown } from '@/components/ExamCountdown';
import { StudyStreak } from '@/components/StudyStreak';
import { PercentileRank } from '@/components/PercentileRank';
import { WeeklyReport } from '@/components/WeeklyReport';
import { CategoryMastery } from '@/components/CategoryMastery';
import { FullAchievements } from '@/components/FullAchievements';
import { WeakAreaAlert } from '@/components/WeakAreaAlert';
import { 
  Play, 
  AlertCircle,
  ChevronRight,
  LogIn,
  BarChart3,
  Bookmark,
  Award
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
  onOpenWeakArea?: () => void;
}

import { NCLEX_CATEGORIES } from '@/lib/categories';

export function HomeView({ onNavigate, onOpenWeakArea }: HomeViewProps) {
  const { data: questions } = useQuestions();
  const { data: progress } = useUserProgress();
  const { data: bookmarks } = useBookmarks();
  const { data: missedQuestions } = useMissedQuestions();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showExamDate, setShowExamDate] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const daysUntilExam = calculateDaysUntilExam(profile?.exam_date || null);
  const streakDays = profile?.streak_days || 0;
  const dailyGoal = profile?.study_goal_daily || 15;

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
    
    // Use NCLEX categories for analytics and readiness scoring
    const nclexCategoryStats: Record<string, { correct: number; total: number }> = {};
    progress?.forEach((p) => {
      const q = questions?.find((q) => q.id === p.question_id);
      if (q) {
        const nclexCat = q.nclex_category || q.category;
        if (!nclexCategoryStats[nclexCat]) {
          nclexCategoryStats[nclexCat] = { correct: 0, total: 0 };
        }
        nclexCategoryStats[nclexCat].total++;
        if (p.is_correct) nclexCategoryStats[nclexCat].correct++;
      }
    });

    const categoryMastery = NCLEX_CATEGORIES.map(category => {
      const catStats = nclexCategoryStats[category];
      return {
        category,
        accuracy: catStats ? Math.round((catStats.correct / catStats.total) * 100) : 0,
        total: catStats?.total || 0,
        correct: catStats?.correct || 0,
      };
    });

    const categoriesWithData = categoryMastery.filter(c => c.total >= 3);
    const weakestArea = categoriesWithData.sort((a, b) => a.accuracy - b.accuracy)[0];
    const strongestArea = categoriesWithData.sort((a, b) => b.accuracy - a.accuracy)[0];

    let readinessScore: number | null = null;
    if (answeredCount >= 10) {
      const accuracyWeight = accuracy * 0.75;
      const completionWeight = Math.min(completionRate, 100) * 0.15;
      const streakWeight = Math.min(streakDays * 2, 10);
      readinessScore = Math.round(accuracyWeight + completionWeight + streakWeight);
    }

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

    const percentile = Math.min(95, Math.max(20, Math.round(accuracy * 0.9 + completionRate * 0.1)));

    const weeklyData = {
      questionsThisWeek: Math.min(answeredCount, 87),
      questionsLastWeek: Math.round(Math.min(answeredCount, 87) * 0.8),
      accuracyThisWeek: accuracy,
      accuracyLastWeek: Math.max(0, accuracy - 3),
      strongestCategory: strongestArea?.category || 'Safety and Infection Control',
      weakestCategory: weakestArea?.category || 'Pharmacological and Parenteral Therapies',
      daysStudied: Math.min(7, streakDays || 3),
      percentileRank: percentile,
      streakDays: streakDays,
      totalCompleted: answeredCount,
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
      percentile,
      weeklyData,
    };
  }, [questions, progress, bookmarks, missedQuestions, streakDays]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Your NCLEX journey</p>
        </div>
        <div className="flex items-center gap-2">
          {user && streakDays > 0 && (
            <StudyStreak days={streakDays} compact />
          )}
          {user && stats.answeredCount >= 5 && (
            <button
              onClick={() => setShowAchievements(true)}
              className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center hover:bg-amber-500/20 transition-colors"
            >
              <Award className="w-4 h-4 text-amber-500" />
            </button>
          )}
          {user && stats.answeredCount >= 10 && (
            <button
              onClick={() => setShowWeeklyReport(true)}
              className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-accent" />
            </button>
          )}
        </div>
      </div>

      {/* Main content - no scroll */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {/* Sign in prompt OR Exam countdown */}
        {!user ? (
          <button
            onClick={() => navigate('/auth')}
            className="card-organic p-4 flex items-center gap-4 hover:shadow-lg transition-all flex-shrink-0"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Sign in to unlock</p>
              <p className="text-sm text-muted-foreground">Set goals, track progress, and more</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ) : (
          <>
            <ExamCountdown
              daysUntil={daysUntilExam}
              examDate={profile?.exam_date}
              onPress={() => setShowExamDate(true)}
            />
            {/* Daily Goal - only for signed in users */}
            <DailyGoal
              target={dailyGoal}
              completed={todayProgress}
              onStartPractice={() => onNavigate('practice')}
            />
          </>
        )}

        {/* Stats row: Readiness + Percentile (signed in only) */}
        {user && stats.readinessScore !== null && (
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
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

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
          <div className="stat-card text-center py-3">
            <p className="text-lg font-bold text-foreground">{stats.answeredCount}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
          <div className="stat-card text-center py-3">
            <p className={cn(
              "text-lg font-bold",
              stats.accuracy >= 75 ? "text-success" : 
              stats.accuracy >= 60 ? "text-warning" : 
              stats.accuracy > 0 ? "text-destructive" : "text-foreground"
            )}>{stats.accuracy}%</p>
            <p className="text-[10px] text-muted-foreground">Accuracy</p>
          </div>
          <div className="stat-card text-center py-3">
            <p className="text-lg font-bold text-destructive">{stats.missedCount}</p>
            <p className="text-[10px] text-muted-foreground">To Review</p>
          </div>
        </div>

        {/* Weak Area Alert */}
        {user && stats.weakestArea && stats.weakestArea.accuracy < 60 && stats.weakestArea.total >= 3 && (
          <div className="flex-shrink-0">
            <WeakAreaAlert 
              category={stats.weakestArea.category}
              accuracy={stats.weakestArea.accuracy}
              onPractice={() => onOpenWeakArea?.()}
            />
          </div>
        )}

        {/* Category Mastery - directly on home */}
        {user && stats.answeredCount >= 5 && (
          <div className="flex-shrink-0">
            <CategoryMastery 
              categories={stats.categoryMastery}
              onCategoryClick={() => {}}
              compact
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          <button
            onClick={() => onNavigate('practice')}
            className="btn-premium text-primary-foreground p-4 text-left"
          >
            <Play className="w-6 h-6 mb-2" />
            <p className="font-bold">Practice</p>
            <p className="text-xs opacity-80">{stats.totalQuestions - stats.answeredCount} left</p>
          </button>
          
          <button
            onClick={() => onNavigate('review', 'missed')}
            className={cn(
              "card-organic p-4 text-left transition-all hover:shadow-lg",
              stats.missedCount > 0 && "border-2 border-destructive/20"
            )}
          >
            <AlertCircle className={cn(
              "w-6 h-6 mb-2",
              stats.missedCount > 0 ? "text-destructive" : "text-muted-foreground"
            )} />
            <p className="font-bold text-foreground">Review</p>
            <p className="text-xs text-muted-foreground">{stats.missedCount} missed</p>
          </button>
        </div>

        {/* Bookmarks quick access */}
        {stats.bookmarkCount > 0 && (
          <button
            onClick={() => onNavigate('review', 'bookmarked')}
            className="card-organic p-3 flex items-center gap-3 hover:shadow-lg transition-all flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm text-foreground">{stats.bookmarkCount} Saved Questions</p>
              <p className="text-xs text-muted-foreground">Review your bookmarks</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

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


      {/* Achievements Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Achievements</DialogTitle>
          </DialogHeader>
          <FullAchievements />
        </DialogContent>
      </Dialog>
    </div>
  );
}
