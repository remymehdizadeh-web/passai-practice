import { useState, useMemo, useEffect, useRef } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { PaywallModal } from '@/components/PaywallModal';
import { ProgressBar } from '@/components/ProgressBar';
import { useQuestions, useBookmarks, useToggleBookmark, useRecordProgress, useUserProgress } from '@/hooks/useQuestions';
import { useProfile, useUpdateStreak } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { incrementQuestionsAnswered, shouldShowPaywall, getRemainingFreeQuestions } from '@/lib/session';
import { Loader2, Flame, Zap } from 'lucide-react';
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

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasUpdatedStreak, setHasUpdatedStreak] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  
  // Store the prioritized list at the moment we need to pick a new question
  // This prevents the list from changing while viewing a question
  const lockedQuestionsRef = useRef<typeof questions>(null);

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

  // Set initial question when data loads or when we need to pick next question
  useEffect(() => {
    if (!currentQuestionId && prioritizedQuestions.length > 0) {
      lockedQuestionsRef.current = prioritizedQuestions;
      setCurrentQuestionId(prioritizedQuestions[0].id);
    }
  }, [currentQuestionId, prioritizedQuestions]);

  // Find current question by ID (stable reference)
  const currentQuestion = useMemo(() => {
    if (!currentQuestionId || !questions) return null;
    return questions.find(q => q.id === currentQuestionId) || null;
  }, [currentQuestionId, questions]);

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

    // Scroll the main container to top
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Get fresh prioritized list and pick next question
    const currentList = prioritizedQuestions;
    const currentIdx = currentList.findIndex(q => q.id === currentQuestionId);
    
    if (currentIdx < currentList.length - 1) {
      setCurrentQuestionId(currentList[currentIdx + 1].id);
    } else {
      // Loop back to first question
      setCurrentQuestionId(currentList[0]?.id || null);
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
      <div className="pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <div className="h-7 w-14 skeleton-premium rounded-full" />
            <div className="h-7 w-14 skeleton-premium rounded-full" />
          </div>
          <div className="h-7 w-16 skeleton-premium rounded-full" />
        </div>
        <div className="h-1.5 skeleton-premium rounded-full mb-4" />
        <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-24 skeleton-premium rounded-md" />
            <div className="flex gap-2">
              <div className="w-8 h-8 skeleton-premium rounded-lg" />
              <div className="w-8 h-8 skeleton-premium rounded-lg" />
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <div className="h-4 skeleton-premium rounded w-full" />
            <div className="h-4 skeleton-premium rounded w-5/6" />
            <div className="h-4 skeleton-premium rounded w-4/6" />
          </div>
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 skeleton-premium rounded-xl" />
            ))}
          </div>
          <div className="mt-6 h-12 skeleton-premium rounded-xl" />
        </div>
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
    <div className="pb-4">
      {/* Compact header - streak and accuracy */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {user && profile?.streak_days && profile.streak_days > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-[11px] font-bold text-orange-500">{profile.streak_days}</span>
            </div>
          )}
          {correctStreak >= 3 && (
            <span className="text-[11px] bg-success/10 text-success px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {correctStreak}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[11px] font-bold",
            accuracy >= 75 ? "bg-success/10 text-success" :
            accuracy >= 60 ? "bg-warning/10 text-warning" :
            accuracy > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          )}>
            {accuracy}%
          </span>
          <span className="text-[10px] text-muted-foreground">accuracy</span>
        </div>
      </div>

      {/* Compact progress bar */}
      <div className="mb-2">
        <ProgressBar 
          current={answeredCount} 
          total={totalQuestions}
          className="h-0.5 rounded-full"
        />
      </div>

      {/* Free questions remaining - more compact */}
      {remaining > 0 && remaining <= 5 && (
        <div className="mb-2 py-1.5 px-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
          <p className="text-[11px] text-foreground font-medium">
            {remaining} free question{remaining !== 1 ? 's' : ''} left
          </p>
        </div>
      )}

      <QuestionCard
        question={currentQuestion}
        questionNumber={prioritizedQuestions.findIndex(q => q.id === currentQuestionId) + 1}
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