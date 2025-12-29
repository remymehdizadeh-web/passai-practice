import { useState, useEffect } from 'react';
import { useBookmarks, useMissedQuestions, useToggleBookmark } from '@/hooks/useQuestions';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { Bookmark, XCircle, ChevronLeft, Loader2 } from 'lucide-react';
import type { Question } from '@/types/question';
import { cn } from '@/lib/utils';

type FilterType = 'bookmarked' | 'missed';

interface ReviewViewProps {
  initialFilter?: 'bookmarked' | 'missed';
}

export function ReviewView({ initialFilter = 'bookmarked' }: ReviewViewProps) {
  const { data: bookmarks, isLoading: loadingBookmarks } = useBookmarks();
  const { data: missedQuestions, isLoading: loadingMissed } = useMissedQuestions();
  const toggleBookmark = useToggleBookmark();

  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (initialFilter === 'bookmarked' || initialFilter === 'missed') {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  const isLoading = loadingBookmarks || loadingMissed;

  const bookmarkedQuestions: Question[] = (bookmarks || [])
    .filter((b): b is typeof b & { questions: Question } => b.questions !== null)
    .map((b) => b.questions as unknown as Question);

  const displayedQuestions = filter === 'bookmarked' 
    ? bookmarkedQuestions 
    : (missedQuestions || []);

  const isBookmarked = (questionId: string) => 
    bookmarks?.some((b) => b.question_id === questionId) ?? false;

  const handleSubmit = (label: string) => {
    setSelectedLabel(label);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    setSelectedQuestion(null);
    setIsSubmitted(false);
    setSelectedLabel(null);
  };

  const handleBookmark = async (questionId: string) => {
    const bookmarked = isBookmarked(questionId);
    await toggleBookmark.mutateAsync({ questionId, isBookmarked: bookmarked });
  };

  // Detail view for a selected question
  if (selectedQuestion) {
    return (
      <div className="pb-6">
        <button
          onClick={() => setSelectedQuestion(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to list
        </button>

        <QuestionCard
          question={selectedQuestion}
          questionNumber={1}
          totalQuestions={displayedQuestions.length}
          isBookmarked={isBookmarked(selectedQuestion.id)}
          onSubmit={handleSubmit}
          onBookmark={() => handleBookmark(selectedQuestion.id)}
          onReport={() => setShowReport(true)}
          isSubmitted={isSubmitted}
          selectedLabel={selectedLabel}
        />

        {isSubmitted && selectedLabel && (
          <ExplanationPanel
            question={selectedQuestion}
            selectedLabel={selectedLabel}
            onNext={handleNext}
          />
        )}

        <ReportModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          questionId={selectedQuestion.id}
        />
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-foreground">Review</h1>
        <p className="text-sm text-muted-foreground">Review saved and missed questions</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('bookmarked')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            filter === 'bookmarked'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          <Bookmark className={cn("w-4 h-4", filter === 'bookmarked' && "fill-current")} />
          <span>Saved</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-xs font-semibold",
            filter === 'bookmarked' ? "bg-primary-foreground/20" : "bg-muted"
          )}>
            {bookmarkedQuestions.length}
          </span>
        </button>
        <button
          onClick={() => setFilter('missed')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            filter === 'missed'
              ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          <XCircle className="w-4 h-4" />
          <span>Missed</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-xs font-semibold",
            filter === 'missed' ? "bg-destructive-foreground/20" : "bg-muted"
          )}>
            {missedQuestions?.length || 0}
          </span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      ) : displayedQuestions.length === 0 ? (
        <div className="card-organic p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            {filter === 'bookmarked' ? (
              <Bookmark className="w-7 h-7 text-muted-foreground" />
            ) : (
              <XCircle className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <p className="text-base font-medium text-foreground mb-1">
            {filter === 'bookmarked'
              ? 'No saved questions yet'
              : 'No missed questions'}
          </p>
          <p className="text-sm text-muted-foreground">
            {filter === 'bookmarked'
              ? 'Tap the bookmark icon while practicing to save questions for later'
              : 'Questions you answer incorrectly will appear here for review'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedQuestions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => setSelectedQuestion(question)}
              className="w-full text-left card-organic p-4 hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2 mb-2 leading-relaxed">
                    {question.stem}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                      {question.category}
                    </span>
                    {isBookmarked(question.id) && (
                      <Bookmark className="w-3.5 h-3.5 text-primary fill-current" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
