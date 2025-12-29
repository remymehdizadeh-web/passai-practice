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
        return 'text-success bg-success/10 border-success/30';
      case 'hard':
        return 'text-destructive bg-destructive/10 border-destructive/30';
      default:
        return 'text-muted-foreground bg-muted border-border';
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
    return 'option-default opacity-50';
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
    <div className="card-premium rounded-2xl p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full border',
            getDifficultyColor(question.difficulty)
          )}>
            {question.category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onBookmark}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isBookmarked 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <Bookmark className={cn('w-5 h-5', isBookmarked && 'fill-current')} />
          </button>
          <button
            onClick={onReport}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Question counter */}
      <p className="text-xs text-muted-foreground mb-3">
        Question {questionNumber} of {totalQuestions}
      </p>

      {/* Question Stem */}
      <p className="text-foreground font-medium leading-relaxed mb-6">
        {question.stem}
      </p>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option) => (
          <button
            key={option.label}
            onClick={() => !isSubmitted && setLocalSelected(option.label)}
            disabled={isSubmitted}
            className={cn(
              'w-full text-left p-4 rounded-xl border flex items-start gap-3 transition-all duration-200',
              getOptionClass(option.label),
              !isSubmitted && 'hover:border-muted-foreground/50 cursor-pointer'
            )}
          >
            <span className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0',
              currentSelected === option.label
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {option.label}
            </span>
            <span className="flex-1 pt-0.5">{option.text}</span>
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
