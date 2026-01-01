import { useState, useMemo } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { useQuestions, useBookmarks, useToggleBookmark, useRecordProgress, useUserProgress } from '@/hooks/useQuestions';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@/types/question';

interface WeakAreaModeProps {
  onClose: () => void;
}

export function WeakAreaMode({ onClose }: WeakAreaModeProps) {
  const { data: questions, isLoading } = useQuestions();
  const { data: bookmarks } = useBookmarks();
  const { data: progress } = useUserProgress();
  const toggleBookmark = useToggleBookmark();
  const recordProgress = useRecordProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Calculate weakest category using NCLEX categories
  const weakestCategory = useMemo(() => {
    if (!questions || !progress || progress.length < 3) return null;
    
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

    let weakest: { category: string; accuracy: number; total: number; correct: number } | null = null;
    
    for (const [category, stats] of Object.entries(nclexCategoryStats)) {
      if (stats.total >= 3) {
        const accuracy = Math.round((stats.correct / stats.total) * 100);
        if (accuracy < 70 && (!weakest || accuracy < weakest.accuracy)) {
          weakest = { category, accuracy, total: stats.total, correct: stats.correct };
        }
      }
    }
    
    return weakest;
  }, [questions, progress]);

  // Get questions for the weakest category
  const categoryQuestions = useMemo(() => {
    if (!questions || !weakestCategory) return [];
    
    const answeredIds = new Set(progress?.map(p => p.question_id) || []);
    return questions
      .filter(q => (q.nclex_category || q.category) === weakestCategory.category)
      .sort((a, b) => {
        // Prioritize unanswered
        const aAnswered = answeredIds.has(a.id);
        const bAnswered = answeredIds.has(b.id);
        if (!aAnswered && bAnswered) return -1;
        if (aAnswered && !bAnswered) return 1;
        return 0;
      });
  }, [questions, weakestCategory, progress]);

  const currentQuestion = categoryQuestions[currentIndex];
  const isBookmarked = bookmarks?.some(b => b.question_id === currentQuestion?.id) ?? false;

  const handleSelectAnswer = async (label: string) => {
    if (!currentQuestion) return;
    
    setSelectedLabel(label);
    const isCorrect = label === currentQuestion.correct_label;
    setIsSubmitted(true);

    await recordProgress.mutateAsync({
      questionId: currentQuestion.id,
      selectedLabel: label,
      isCorrect,
      confidence: null,
    });
  };

  const handleNext = () => {
    if (currentIndex < categoryQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // Session complete
      onClose();
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

  // No weak areas - show success message
  if (!weakestCategory) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No Weak Areas!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You're doing great across all categories. Keep practicing to maintain your performance.
          </p>
          <button onClick={onClose} className="btn-premium px-6 py-3">
            Continue Practicing
          </button>
        </div>
      </div>
    );
  }

  // No more questions in category
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Session complete!</p>
          <button onClick={onClose} className="btn-premium px-6 py-3">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-amber-500 font-medium uppercase tracking-wide">Focus Area</p>
            <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{weakestCategory.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-bold",
              weakestCategory.accuracy < 50 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
            )}>
              {weakestCategory.accuracy}%
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {categoryQuestions.length}
          </p>
        </div>

        <div className="mb-4 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / categoryQuestions.length) * 100}%` }}
          />
        </div>

        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={categoryQuestions.length}
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
      </div>
    </div>
  );
}
