import { useState, useMemo, useEffect } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { PaywallModal } from '@/components/PaywallModal';
import { ProgressBar } from '@/components/ProgressBar';
import { useQuestions, useBookmarks, useToggleBookmark, useRecordProgress, useUserProgress } from '@/hooks/useQuestions';
import { useProfile, useUpdateStreak } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { incrementQuestionsAnswered, shouldShowPaywall, getRemainingFreeQuestions } from '@/lib/session';
import { Loader2, Flame, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PracticeView() {
  const { data: questions, isLoading } = useQuestions();
  const { data: bookmarks } = useBookmarks();
  const { data: progress } = useUserProgress();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const toggleBookmark = useToggleBookmark();
  const recordProgress = useRecordProgress();
  const updateStreak = useUpdateStreak();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasUpdatedStreak, setHasUpdatedStreak] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);

  // Update streak when user answers first question of the day
  useEffect(() => {
    if (user && isSubmitted && !hasUpdatedStreak) {
      updateStreak.mutate();
      setHasUpdatedStreak(true);
    }
  }, [user, isSubmitted, hasUpdatedStreak, updateStreak]);

  // Get prioritized questions based on weak NCLEX categories (internal adaptive logic)
  const prioritizedQuestions = useMemo(() => {
    if (!questions || !progress) return questions || [];
    
    // Track performance by NCLEX category for adaptive selection
    const nclexCategoryStats: Record<string, { correct: number; total: number }> = {};
    progress.forEach((p) => {
      const q = questions.find((q) => q.id === p.question_id);
      if (q) {
        const nclexCat = q.nclex_category || q.category;
        if (!nclexCategoryStats[nclexCat]) {
          nclexCategoryStats[nclexCat] = { correct: 0, total: 0 };
        }
        nclexCategoryStats[nclexCat].total++;
        if (p.is_correct) nclexCategoryStats[nclexCat].correct++;
      }
    });

    // Calculate weakness scores based on NCLEX categories
    const weaknessScores: Record<string, number> = {};
    Object.entries(nclexCategoryStats).forEach(([category, stats]) => {
      weaknessScores[category] = stats.total > 0 ? stats.correct / stats.total : 0.5;
    });

    const answeredIds = new Set(progress.map((p) => p.question_id));
    
    return [...questions].sort((a, b) => {
      const aAnswered = answeredIds.has(a.id);
      const bAnswered = answeredIds.has(b.id);
      
      if (!aAnswered && bAnswered) return -1;
      if (aAnswered && !bAnswered) return 1;
      
      // Use NCLEX category for adaptive prioritization
      const aNclexCat = a.nclex_category || a.category;
      const bNclexCat = b.nclex_category || b.category;
      const aScore = weaknessScores[aNclexCat] ?? 0.5;
      const bScore = weaknessScores[bNclexCat] ?? 0.5;
      return aScore - bScore;
    });
  }, [questions, progress]);

  const currentQuestion = prioritizedQuestions?.[currentIndex];

  const isBookmarked = bookmarks?.some(
    (b) => b.question_id === currentQuestion?.id
  ) ?? false;

  const handleSelectAnswer = async (label: string) => {
    if (!currentQuestion) return;
    
    setSelectedLabel(label);
    const isCorrect = label === currentQuestion.correct_label;
    setIsSubmitted(true);

    // Track correct streak for session
    if (isCorrect) {
      setCorrectStreak(prev => prev + 1);
    } else {
      setCorrectStreak(0);
    }

    await recordProgress.mutateAsync({
      questionId: currentQuestion.id,
      selectedLabel: label,
      isCorrect,
      confidence: null,
    });

    incrementQuestionsAnswered();
  };

  const handleNext = () => {
    if (shouldShowPaywall()) {
      setShowPaywall(true);
      return;
    }

    if (currentIndex < (prioritizedQuestions?.length || 0) - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
    setIsSubmitted(false);
    setSelectedLabel(null);
  };

  const handleBookmark = async () => {
    if (!currentQuestion) return;
    await toggleBookmark.mutateAsync({
      questionId: currentQuestion.id,
      isBookmarked,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center p-6">
        <p className="text-muted-foreground">No questions available.</p>
      </div>
    );
  }

  const remaining = getRemainingFreeQuestions();
  const totalQuestions = prioritizedQuestions?.length || 0;
  const answeredCount = progress?.length || 0;
  const correctCount = progress?.filter(p => p.is_correct).length || 0;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const overallProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const daysUntilExam = profile?.exam_date 
    ? Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="pb-6">
      {/* Compact header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {user && profile?.streak_days && profile.streak_days > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-orange-500">{profile.streak_days}</span>
            </div>
          )}
          {user && daysUntilExam !== null && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">{daysUntilExam}d</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {correctStreak >= 3 && (
            <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {correctStreak}
            </span>
          )}
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-bold",
            accuracy >= 75 ? "bg-success/10 text-success" :
            accuracy >= 60 ? "bg-warning/10 text-warning" :
            accuracy > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          )}>
            {accuracy}%
          </span>
        </div>
      </div>

      {/* Minimal progress bar */}
      <div className="mb-4">
        <ProgressBar 
          current={answeredCount} 
          total={totalQuestions}
          className="h-1.5 rounded-full"
        />
        <p className="text-xs text-muted-foreground mt-1">{answeredCount} of {totalQuestions}</p>
      </div>

      {/* Free questions remaining */}
      {remaining > 0 && remaining <= 5 && (
        <div className="mb-3 p-2 rounded-xl bg-primary/5 border border-primary/10 text-center">
          <p className="text-xs text-foreground font-medium">
            {remaining} free question{remaining !== 1 ? 's' : ''} left
          </p>
        </div>
      )}

      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={totalQuestions}
        isBookmarked={isBookmarked}
        onSubmit={handleSelectAnswer}
        onBookmark={handleBookmark}
        onReport={() => setShowReport(true)}
        isSubmitted={isSubmitted}
        selectedLabel={selectedLabel}
      />
      {isSubmitted && selectedLabel && (
        <ExplanationPanel
          question={currentQuestion}
          selectedLabel={selectedLabel}
          onNext={handleNext}
        />
      )}

      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        questionId={currentQuestion.id}
      />

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}