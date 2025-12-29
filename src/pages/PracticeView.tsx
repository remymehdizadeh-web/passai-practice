import { useState, useMemo } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { PaywallModal } from '@/components/PaywallModal';
import { ProgressBar } from '@/components/ProgressBar';
import { useQuestions, useBookmarks, useToggleBookmark, useRecordProgress, useUserProgress } from '@/hooks/useQuestions';
import { incrementQuestionsAnswered, shouldShowPaywall, getRemainingFreeQuestions, getSessionId } from '@/lib/session';
import { Loader2 } from 'lucide-react';

export function PracticeView() {
  const { data: questions, isLoading } = useQuestions();
  const { data: bookmarks } = useBookmarks();
  const { data: progress } = useUserProgress();
  const toggleBookmark = useToggleBookmark();
  const recordProgress = useRecordProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Get prioritized questions based on weak categories
  const prioritizedQuestions = useMemo(() => {
    if (!questions || !progress) return questions || [];
    
    // Calculate category weakness
    const categoryStats: Record<string, { correct: number; total: number }> = {};
    progress.forEach((p) => {
      const q = questions.find((q) => q.id === p.question_id);
      if (q) {
        if (!categoryStats[q.category]) {
          categoryStats[q.category] = { correct: 0, total: 0 };
        }
        categoryStats[q.category].total++;
        if (p.is_correct) categoryStats[q.category].correct++;
      }
    });

    // Calculate weakness scores (lower = weaker)
    const weaknessScores: Record<string, number> = {};
    Object.entries(categoryStats).forEach(([category, stats]) => {
      weaknessScores[category] = stats.total > 0 ? stats.correct / stats.total : 0.5;
    });

    // Sort questions: unanswered first, then by weakness
    const answeredIds = new Set(progress.map((p) => p.question_id));
    
    return [...questions].sort((a, b) => {
      const aAnswered = answeredIds.has(a.id);
      const bAnswered = answeredIds.has(b.id);
      
      // Unanswered questions first
      if (!aAnswered && bAnswered) return -1;
      if (aAnswered && !bAnswered) return 1;
      
      // Then sort by weakness (weaker categories first)
      const aScore = weaknessScores[a.category] ?? 0.5;
      const bScore = weaknessScores[b.category] ?? 0.5;
      return aScore - bScore;
    });
  }, [questions, progress]);

  const currentQuestion = prioritizedQuestions?.[currentIndex];
  const sessionId = getSessionId();

  const isBookmarked = bookmarks?.some(
    (b) => b.question_id === currentQuestion?.id
  ) ?? false;

  const handleSubmit = async (label: string) => {
    if (!currentQuestion) return;

    const isCorrect = label === currentQuestion.correct_label;
    setSelectedLabel(label);
    setIsSubmitted(true);

    // Record progress
    await recordProgress.mutateAsync({
      questionId: currentQuestion.id,
      selectedLabel: label,
      isCorrect,
    });

    // Increment questions answered counter
    incrementQuestionsAnswered();
  };

  const handleNext = () => {
    // Check if paywall should be shown
    if (shouldShowPaywall()) {
      setShowPaywall(true);
      return;
    }

    // Move to next question
    if (currentIndex < (prioritizedQuestions?.length || 0) - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Loop back to beginning for MVP
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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center p-6">
        <div>
          <p className="text-muted-foreground">No questions available.</p>
        </div>
      </div>
    );
  }

  const remaining = getRemainingFreeQuestions();
  const totalQuestions = prioritizedQuestions?.length || 0;

  return (
    <div className="pb-6">
      {/* Header section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Practice</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Progress</p>
          <p className="text-sm font-medium text-foreground">
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <ProgressBar 
          current={currentIndex + 1} 
          total={totalQuestions}
          className="h-1.5 rounded-full"
        />
      </div>

      {/* Free questions remaining indicator */}
      {remaining > 0 && remaining <= 5 && (
        <div className="mb-5 p-3 rounded-xl bg-muted/50 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            {remaining} free question{remaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}

      <QuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={totalQuestions}
        isBookmarked={isBookmarked}
        onSubmit={handleSubmit}
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
