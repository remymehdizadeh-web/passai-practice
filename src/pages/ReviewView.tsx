import { useState, useEffect } from 'react';
import { useBookmarks, useMissedQuestions, useToggleBookmark, useReviewQueue, useUpdateReviewQueue, useRecordProgress } from '@/hooks/useQuestions';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { ConfidenceSlider } from '@/components/ConfidenceSlider';
import { Bookmark, XCircle, ChevronLeft, Loader2, Clock, AlertTriangle, Zap } from 'lucide-react';
import type { Question } from '@/types/question';
import { cn } from '@/lib/utils';

type FilterType = 'due' | 'bookmarked' | 'missed';

interface ReviewViewProps {
  initialFilter?: 'bookmarked' | 'missed';
}

export function ReviewView({ initialFilter = 'bookmarked' }: ReviewViewProps) {
  const { data: bookmarks, isLoading: loadingBookmarks } = useBookmarks();
  const { data: missedQuestions, isLoading: loadingMissed } = useMissedQuestions();
  const { data: reviewQueue, isLoading: loadingQueue } = useReviewQueue();
  const toggleBookmark = useToggleBookmark();
  const updateReviewQueue = useUpdateReviewQueue();
  const recordProgress = useRecordProgress();

  const [filter, setFilter] = useState<FilterType>(initialFilter === 'missed' ? 'missed' : 'due');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high' | null>(null);
  const [showConfidence, setShowConfidence] = useState(false);

  useEffect(() => {
    if (initialFilter === 'bookmarked') {
      setFilter('bookmarked');
    } else if (initialFilter === 'missed') {
      setFilter('missed');
    }
  }, [initialFilter]);

  // Auto-switch to due if there are items
  useEffect(() => {
    if (reviewQueue && reviewQueue.length > 0 && !initialFilter) {
      setFilter('due');
    }
  }, [reviewQueue, initialFilter]);

  const isLoading = loadingBookmarks || loadingMissed || loadingQueue;

  const bookmarkedQuestions: Question[] = (bookmarks || [])
    .filter((b): b is typeof b & { questions: Question } => b.questions !== null)
    .map((b) => b.questions as unknown as Question);

  const dueQuestions: Question[] = (reviewQueue || [])
    .filter(item => item.question)
    .map(item => item.question as Question);

  const displayedQuestions = filter === 'bookmarked' 
    ? bookmarkedQuestions 
    : filter === 'missed'
    ? (missedQuestions || [])
    : dueQuestions;

  const isBookmarked = (questionId: string) => 
    bookmarks?.some((b) => b.question_id === questionId) ?? false;

  const handleSelectAnswer = (label: string) => {
    setSelectedLabel(label);
    setShowConfidence(true);
  };

  const handleSubmit = async () => {
    if (!selectedQuestion || !selectedLabel) return;

    const isCorrect = selectedLabel === selectedQuestion.correct_label;
    setIsSubmitted(true);
    setShowConfidence(false);

    // Record progress with confidence
    await recordProgress.mutateAsync({
      questionId: selectedQuestion.id,
      selectedLabel,
      isCorrect,
      confidence,
    });

    // Update spaced repetition
    await updateReviewQueue.mutateAsync({
      questionId: selectedQuestion.id,
      isCorrect,
      confidence,
    });
  };

  const handleNext = () => {
    setSelectedQuestion(null);
    setIsSubmitted(false);
    setSelectedLabel(null);
    setConfidence(null);
    setShowConfidence(false);
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
          onSubmit={handleSelectAnswer}
          onBookmark={() => handleBookmark(selectedQuestion.id)}
          onReport={() => setShowReport(true)}
          isSubmitted={isSubmitted}
          selectedLabel={selectedLabel}
        />

        {/* Confidence slider - shown after selection, before submit */}
        {showConfidence && !isSubmitted && selectedLabel && (
          <div className="mt-4 card-organic p-4 animate-fade-in">
            <ConfidenceSlider 
              value={confidence} 
              onChange={setConfidence}
            />
            <button
              onClick={handleSubmit}
              className="w-full mt-4 btn-premium py-3"
            >
              Submit Answer
            </button>
          </div>
        )}

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

  const dueCount = dueQuestions.length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-foreground">Review</h1>
        <p className="text-sm text-muted-foreground">Strengthen your weak areas</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('due')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
            filter === 'due'
              ? 'bg-warning text-warning-foreground shadow-lg shadow-warning/20'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          <Clock className="w-4 h-4" />
          <span>Due Now</span>
          {dueCount > 0 && (
            <span className={cn(
              "px-1.5 py-0.5 rounded text-xs font-semibold",
              filter === 'due' ? "bg-warning-foreground/20" : "bg-warning/20 text-warning"
            )}>
              {dueCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('missed')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
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
        <button
          onClick={() => setFilter('bookmarked')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
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
      </div>

      {/* Due reminder banner */}
      {filter !== 'due' && dueCount > 0 && (
        <button
          onClick={() => setFilter('due')}
          className="w-full mb-4 p-3 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3 hover:bg-warning/20 transition-colors"
        >
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">{dueCount} questions due for review</p>
            <p className="text-xs text-muted-foreground">Tap to start spaced repetition</p>
          </div>
          <Zap className="w-4 h-4 text-warning" />
        </button>
      )}

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
            ) : filter === 'missed' ? (
              <XCircle className="w-7 h-7 text-muted-foreground" />
            ) : (
              <Clock className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <p className="text-base font-medium text-foreground mb-1">
            {filter === 'bookmarked'
              ? 'No saved questions yet'
              : filter === 'missed'
              ? 'No missed questions'
              : 'No reviews due'}
          </p>
          <p className="text-sm text-muted-foreground">
            {filter === 'bookmarked'
              ? 'Tap the bookmark icon while practicing to save questions for later'
              : filter === 'missed'
              ? 'Questions you answer incorrectly will appear here for review'
              : 'Great job! Check back later for spaced repetition reviews'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedQuestions.map((question, index) => {
            const queueItem = reviewQueue?.find(q => q.question_id === question.id);
            return (
              <button
                key={question.id}
                onClick={() => setSelectedQuestion(question)}
                className="w-full text-left card-organic p-4 hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0",
                    queueItem?.reason === 'incorrect' ? "bg-destructive/10 text-destructive" :
                    queueItem?.reason === 'low_confidence' ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 mb-2 leading-relaxed">
                      {question.stem}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                        {question.category}
                      </span>
                      {queueItem && (
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-md",
                          queueItem.reason === 'incorrect' ? "bg-destructive/10 text-destructive" :
                          queueItem.reason === 'low_confidence' ? "bg-warning/10 text-warning" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {queueItem.reason === 'incorrect' ? 'Incorrect' :
                           queueItem.reason === 'low_confidence' ? 'Low confidence' :
                           `Review #${queueItem.review_count + 1}`}
                        </span>
                      )}
                      {isBookmarked(question.id) && (
                        <Bookmark className="w-3.5 h-3.5 text-primary fill-current" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}