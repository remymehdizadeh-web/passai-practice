import { useState, useMemo, useEffect } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { ReportModal } from '@/components/ReportModal';
import { PaywallModal } from '@/components/PaywallModal';
import { ProgressBar } from '@/components/ProgressBar';
import { StudyHeader } from '@/components/StudyHeader';
import { ExamDateModal } from '@/components/ExamDateModal';
import { PointsDisplay } from '@/components/PointsDisplay';
import { useQuestions, useBookmarks, useToggleBookmark, useRecordProgress, useUserProgress } from '@/hooks/useQuestions';
import { useProfile, useUpdateStreak } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { incrementQuestionsAnswered, shouldShowPaywall, getRemainingFreeQuestions } from '@/lib/session';
import { getPoints, addPoints, getCorrectStreak, incrementStreak, resetStreak, calculatePointsEarned, startAnswerTimer } from '@/lib/points';
import { Loader2 } from 'lucide-react';

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
  const [showExamDate, setShowExamDate] = useState(false);
  const [hasUpdatedStreak, setHasUpdatedStreak] = useState(false);
  const [totalPoints, setTotalPoints] = useState(getPoints());
  const [currentStreak, setCurrentStreak] = useState(getCorrectStreak());
  const [lastPointsEarned, setLastPointsEarned] = useState({ base: 0, timeBonus: 0, streakBonus: 0, total: 0, answerTime: 0 });

  // Update streak when user answers first question of the day
  useEffect(() => {
    if (user && isSubmitted && !hasUpdatedStreak) {
      updateStreak.mutate();
      setHasUpdatedStreak(true);
    }
  }, [user, isSubmitted, hasUpdatedStreak, updateStreak]);

  // Start timer when a new question loads
  useEffect(() => {
    if (!isSubmitted) {
      startAnswerTimer();
    }
  }, [currentIndex, isSubmitted]);

  // Get prioritized questions based on weak categories
  const prioritizedQuestions = useMemo(() => {
    if (!questions || !progress) return questions || [];
    
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

    const weaknessScores: Record<string, number> = {};
    Object.entries(categoryStats).forEach(([category, stats]) => {
      weaknessScores[category] = stats.total > 0 ? stats.correct / stats.total : 0.5;
    });

    const answeredIds = new Set(progress.map((p) => p.question_id));
    
    return [...questions].sort((a, b) => {
      const aAnswered = answeredIds.has(a.id);
      const bAnswered = answeredIds.has(b.id);
      
      if (!aAnswered && bAnswered) return -1;
      if (aAnswered && !bAnswered) return 1;
      
      const aScore = weaknessScores[a.category] ?? 0.5;
      const bScore = weaknessScores[b.category] ?? 0.5;
      return aScore - bScore;
    });
  }, [questions, progress]);

  const currentQuestion = prioritizedQuestions?.[currentIndex];

  const isBookmarked = bookmarks?.some(
    (b) => b.question_id === currentQuestion?.id
  ) ?? false;

  const handleSubmit = async (label: string) => {
    if (!currentQuestion) return;

    const isCorrect = label === currentQuestion.correct_label;
    setSelectedLabel(label);
    setIsSubmitted(true);

    // Handle points and streak
    if (isCorrect) {
      const newStreak = incrementStreak();
      setCurrentStreak(newStreak);
      const pointsInfo = calculatePointsEarned(newStreak);
      setLastPointsEarned(pointsInfo);
      const newTotal = addPoints(pointsInfo.total);
      setTotalPoints(newTotal);
    } else {
      resetStreak();
      setCurrentStreak(0);
      setLastPointsEarned({ base: 0, timeBonus: 0, streakBonus: 0, total: 0, answerTime: 0 });
    }

    await recordProgress.mutateAsync({
      questionId: currentQuestion.id,
      selectedLabel: label,
      isCorrect,
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
  const overallProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="pb-6">
      {/* Header with points and streak/exam countdown */}
      <div className="flex items-center justify-between mb-4">
        {user ? (
          <StudyHeader onExamDateClick={() => setShowExamDate(true)} />
        ) : (
          <PointsDisplay points={totalPoints} />
        )}
        {user && <PointsDisplay points={totalPoints} />}
      </div>

      {/* Progress section */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {totalQuestions}
        </p>
        <div className="flex items-center gap-2">
          {currentStreak >= 3 && (
            <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-medium">
              🔥 {currentStreak} streak
            </span>
          )}
          <span className="text-sm font-medium text-foreground">{overallProgress}%</span>
        </div>
      </div>

      <div className="mb-5">
        <ProgressBar 
          current={answeredCount} 
          total={totalQuestions}
          className="h-1.5 rounded-full"
        />
      </div>

      {/* Free questions remaining */}
      {remaining > 0 && remaining <= 5 && (
        <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
          <p className="text-sm text-primary font-medium">
            {remaining} free question{remaining !== 1 ? 's' : ''} left
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
          pointsEarned={lastPointsEarned.base}
          streak={currentStreak}
          timeBonus={lastPointsEarned.timeBonus}
          streakBonus={lastPointsEarned.streakBonus}
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

      <ExamDateModal
        isOpen={showExamDate}
        onClose={() => setShowExamDate(false)}
        currentDate={profile?.exam_date}
      />
    </div>
  );
}