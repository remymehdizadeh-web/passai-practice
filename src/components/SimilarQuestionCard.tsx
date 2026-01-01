import { useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface GeneratedQuestion {
  id: string;
  stem: string;
  options: { label: string; text: string }[];
  correct_label: string;
  explanation: string;
  key_concept: string;
  category: string;
  difficulty: string;
}

interface SimilarQuestionCardProps {
  question: GeneratedQuestion;
  onComplete: () => void;
}

export function SimilarQuestionCard({ question, onComplete }: SimilarQuestionCardProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = selectedLabel === question.correct_label;

  const handleSelect = (label: string) => {
    if (isSubmitted) return;
    setSelectedLabel(label);
  };

  const handleSubmit = () => {
    if (!selectedLabel) return;
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
          AI Generated
        </span>
        <span className="text-xs text-muted-foreground">
          Practice similar concept
        </span>
      </div>

      {/* Question stem */}
      <div className="card-organic p-4">
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {question.stem}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedLabel === option.label;
          const isOptionCorrect = option.label === question.correct_label;
          
          let optionStyles = "bg-card border-border hover:border-primary/50";
          if (isSubmitted) {
            if (isOptionCorrect) {
              optionStyles = "bg-success/10 border-success/30";
            } else if (isSelected && !isOptionCorrect) {
              optionStyles = "bg-destructive/10 border-destructive/30";
            }
          } else if (isSelected) {
            optionStyles = "bg-primary/10 border-primary/50 ring-1 ring-primary/20";
          }

          return (
            <button
              key={option.label}
              onClick={() => handleSelect(option.label)}
              disabled={isSubmitted}
              className={cn(
                "w-full p-4 rounded-xl border text-left transition-all",
                optionStyles,
                !isSubmitted && "cursor-pointer"
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                  isSubmitted && isOptionCorrect ? "bg-success text-success-foreground" :
                  isSubmitted && isSelected && !isOptionCorrect ? "bg-destructive text-destructive-foreground" :
                  isSelected ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                )}>
                  {option.label}
                </span>
                <p className="text-sm text-foreground pt-0.5">{option.text}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit or Result */}
      {!isSubmitted ? (
        <Button
          onClick={handleSubmit}
          disabled={!selectedLabel}
          className="w-full btn-premium"
        >
          Check Answer
        </Button>
      ) : (
        <div className="space-y-3">
          {/* Result banner */}
          <div className={cn(
            "p-4 rounded-xl flex items-center gap-3",
            isCorrect ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"
          )}>
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive" />
            )}
            <p className={cn("font-semibold", isCorrect ? "text-success" : "text-destructive")}>
              {isCorrect ? "Correct!" : `Incorrect - Answer is ${question.correct_label}`}
            </p>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5" />
              <p className="text-xs font-semibold text-primary">Explanation</p>
            </div>
            <p className="text-sm text-foreground">{question.explanation}</p>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Key concept:</strong> {question.key_concept}
            </p>
          </div>

          <Button onClick={onComplete} className="w-full">
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
