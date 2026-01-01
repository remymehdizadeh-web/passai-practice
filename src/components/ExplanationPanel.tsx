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

  // Auto-scroll to panel and focus next button
  useEffect(() => {
    if (panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Focus the next button for easy keyboard navigation
        if (nextButtonRef.current) {
          nextButtonRef.current.focus();
        }
      }, 100);
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

  // Correct answer - streamlined flow
  if (isCorrect) {
    return (
      <div ref={panelRef} className="animate-fade-in mt-4 space-y-3">
        {/* Compact Success Banner */}
        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <div>
                <p className="font-semibold text-success">Correct!</p>
                <p className="text-xs text-muted-foreground">{truncateWords(question.takeaway, 12)}</p>
              </div>
            </div>
            <Button 
              ref={nextButtonRef}
              onClick={onNext} 
              className="btn-premium"
              autoFocus
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Optional: Expand for more details */}
        <details className="group">
          <summary className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>See explanation</span>
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

        {/* Secondary actions - collapsed */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowTutor(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors text-xs text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask Tutor
          </button>
          <button
            onClick={handleGenerateSimilar}
            disabled={isGenerating || showSimilar}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
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
      <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="font-semibold text-destructive">Incorrect</p>
        </div>
        <Button 
          ref={nextButtonRef}
          onClick={onNext} 
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
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

      {/* Key Takeaway - Gold Nugget */}
      <div className="gold-nugget flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">Key Takeaway</p>
          <p className="text-sm text-amber-900 dark:text-amber-100">{truncateWords(question.takeaway, 20)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowTutor(true)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-xs text-primary"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask Tutor
        </button>
        <button
          onClick={handleGenerateSimilar}
          disabled={isGenerating || showSimilar}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-xs text-amber-600 dark:text-amber-400 disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
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
