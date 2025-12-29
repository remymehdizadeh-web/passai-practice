import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react';
import type { Question } from '@/types/question';
import { cn } from '@/lib/utils';

interface ExplanationPanelProps {
  question: Question;
  selectedLabel: string;
  onNext: () => void;
}

export function ExplanationPanel({ question, selectedLabel, onNext }: ExplanationPanelProps) {
  const isCorrect = selectedLabel === question.correct_label;
  const selectedOption = question.options.find(o => o.label === selectedLabel);
  const correctOption = question.options.find(o => o.label === question.correct_label);

  // Find the wrong option explanation for the selected answer
  const wrongExplanation = question.wrong_option_bullets?.find(
    w => w.label === selectedLabel
  );

  return (
    <div className="animate-fade-in space-y-4 mt-4">
      {/* Result Banner */}
      <div className={cn(
        'p-4 rounded-xl flex items-center gap-3',
        isCorrect 
          ? 'bg-success/10 border border-success/30' 
          : 'bg-destructive/10 border border-destructive/30'
      )}>
        {isCorrect ? (
          <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-destructive shrink-0" />
        )}
        <div>
          <p className={cn(
            'font-semibold',
            isCorrect ? 'text-success' : 'text-destructive'
          )}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </p>
          {!isCorrect && (
            <p className="text-sm text-muted-foreground">
              You selected {selectedLabel}. The correct answer is {question.correct_label}.
            </p>
          )}
        </div>
      </div>

      {/* Why incorrect (if wrong) */}
      {!isCorrect && wrongExplanation && (
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <p className="text-sm font-medium text-destructive mb-1">
            Why {selectedLabel} is incorrect:
          </p>
          <p className="text-sm text-muted-foreground">
            {wrongExplanation.why_wrong}
          </p>
        </div>
      )}

      {/* Correct Answer Explanation */}
      <div className="card-premium rounded-xl p-4">
        <p className="text-sm font-semibold text-success mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Correct Answer: {question.correct_label}. {correctOption?.text}
        </p>
        
        {/* Rationale Bullets */}
        <ul className="space-y-2 mb-4">
          {question.rationale_bullets.slice(0, 5).map((bullet, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Key Takeaway Box */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              Key Takeaway
            </p>
            <p className="text-sm text-foreground">
              {question.takeaway}
            </p>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <Button
        variant="hero"
        size="lg"
        onClick={onNext}
        className="w-full"
      >
        Next Question
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
