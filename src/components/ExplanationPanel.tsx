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

  // wrong_option_bullets can be an array or object from JSON
  const wrongBullets = question.wrong_option_bullets;
  const wrongExplanation = Array.isArray(wrongBullets) 
    ? wrongBullets.find(w => w.label === selectedLabel)
    : null;

  // Auto-scroll to explanation when answer is wrong
  useEffect(() => {
    if (!isCorrect && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isCorrect]);

  const handleGenerateSimilar = async () => {
    setShowSimilar(true);
    await generateSimilar(question);
  };

  const handleSimilarComplete = () => {
    setShowSimilar(false);
    resetSimilar();
    onNext();
  };

  if (isCorrect) {
    return (
      <div ref={panelRef} className="animate-fade-in mt-6 space-y-4">
        {/* Success Banner */}
        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <p className="text-lg font-semibold text-success">Correct!</p>
          </div>
          
          {/* Why correct */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-foreground">Why {question.correct_label} is correct:</p>
            <ul className="space-y-1.5">
              {question.rationale_bullets.slice(0, 2).map((bullet, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                  <span>{truncateWords(bullet, 20)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Takeaway */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{truncateWords(question.takeaway, 25)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowTutor(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-sm text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Ask Tutor
          </button>
          <Button onClick={onNext} className="flex-1 btn-premium">
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Practice Similar */}
        <button
          onClick={handleGenerateSimilar}
          disabled={isGenerating || showSimilar}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors text-sm text-accent disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Practice Similar
            </>
          )}
        </button>

        {showSimilar && generatedQuestion && (
          <SimilarQuestionCard question={generatedQuestion} onComplete={handleSimilarComplete} />
        )}

        <AskTutorModal isOpen={showTutor} onClose={() => setShowTutor(false)} question={question} selectedLabel={selectedLabel} />
      </div>
    );
  }

  return (
    <div ref={panelRef} className="animate-fade-in space-y-4 mt-6">
      {/* Incorrect Banner */}
      <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10">
        <div className="flex items-center gap-3 mb-3">
          <XCircle className="w-6 h-6 text-destructive" />
          <p className="text-lg font-semibold text-destructive">Incorrect</p>
        </div>

        {/* Why your answer was wrong */}
        {wrongExplanation && (
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-1">Why {selectedLabel} is wrong:</p>
            <p className="text-sm text-muted-foreground">{truncateWords(wrongExplanation.why_wrong, 20)}</p>
          </div>
        )}

        {/* Correct answer */}
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <p className="text-sm font-medium text-success flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Correct: {question.correct_label}. {correctOption?.text}
          </p>
          <ul className="space-y-1.5">
            {question.rationale_bullets.slice(0, 2).map((bullet, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                <span>{truncateWords(bullet, 20)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key Takeaway */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">{truncateWords(question.takeaway, 25)}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowTutor(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-sm text-primary"
        >
          <Sparkles className="w-4 h-4" />
          Ask Tutor
        </button>
        <Button onClick={onNext} className="flex-1 btn-premium">
          Next Question
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Practice Similar */}
      <button
        onClick={handleGenerateSimilar}
        disabled={isGenerating || showSimilar}
        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-sm text-amber-600 dark:text-amber-400 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Practice Similar
          </>
        )}
      </button>

      {showSimilar && generatedQuestion && (
        <SimilarQuestionCard question={generatedQuestion} onComplete={handleSimilarComplete} />
      )}

      <AskTutorModal isOpen={showTutor} onClose={() => setShowTutor(false)} question={question} selectedLabel={selectedLabel} />
    </div>
  );
}
