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
  const correctOption = question.options.find(o => o.label === question.correct_label);

  // Find the wrong option explanation for the selected answer
  const wrongExplanation = question.wrong_option_bullets?.find(
    w => w.label === selectedLabel
  );

  return (
    <div className="animate-fade-in space-y-4 mt-4">
      {/* Result Banner */}
      <div 
        className={cn(
          'p-4 rounded-xl flex items-center gap-3 border',
          isCorrect 
            ? 'border-success/20 bg-success/5' 
            : 'border-destructive/20 bg-destructive/5'
        )}
      >
        {isCorrect ? (
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-destructive shrink-0" />
        )}
        <div>
          <p className={cn(
            'font-medium text-sm',
            isCorrect ? 'text-success' : 'text-destructive'
          )}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </p>
          {!isCorrect && (
            <p className="text-xs text-muted-foreground">
              The correct answer is {question.correct_label}.
            </p>
          )}
        </div>
      </div>

      {/* Why incorrect (if wrong) */}
      {!isCorrect && wrongExplanation && (
        <div className="p-4 rounded-xl border border-border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Why {selectedLabel} is incorrect
          </p>
          <p className="text-sm text-foreground">
            {wrongExplanation.why_wrong}
          </p>
        </div>
      )}

      {/* Correct Answer Explanation */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          {question.correct_label}. {correctOption?.text}
        </p>
        
        {/* Rationale Bullets */}
        <ul className="space-y-2 mb-4">
          {question.rationale_bullets.slice(0, 5).map((bullet, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Key Takeaway */}
        <div className="p-3.5 rounded-lg border border-border bg-muted/30 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">
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
        variant="default"
        size="lg"
        onClick={onNext}
        className="w-full"
      >
        Next Question
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
