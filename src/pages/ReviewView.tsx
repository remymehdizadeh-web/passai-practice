import { useState } from 'react';
import { useBookmarks, useMissedQuestions, useToggleBookmark } from '@/hooks/useQuestions';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { Button } from '@/components/ui/button';
import { Bookmark, XCircle, ChevronLeft, Loader2 } from 'lucide-react';
import type { Question } from '@/types/question';
import { cn } from '@/lib/utils';

type FilterType = 'bookmarked' | 'missed';

export function ReviewView() {
  const { data: bookmarks, isLoading: loadingBookmarks } = useBookmarks();
  const { data: missedQuestions, isLoading: loadingMissed } = useMissedQuestions();
  const toggleBookmark = useToggleBookmark();

  const [filter, setFilter] = useState<FilterType>('bookmarked');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const isLoading = loadingBookmarks || loadingMissed;

  // Extract bookmarked questions with proper type handling
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
      <div className="pb-24">
        <button
          onClick={() => setSelectedQuestion(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
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
    <div className="pb-24">
      {/* Header Bento Cell */}
      <div className="bento-cell mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Review</h1>
        <p className="text-muted-foreground text-sm">
          Practice questions you've saved or missed
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'bookmarked' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('bookmarked')}
          className="gap-2 rounded-xl"
        >
          <Bookmark className="w-4 h-4" />
          Bookmarked ({bookmarkedQuestions.length})
        </Button>
        <Button
          variant={filter === 'missed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('missed')}
          className="gap-2 rounded-xl"
        >
          <XCircle className="w-4 h-4" />
          Missed ({missedQuestions?.length || 0})
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : displayedQuestions.length === 0 ? (
        <div className="bento-cell text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            {filter === 'bookmarked' ? (
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            ) : (
              <XCircle className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <p className="text-foreground font-medium mb-1">
            {filter === 'bookmarked'
              ? 'No bookmarked questions yet'
              : 'No missed questions yet'}
          </p>
          <p className="text-muted-foreground text-sm">
            {filter === 'bookmarked'
              ? 'Tap the bookmark icon on any question to save it'
              : 'Questions you answer incorrectly will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedQuestions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => setSelectedQuestion(question)}
              className="w-full text-left bento-cell hover:shadow-glass transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium line-clamp-2 text-sm text-option">
                    {question.stem}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-muted/50 text-muted-foreground px-2.5 py-1 rounded-full">
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
