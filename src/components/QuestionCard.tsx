import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Flag, CheckCircle2, XCircle } from 'lucide-react';
import type { Question } from '@/types/question';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  isBookmarked: boolean;
  onSubmit: (selectedLabel: string) => void;
  onBookmark: () => void;
  onReport: () => void;
  isSubmitted: boolean;
  selectedLabel: string | null;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  isBookmarked,
  onSubmit,
  onBookmark,
  onReport,
  isSubmitted,
  selectedLabel,
}: QuestionCardProps) {
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const currentSelected = isSubmitted ? selectedLabel : localSelected;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-success bg-success/10 border-success/20';
      case 'hard':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  const getOptionClass = (label: string) => {
    if (!isSubmitted) {
      return cn(
        'option-default',
        currentSelected === label && 'option-selected'
      );
    }

    const isCorrect = label === question.correct_label;
    const wasSelected = label === selectedLabel;

    if (isCorrect) {
      return wasSelected ? 'option-correct' : 'option-correct-not-selected';
    }
    if (wasSelected && !isCorrect) {
      return 'option-incorrect';
    }
    return 'option-default opacity-40';
  };

  const getOptionIcon = (label: string) => {
    if (!isSubmitted) return null;

    const isCorrect = label === question.correct_label;
    const wasSelected = label === selectedLabel;

    if (isCorrect) {
      return <CheckCircle2 className="w-5 h-5 text-success shrink-0" />;
    }
    if (wasSelected && !isCorrect) {
      return <XCircle className="w-5 h-5 text-destructive shrink-0" />;
    }
    return null;
  };

  return (
    <div className="card-glass p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-medium px-3 py-1.5 rounded-full border',
            getDifficultyColor(question.difficulty)
          )}>
            {question.category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onBookmark}
            className={cn(
              'p-2.5 rounded-xl transition-all duration-200',
              isBookmarked 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Bookmark className={cn('w-5 h-5', isBookmarked && 'fill-current')} />
          </button>
          <button
            onClick={onReport}
            className="p-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Question counter */}
      <p className="text-xs text-muted-foreground mb-4">
        Question {questionNumber} of {totalQuestions}
      </p>

      {/* Question Stem */}
      <p className="text-foreground text-stem text-base mb-7">
        {question.stem}
      </p>

      {/* Options */}
      <div className="space-y-3 mb-7">
        {question.options.map((option) => (
          <button
            key={option.label}
            onClick={() => !isSubmitted && setLocalSelected(option.label)}
            disabled={isSubmitted}
            className={cn(
              'w-full text-left p-4 rounded-2xl border flex items-start gap-3 transition-all duration-200',
              getOptionClass(option.label),
              !isSubmitted && 'hover:border-muted-foreground/30 cursor-pointer active:scale-[0.99]'
            )}
          >
            <span className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 transition-colors duration-200',
              currentSelected === option.label
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {option.label}
            </span>
            <span className="flex-1 pt-1 text-option">{option.text}</span>
            {getOptionIcon(option.label)}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <Button
          variant="hero"
          size="lg"
          onClick={() => localSelected && onSubmit(localSelected)}
          disabled={!localSelected}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}
