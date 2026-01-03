import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Lightbulb, ChevronRight, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import type { Question } from '@/types/question';
import { AskTutorModal } from '@/components/AskTutorModal';
import { SimilarQuestionCard } from '@/components/SimilarQuestionCard';
import { useSimilarQuestion } from '@/hooks/useSimilarQuestion';

interface ExplanationPanelProps {
  question: Question;
  selectedLabel: string;
  onNext: () => void;
}

// Truncate text to a max word count
function truncateWords(text: string, maxWords: number): string {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

export function ExplanationPanel({ question, selectedLabel, onNext }: ExplanationPanelProps) {
  const isCorrect = selectedLabel === question.correct_label;
  const correctOption = question.options.find(o => o.label === question.correct_label);
  const [showTutor, setShowTutor] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const { isLoading: isGenerating, generatedQuestion, generateSimilar, reset: resetSimilar } = useSimilarQuestion();
  const panelRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // wrong_option_bullets can be an array or object from JSON
  const wrongBullets = question.wrong_option_bullets;
  const wrongExplanation = Array.isArray(wrongBullets) 
    ? wrongBullets.find(w => w.label === selectedLabel)
    : null;

  // Auto-scroll to show explanation panel after submission
  useEffect(() => {
    if (panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus the next button for easy keyboard navigation
        if (nextButtonRef.current) {
          nextButtonRef.current.focus();
        }
      }, 150);
    }
  }, []);

  const handleGenerateSimilar = async () => {
    setShowSimilar(true);
    await generateSimilar(question);
  };

  const handleSimilarComplete = () => {
    setShowSimilar(false);
    resetSimilar();
    onNext();
  };

  // Correct answer - streamlined flow with prominent Next
  if (isCorrect) {
    return (
      <div ref={panelRef} className="animate-fade-in mt-4 space-y-3">
        {/* Success Banner with Big Next Button */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-success/20 via-success/10 to-success/5 border border-success/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-success">Correct! 🎉</p>
              <p className="text-sm text-muted-foreground mt-0.5">{truncateWords(question.takeaway, 15)}</p>
            </div>
          </div>
          
          {/* Big Next Button - thumb zone position */}
          <Button 
            ref={nextButtonRef}
            onClick={onNext} 
            className="w-full btn-premium text-base py-6 min-h-[56px] will-change-transform"
            autoFocus
          >
            Next Question
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {/* Optional: Expand for more details */}
        <details className="group">
          <summary className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>See full explanation</span>
          </summary>
          <div className="mt-2 p-3 rounded-lg bg-muted/30 border border-border space-y-2">
            <p className="text-sm font-medium text-foreground">Why {question.correct_label} is correct:</p>
            <ul className="space-y-1">
              {question.rationale_bullets.slice(0, 2).map((bullet, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                  <span>{truncateWords(bullet, 25)}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>

        {/* Secondary actions - touch friendly */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowTutor(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground active:scale-[0.98] will-change-transform"
          >
            <Sparkles className="w-4 h-4" />
            Ask Tutor
          </button>
          <button
            onClick={handleGenerateSimilar}
            disabled={isGenerating || showSimilar}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 active:scale-[0.98] will-change-transform"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Practice Similar
          </button>
        </div>

        {showSimilar && generatedQuestion && (
          <SimilarQuestionCard question={generatedQuestion} onComplete={handleSimilarComplete} />
        )}

        <AskTutorModal isOpen={showTutor} onClose={() => setShowTutor(false)} question={question} selectedLabel={selectedLabel} />
      </div>
    );
  }

  // Incorrect answer - show more detail to help learn
  return (
    <div ref={panelRef} className="animate-fade-in space-y-3 mt-4">
      {/* Incorrect Banner */}
      <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/10 flex items-center gap-3">
        <XCircle className="w-5 h-5 text-destructive shrink-0" />
        <p className="font-semibold text-destructive">Incorrect</p>
      </div>

      {/* Why your answer was wrong */}
      {wrongExplanation && (
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Why {selectedLabel} is wrong</p>
          <p className="text-sm text-foreground">{truncateWords(wrongExplanation.why_wrong, 18)}</p>
        </div>
      )}

      {/* Correct answer */}
      <div className="p-3 rounded-xl bg-success/10 border border-success/20">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          <p className="text-sm font-medium text-success">Correct: {question.correct_label}</p>
        </div>
        <p className="text-sm text-foreground mb-2">{truncateWords(correctOption?.text || '', 15)}</p>
        <p className="text-sm text-muted-foreground">{truncateWords(question.rationale_bullets[0] || '', 20)}</p>
      </div>

      {/* Key Takeaway - Gold Nugget - HIGH CONTRAST */}
      <div className="gold-nugget flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-1">Key Takeaway</p>
          <p className="text-base font-medium text-amber-950 dark:text-amber-50 leading-snug">{truncateWords(question.takeaway, 20)}</p>
        </div>
      </div>

      {/* Big Next Button - prominent position */}
      <Button 
        ref={nextButtonRef}
        onClick={onNext} 
        className="w-full btn-premium text-base py-6 min-h-[56px] will-change-transform"
        autoFocus
      >
        Next Question
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>

      {/* Actions - touch friendly */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowTutor(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-sm text-primary active:scale-[0.98] will-change-transform"
        >
          <Sparkles className="w-4 h-4" />
          Ask Tutor
        </button>
        <button
          onClick={handleGenerateSimilar}
          disabled={isGenerating || showSimilar}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-sm text-amber-600 dark:text-amber-400 disabled:opacity-50 active:scale-[0.98] will-change-transform"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Practice Similar
        </button>
      </div>

      {showSimilar && generatedQuestion && (
        <SimilarQuestionCard question={generatedQuestion} onComplete={handleSimilarComplete} />
      )}

      <AskTutorModal isOpen={showTutor} onClose={() => setShowTutor(false)} question={question} selectedLabel={selectedLabel} />
    </div>
  );
}
