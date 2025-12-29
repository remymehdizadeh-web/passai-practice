import { useMemo, useState } from 'react';
import { useQuestions, useUserProgress, useBookmarks, useMissedQuestions } from '@/hooks/useQuestions';
import { useProfile, calculateDaysUntilExam } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { ExamDateModal } from '@/components/ExamDateModal';
import { getPoints } from '@/lib/points';
import { 
  Play, 
  Target, 
  TrendingUp, 
  Bookmark, 
  AlertCircle,
  ChevronRight,
  Flame,
  Calendar,
  Trophy,
  LogIn,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type ReviewFilter = 'bookmarked' | 'missed';

interface HomeViewProps {
  onNavigate: (tab: 'practice' | 'review' | 'settings', filter?: ReviewFilter) => void;
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

    // Readiness score based primarily on accuracy
    const readinessScore = answeredCount >= 5 
      ? Math.round((accuracy * 0.85) + (completionRate * 0.15))
      : null;

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
      totalPoints: getPoints(),
    };
  }, [questions, progress, bookmarks, missedQuestions]);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your study overview</p>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
              streakDays > 0 ? "bg-orange-500/10" : "bg-muted"
            )}>
              <Flame className={cn(
                "w-4 h-4",
                streakDays > 0 ? "text-orange-500" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-semibold",
                streakDays > 0 ? "text-orange-500" : "text-muted-foreground"
              )}>
                {streakDays}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sign in prompt for non-authenticated users */}
      {!user && (
        <button
          onClick={() => navigate('/auth')}
          className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 flex items-center gap-3 hover:bg-primary/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Sign in to track progress</p>
            <p className="text-xs text-muted-foreground">Streaks, exam countdown & more</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>
      )}

      {/* Exam Countdown */}
      {user && (
        <button
          onClick={() => setShowExamDate(true)}
          className="w-full bg-card border border-border rounded-xl p-4 mb-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            {daysUntilExam !== null ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  <span className={cn(
                    "text-lg font-semibold mr-1",
                    daysUntilExam <= 7 ? "text-destructive" : 
                    daysUntilExam <= 30 ? "text-amber-500" : "text-primary"
                  )}>
                    {daysUntilExam}
                  </span>
                  days until exam
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(profile?.exam_date || '').toLocaleDateString('en-US', { 
                    month: 'long', day: 'numeric', year: 'numeric' 
                  })}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">Set your exam date</p>
                <p className="text-xs text-muted-foreground">Track your countdown to test day</p>
              </>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Readiness Score */}
      {stats.readinessScore !== null && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Readiness Score</span>
            </div>
            <span className={cn(
              "text-2xl font-bold",
              stats.readinessScore >= 75 ? "text-success" :
              stats.readinessScore >= 50 ? "text-amber-500" : "text-destructive"
            )}>
              {stats.readinessScore}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                stats.readinessScore >= 75 ? "bg-success" :
                stats.readinessScore >= 50 ? "bg-amber-500" : "bg-destructive"
              )}
              style={{ width: `${stats.readinessScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on accuracy and completion rate
          </p>
        </div>
      )}

      {/* Points Display */}
      {stats.totalPoints > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              <span className="text-sm font-medium text-foreground">Total Points</span>
            </div>
            <span className="text-2xl font-bold text-emerald-500">{stats.totalPoints.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => onNavigate('practice')}
          className="bg-primary text-primary-foreground rounded-xl p-4 text-left hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <Play className="w-6 h-6 mb-2" />
          <p className="font-semibold">Practice</p>
          <p className="text-sm opacity-80">{stats.totalQuestions - stats.answeredCount} remaining</p>
        </button>
        
        <button
          onClick={() => onNavigate('review', 'missed')}
          className="bg-card border-2 border-destructive/20 rounded-xl p-4 text-left hover:bg-destructive/5 transition-all active:scale-[0.98]"
        >
          <AlertCircle className="w-6 h-6 mb-2 text-destructive" />
          <p className="font-semibold text-foreground">Missed</p>
          <p className="text-sm text-muted-foreground">{stats.missedCount} to review</p>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-semibold text-foreground">{stats.answeredCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Done</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className={cn(
            "text-xl font-semibold",
            stats.accuracy >= 70 ? "text-success" : 
            stats.accuracy >= 50 ? "text-foreground" : "text-destructive"
          )}>{stats.accuracy}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Accuracy</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-semibold text-foreground">{stats.completionRate}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Progress</p>
        </div>
      </div>

      {/* Category Mastery - All 8 Categories */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Category Mastery
          </p>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {stats.categoryMastery.map(({ category, accuracy, total }) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground truncate pr-2">{category}</span>
                <span className={cn(
                  "text-xs font-medium shrink-0",
                  total === 0 ? "text-muted-foreground" :
                  accuracy >= 80 ? "text-success" :
                  accuracy >= 60 ? "text-amber-500" : "text-destructive"
                )}>
                  {total === 0 ? '—' : `${accuracy}%`}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    total === 0 ? "bg-muted" :
                    accuracy >= 80 ? "bg-success" :
                    accuracy >= 60 ? "bg-amber-500" : "bg-destructive"
                  )}
                  style={{ width: total === 0 ? '0%' : `${accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bookmarks */}
      {stats.bookmarkCount > 0 && (
        <button
          onClick={() => onNavigate('review', 'bookmarked')}
          className="w-full bg-card border border-border rounded-xl p-4 mt-4 flex items-center gap-3 hover:bg-muted/30 transition-colors active:scale-[0.98]"
        >
          <Bookmark className="w-5 h-5 text-primary" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">{stats.bookmarkCount} Saved</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      <ExamDateModal
        isOpen={showExamDate}
        onClose={() => setShowExamDate(false)}
        currentDate={profile?.exam_date}
      />
    </div>
  );
}
