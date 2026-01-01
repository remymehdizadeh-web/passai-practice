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

  const wrongExplanation = question.wrong_option_bullets?.find(
    w => w.label === selectedLabel
  );

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
      <div ref={panelRef} className="animate-fade-in mt-5 space-y-3">
        {/* Success Banner */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-success/20 via-success/10 to-transparent border border-success/30">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-success">Correct!</p>
                <p className="text-sm text-muted-foreground">Great job</p>
              </div>
            </div>
            
            <Button onClick={onNext} className="btn-premium shrink-0">
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-card border border-border hover:bg-muted/30 transition-colors text-sm"
          >
            <span className="text-muted-foreground">View explanation</span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showExplanation && "rotate-180")} />
          </button>
          <button
            onClick={() => setShowTutor(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-sm text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Ask Tutor
          </button>
        </div>

        {/* Practice Similar Button */}
        <button
          onClick={handleGenerateSimilar}
          disabled={isGenerating || showSimilar}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors text-sm text-accent disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating similar question...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Practice Similar Question
            </>
          )}
        </button>

        {/* Similar Question */}
        {showSimilar && generatedQuestion && (
          <SimilarQuestionCard 
            question={generatedQuestion}
            onComplete={handleSimilarComplete}
          />
        )}
            
        {showExplanation && (
          <div className="card-organic p-5 animate-fade-in">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              {question.correct_label}. {correctOption?.text}
            </p>
            
            <ul className="space-y-2 mb-4">
              {question.rationale_bullets.slice(0, 3).map((bullet, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-primary mb-1">Key Takeaway</p>
                <p className="text-sm text-foreground">{question.takeaway}</p>
              </div>
            </div>
          </div>
        )}

        <AskTutorModal 
          isOpen={showTutor} 
          onClose={() => setShowTutor(false)} 
          question={question}
          selectedLabel={selectedLabel}
        />
      </div>
    );
  }

  return (
    <div ref={panelRef} className="animate-fade-in space-y-4 mt-5">
      {/* Incorrect Banner */}
      <div className="p-5 rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-destructive">Incorrect</p>
            <p className="text-sm text-muted-foreground">
              The correct answer is {question.correct_label}
            </p>
          </div>
        </div>
      </div>

      {/* Why incorrect */}
      {wrongExplanation && (
        <div className="p-4 rounded-xl border border-border bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Why {selectedLabel} is incorrect
          </p>
          <p className="text-sm text-foreground">{wrongExplanation.why_wrong}</p>
        </div>
      )}

      {/* Correct Answer */}
      <div className="card-organic p-5">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          {question.correct_label}. {correctOption?.text}
        </p>
        
        <ul className="space-y-2 mb-4">
          {question.rationale_bullets.slice(0, 4).map((bullet, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-primary mb-1">Key Takeaway</p>
            <p className="text-sm text-foreground">{question.takeaway}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowTutor(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-sm text-primary"
        >
          <Sparkles className="w-4 h-4" />
          Ask Tutor
        </button>
        <Button onClick={onNext} size="lg" className="flex-1 btn-premium text-primary-foreground">
          Next Question
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Practice Similar - for wrong answers */}
      <button
        onClick={handleGenerateSimilar}
        disabled={isGenerating || showSimilar}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-sm text-amber-600 dark:text-amber-400 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating practice question...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Reinforce with Similar Question
          </>
        )}
      </button>

      {/* Similar Question */}
      {showSimilar && generatedQuestion && (
        <SimilarQuestionCard 
          question={generatedQuestion}
          onComplete={handleSimilarComplete}
        />
      )}

      <AskTutorModal 
        isOpen={showTutor} 
        onClose={() => setShowTutor(false)} 
        question={question}
        selectedLabel={selectedLabel}
      />
    </div>
  );
}