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
    <div className="animate-fade-in space-y-4 mt-5">
      {/* Result Banner */}
      <div className={cn(
        'p-4 rounded-2xl flex items-center gap-3',
        isCorrect 
          ? 'bg-success/8 border border-success/20' 
          : 'bg-destructive/8 border border-destructive/20'
      )}
      style={{
        backgroundColor: isCorrect 
          ? 'hsl(var(--success) / 0.08)' 
          : 'hsl(var(--destructive) / 0.08)'
      }}
      >
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
        <div 
          className="p-4 rounded-2xl border border-destructive/15"
          style={{ backgroundColor: 'hsl(var(--destructive) / 0.05)' }}
        >
          <p className="text-sm font-medium text-destructive mb-1">
            Why {selectedLabel} is incorrect:
          </p>
          <p className="text-sm text-muted-foreground">
            {wrongExplanation.why_wrong}
          </p>
        </div>
      )}

      {/* Correct Answer Explanation */}
      <div className="card-glass p-5">
        <p className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Correct Answer: {question.correct_label}. {correctOption?.text}
        </p>
        
        {/* Rationale Bullets */}
        <ul className="space-y-2.5 mb-5">
          {question.rationale_bullets.slice(0, 5).map((bullet, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span className="text-option">{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Key Takeaway Box */}
        <div 
          className="p-4 rounded-xl border border-primary/15 flex items-start gap-3"
          style={{ backgroundColor: 'hsl(var(--primary) / 0.05)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
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
