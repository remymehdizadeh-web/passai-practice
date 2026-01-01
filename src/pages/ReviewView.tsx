import { useState, useEffect, useMemo } from 'react';
import { useBookmarks, useMissedQuestions, useToggleBookmark, useReviewQueue, useUpdateReviewQueue, useRecordProgress, useQuestions, useUserProgress } from '@/hooks/useQuestions';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { PaywallModal } from '@/components/PaywallModal';
import { Bookmark, XCircle, ChevronLeft, ChevronRight, Loader2, Clock, AlertTriangle, Zap, Shield, Pill, Heart, Brain, Activity, Users, Stethoscope, Sparkles, Lock } from 'lucide-react';
import type { Question } from '@/types/question';
import { cn } from '@/lib/utils';
import { NCLEX_CATEGORIES, NCLEX_SHORT_NAMES, type NclexCategory } from '@/lib/categories';
import { useNavigate } from 'react-router-dom';

type FilterType = 'due' | 'bookmarked' | 'missed';

interface ReviewViewProps {
  initialFilter?: 'bookmarked' | 'missed';
}

// Icon mapping for NCLEX categories
const CATEGORY_ICONS: Record<NclexCategory, React.ElementType> = {
  'Management of Care': Users,
  'Safety and Infection Control': Shield,
  'Health Promotion and Maintenance': Heart,
  'Psychosocial Integrity': Brain,
  'Basic Care and Comfort': Stethoscope,
  'Pharmacological and Parenteral Therapies': Pill,
  'Reduction of Risk Potential': AlertTriangle,
  'Physiological Adaptation': Activity,
};

export function ReviewView({ initialFilter = 'bookmarked' }: ReviewViewProps) {
  const { data: bookmarks, isLoading: loadingBookmarks } = useBookmarks();
  const { data: missedQuestions, isLoading: loadingMissed } = useMissedQuestions();
  const { data: reviewQueue, isLoading: loadingQueue } = useReviewQueue();
  const { data: questions } = useQuestions();
  const { data: progress } = useUserProgress();
  const toggleBookmark = useToggleBookmark();
  const updateReviewQueue = useUpdateReviewQueue();
  const recordProgress = useRecordProgress();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterType>(initialFilter === 'missed' ? 'missed' : 'due');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showReport, setShowReport] = useState(false);

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

  // Calculate focus areas (weak categories)
  const focusAreas = useMemo(() => {
    if (!progress || !questions) return [];

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

    const categoryMastery = NCLEX_CATEGORIES.map(category => {
      const stats = nclexCategoryStats[category];
      return {
        category,
        shortName: NCLEX_SHORT_NAMES[category as NclexCategory] || category,
        accuracy: stats ? Math.round((stats.correct / stats.total) * 100) : 0,
        total: stats?.total || 0,
        icon: CATEGORY_ICONS[category as NclexCategory],
      };
    }).filter(c => c.total >= 3);

    return categoryMastery
      .filter(c => c.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
  }, [questions, progress]);

  const isBookmarked = (questionId: string) => 
    bookmarks?.some((b) => b.question_id === questionId) ?? false;

  const handleSelectAnswer = async (label: string) => {
    if (!selectedQuestion) return;
    setSelectedLabel(label);
    
    const isCorrect = label === selectedQuestion.correct_label;
    setIsSubmitted(true);

    await recordProgress.mutateAsync({
      questionId: selectedQuestion.id,
      selectedLabel: label,
      isCorrect,
      confidence: null,
    });

    await updateReviewQueue.mutateAsync({
      questionId: selectedQuestion.id,
      isCorrect,
      confidence: null,
    });
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

  const handleCategoryTap = (category: string) => {
    navigate('/', { state: { tab: 'practice', category } });
  };

  const handleStartReview = () => {
    if (displayedQuestions.length > 0) {
      setSelectedQuestion(displayedQuestions[0]);
    }
  };

  const handleSmartReview = () => {
    // Smart Review is a Pro feature
    setShowPaywall(true);
  };

  // Counts
  const dueCount = dueQuestions.length;
  const missedCount = missedQuestions?.length || 0;
  const savedCount = bookmarkedQuestions.length;
  const totalReviewable = dueCount + missedCount;

  // Detail view for a selected question
  if (selectedQuestion) {
    const currentIndex = displayedQuestions.findIndex(q => q.id === selectedQuestion.id);
    return (
      <div className="pb-6">
        <button
          onClick={() => setSelectedQuestion(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to review
        </button>

        <div className="text-xs text-muted-foreground mb-3 text-center">
          Question {currentIndex + 1} of {displayedQuestions.length}
        </div>

        <QuestionCard
          question={selectedQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={displayedQuestions.length}
          isBookmarked={isBookmarked(selectedQuestion.id)}
          onSubmit={handleSelectAnswer}
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
    <div className="pb-24 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Review</h1>
        <p className="text-sm text-muted-foreground">Master your focus areas</p>
      </div>

      {/* Review Status Bar */}
      <div className="bg-card border border-border rounded-xl p-1">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setFilter('due')}
            className={cn(
              "flex flex-col items-center py-3 px-2 rounded-lg transition-all duration-200",
              filter === 'due' 
                ? "bg-warning/15 border-b-2 border-warning" 
                : "hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className={cn("w-4 h-4", filter === 'due' ? "text-warning" : "text-muted-foreground")} />
              <span className={cn(
                "text-lg font-bold",
                filter === 'due' ? "text-warning" : "text-foreground"
              )}>
                {dueCount}
              </span>
            </div>
            <span className={cn(
              "text-[10px] uppercase tracking-wide font-medium",
              filter === 'due' ? "text-warning" : "text-muted-foreground"
            )}>
              Due Now
            </span>
          </button>

          <button
            onClick={() => setFilter('missed')}
            className={cn(
              "flex flex-col items-center py-3 px-2 rounded-lg transition-all duration-200",
              filter === 'missed' 
                ? "bg-destructive/15 border-b-2 border-destructive" 
                : "hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <XCircle className={cn("w-4 h-4", filter === 'missed' ? "text-destructive" : "text-muted-foreground")} />
              <span className={cn(
                "text-lg font-bold",
                filter === 'missed' ? "text-destructive" : "text-foreground"
              )}>
                {missedCount}
              </span>
            </div>
            <span className={cn(
              "text-[10px] uppercase tracking-wide font-medium",
              filter === 'missed' ? "text-destructive" : "text-muted-foreground"
            )}>
              Needs Review
            </span>
          </button>

          <button
            onClick={() => setFilter('bookmarked')}
            className={cn(
              "flex flex-col items-center py-3 px-2 rounded-lg transition-all duration-200",
              filter === 'bookmarked' 
                ? "bg-primary/15 border-b-2 border-primary" 
                : "hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Bookmark className={cn("w-4 h-4", filter === 'bookmarked' ? "text-primary fill-current" : "text-muted-foreground")} />
              <span className={cn(
                "text-lg font-bold",
                filter === 'bookmarked' ? "text-primary" : "text-foreground"
              )}>
                {savedCount}
              </span>
            </div>
            <span className={cn(
              "text-[10px] uppercase tracking-wide font-medium",
              filter === 'bookmarked' ? "text-primary" : "text-muted-foreground"
            )}>
              Saved
            </span>
          </button>
        </div>
      </div>

      {/* Smart Review Session Card - Pro Feature */}
      {totalReviewable > 0 && (
        <button
          onClick={handleSmartReview}
          className="w-full bg-gradient-to-r from-warning/20 via-accent/20 to-warning/20 border border-warning/30 rounded-xl p-4 hover:shadow-lg transition-all duration-200 group relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-accent flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform relative">
              <Zap className="w-6 h-6 text-white" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                <Lock className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">Smart Review Session</p>
                <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded">
                  PRO
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Spaced repetition + targeted practice from focus areas
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-warning group-hover:rotate-12 transition-transform" />
          </div>
        </button>
      )}

      {/* Paywall Modal */}
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Focus Areas Card */}
      {focusAreas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h2 className="text-sm font-semibold text-foreground">Focus Areas</h2>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Below 70% mastery</span>
          </div>
          
          <div className="bg-destructive/5 border border-destructive/15 rounded-xl overflow-hidden">
            <div className="divide-y divide-destructive/10">
              {focusAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <button
                    key={area.category}
                    onClick={() => handleCategoryTap(area.category)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-destructive/5 active:bg-destructive/10 transition-all duration-200 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-foreground truncate">
                        {area.shortName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-destructive to-warning rounded-full"
                          style={{ width: `${area.accuracy}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-xs font-bold w-8 text-right",
                        area.accuracy < 50 ? "text-destructive" : "text-warning"
                      )}>
                        {area.accuracy}%
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Question List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground">
            {filter === 'due' ? 'Due for Review' : filter === 'missed' ? 'Needs Review' : 'Saved Questions'}
          </h2>
          <span className="text-xs text-muted-foreground">{displayedQuestions.length} questions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : displayedQuestions.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              {filter === 'bookmarked' ? (
                <Bookmark className="w-6 h-6 text-muted-foreground" />
              ) : filter === 'missed' ? (
                <XCircle className="w-6 h-6 text-muted-foreground" />
              ) : (
                <Clock className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {filter === 'bookmarked'
                ? 'No saved questions yet'
                : filter === 'missed'
                ? 'No questions need review'
                : 'All caught up!'}
            </p>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
              {filter === 'bookmarked'
                ? 'Tap the bookmark icon while practicing to save questions'
                : filter === 'missed'
                ? 'Questions you miss will appear here for targeted practice'
                : 'Great job! Check back later for spaced repetition'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedQuestions.map((question, index) => {
              const queueItem = reviewQueue?.find(q => q.question_id === question.id);
              const borderColor = filter === 'due' 
                ? 'border-l-warning' 
                : filter === 'missed' 
                ? 'border-l-destructive' 
                : 'border-l-primary';
              const statusText = queueItem?.reason === 'incorrect' 
                ? 'Needs review' 
                : queueItem?.reason === 'low_confidence' 
                ? 'Low confidence' 
                : filter === 'due'
                ? `Review #${(queueItem?.review_count || 0) + 1}`
                : null;

              return (
                <button
                  key={question.id}
                  onClick={() => setSelectedQuestion(question)}
                  className={cn(
                    "w-full text-left bg-card border border-border rounded-lg p-3 border-l-4 hover:shadow-md transition-all duration-200 active:scale-[0.99]",
                    borderColor
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-1 mb-1.5 font-medium">
                        {question.stem.slice(0, 70)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase font-medium">
                            {NCLEX_SHORT_NAMES[question.nclex_category as NclexCategory] || question.category}
                          </span>
                          {statusText && (
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-medium",
                              queueItem?.reason === 'incorrect' ? "bg-destructive/10 text-destructive" :
                              queueItem?.reason === 'low_confidence' ? "bg-warning/10 text-warning" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {statusText}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating CTA */}
      {displayedQuestions.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-10">
          <button
            onClick={handleStartReview}
            className="w-full bg-gradient-to-r from-accent to-destructive text-white rounded-xl py-4 px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Start Review Session</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                {displayedQuestions.length}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
