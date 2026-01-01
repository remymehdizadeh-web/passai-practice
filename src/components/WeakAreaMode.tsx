import { useState, useMemo } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { ConfidenceSlider } from '@/components/ConfidenceSlider';
import { useQuestions, useBookmarks, useToggleBookmark, useRecordProgress, useUserProgress } from '@/hooks/useQuestions';
import { Target, X, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@/types/question';

interface WeakAreaModeProps {
  onClose: () => void;
}

import { NCLEX_CATEGORIES } from '@/lib/categories';

export function WeakAreaMode({ onClose }: WeakAreaModeProps) {
  const { data: questions, isLoading } = useQuestions();
  const { data: bookmarks } = useBookmarks();
  const { data: progress } = useUserProgress();
  const toggleBookmark = useToggleBookmark();
  const recordProgress = useRecordProgress();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high' | null>(null);
  const [showConfidence, setShowConfidence] = useState(false);

  // Calculate weak areas using NCLEX categories for analytics
  const weakAreas = useMemo(() => {
    if (!questions || !progress || progress.length < 3) return [];
    
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

    return NCLEX_CATEGORIES
      .map(category => {
        const stats = nclexCategoryStats[category];
        const accuracy = stats && stats.total >= 3 
          ? Math.round((stats.correct / stats.total) * 100) 
          : null;
        return {
          category,
          accuracy,
          total: stats?.total || 0,
          correct: stats?.correct || 0,
        };
      })
      .filter(c => c.accuracy !== null && c.accuracy < 70)
      .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0));
  }, [questions, progress]);

  // Get questions for selected NCLEX category
  const categoryQuestions = useMemo(() => {
    if (!questions || !selectedCategory) return [];
    
    const answeredIds = new Set(progress?.map(p => p.question_id) || []);
    return questions
      .filter(q => (q.nclex_category || q.category) === selectedCategory)
      .sort((a, b) => {
        // Prioritize unanswered
        const aAnswered = answeredIds.has(a.id);
        const bAnswered = answeredIds.has(b.id);
        if (!aAnswered && bAnswered) return -1;
        if (aAnswered && !bAnswered) return 1;
        return 0;
      });
  }, [questions, selectedCategory, progress]);

  const currentQuestion = categoryQuestions[currentIndex];
  const isBookmarked = bookmarks?.some(b => b.question_id === currentQuestion?.id) ?? false;

  const handleSelectAnswer = (label: string) => {
    setSelectedLabel(label);
    setShowConfidence(true);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !selectedLabel) return;

    const isCorrect = selectedLabel === currentQuestion.correct_label;
    setIsSubmitted(true);
    setShowConfidence(false);

    await recordProgress.mutateAsync({
      questionId: currentQuestion.id,
      selectedLabel: selectedLabel,
      isCorrect,
      confidence,
    });
  };

  const handleNext = () => {
    if (currentIndex < categoryQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // Session complete
      setSelectedCategory(null);
      setCurrentIndex(0);
    }
    setIsSubmitted(false);
    setSelectedLabel(null);
    setConfidence(null);
    setShowConfidence(false);
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

  // Category selection view
  if (!selectedCategory) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="max-w-lg mx-auto px-4 py-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Weak Area Focus</h1>
              <p className="text-sm text-muted-foreground">Target your struggling topics</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {weakAreas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">No Weak Areas Detected</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Great job! Keep practicing to maintain your strong performance across all categories.
              </p>
              <button onClick={onClose} className="btn-premium px-6 py-3">
                Continue Practicing
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                You're scoring below 70% in these areas. Focus here to improve your overall score.
              </p>
              
              {weakAreas.map((area) => (
                <button
                  key={area.category}
                  onClick={() => setSelectedCategory(area.category)}
                  className="w-full card-organic p-4 flex items-center gap-4 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-foreground truncate">{area.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {area.correct}/{area.total} correct
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-xl font-bold",
                      area.accuracy! < 50 ? "text-destructive" : "text-warning"
                    )}>
                      {area.accuracy}%
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Practice mode for selected category
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No more questions in this category.</p>
          <button onClick={() => setSelectedCategory(null)} className="btn-premium px-6 py-3">
            Choose Another Topic
          </button>
        </div>
      </div>
    );
  }

  const selectedArea = weakAreas.find(a => a.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-amber-500 font-medium uppercase tracking-wide">Weak Area Focus</p>
            <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{selectedCategory}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-bold",
              (selectedArea?.accuracy || 0) < 50 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
            )}>
              {selectedArea?.accuracy}%
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
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

        {showConfidence && !isSubmitted && selectedLabel && (
          <div className="mt-4 card-organic p-4 animate-fade-in">
            <ConfidenceSlider value={confidence} onChange={setConfidence} />
            <button onClick={handleSubmit} className="w-full mt-4 btn-premium py-3">
              Submit Answer
            </button>
          </div>
        )}

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
