import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Lightbulb, ChevronRight, ChevronDown, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import type { Question } from '@/types/question';
import { cn } from '@/lib/utils';
import { AskTutorModal } from '@/components/AskTutorModal';
import { SimilarQuestionCard } from '@/components/SimilarQuestionCard';
import { useSimilarQuestion } from '@/hooks/useSimilarQuestion';

interface ExplanationPanelProps {
  question: Question;
  selectedLabel: string;
  onNext: () => void;
}

export function ExplanationPanel({ question, selectedLabel, onNext }: ExplanationPanelProps) {
  const isCorrect = selectedLabel === question.correct_label;
  const correctOption = question.options.find(o => o.label === question.correct_label);
  const [showExplanation, setShowExplanation] = useState(false);
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
      <div ref={panelRef} className="animate-fade-in mt-4 space-y-2.5">
        {/* Success Banner - Compact */}
        <div className="p-3 rounded-xl bg-success/10 border border-success/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <p className="font-semibold text-success">Correct!</p>
          </div>
          <Button onClick={onNext} size="sm" className="btn-premium">
            Continue
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-card border border-border hover:bg-muted/30 transition-colors text-xs"
          >
            <span className="text-muted-foreground">Explanation</span>
            <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", showExplanation && "rotate-180")} />
          </button>
          <button
            onClick={() => setShowTutor(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-xs text-primary"
          >
            <Sparkles className="w-3 h-3" />
            Ask Tutor
          </button>
        </div>

        {/* Practice Similar */}
        <button
          onClick={handleGenerateSimilar}
          disabled={isGenerating || showSimilar}
          className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors text-xs text-accent disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3" />
              Practice Similar
            </>
          )}
        </button>

        {showSimilar && generatedQuestion && (
          <SimilarQuestionCard question={generatedQuestion} onComplete={handleSimilarComplete} />
        )}
            
        {showExplanation && (
          <div className="p-3 rounded-xl bg-card border border-border animate-fade-in">
            <ul className="space-y-1.5 mb-3">
              {question.rationale_bullets.slice(0, 2).map((bullet, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">{question.takeaway}</p>
            </div>
          </div>
        )}

        <AskTutorModal isOpen={showTutor} onClose={() => setShowTutor(false)} question={question} selectedLabel={selectedLabel} />
      </div>
    );
  }

  return (
    <div ref={panelRef} className="animate-fade-in space-y-2.5 mt-4">
      {/* Incorrect Banner - Compact */}
      <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/10 flex items-center gap-2.5">
        <XCircle className="w-5 h-5 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-destructive text-sm">Incorrect</p>
          <p className="text-xs text-muted-foreground">Answer: {question.correct_label}</p>
        </div>
      </div>

      {/* Why incorrect - Compact */}
      {wrongExplanation && (
        <div className="p-2.5 rounded-lg border border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">{selectedLabel}:</span> {wrongExplanation.why_wrong}
          </p>
        </div>
      )}

      {/* Correct Answer - Compact */}
      <div className="p-3 rounded-xl bg-card border border-border">
        <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          {question.correct_label}. {correctOption?.text}
        </p>
        
        <ul className="space-y-1 mb-2.5">
          {question.rationale_bullets.slice(0, 2).map((bullet, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-primary/50 mt-1.5 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">{question.takeaway}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowTutor(true)}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-xs text-primary"
        >
          <Sparkles className="w-3 h-3" />
          Ask Tutor
        </button>
        <Button onClick={onNext} size="sm" className="flex-1 btn-premium text-primary-foreground">
          Next Question
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Practice Similar */}
      <button
        onClick={handleGenerateSimilar}
        disabled={isGenerating || showSimilar}
        className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-xs text-amber-600 dark:text-amber-400 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="w-3 h-3" />
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