import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const currentSelected = isSubmitted ? selectedLabel : localSelected;
  const submitRef = useRef<HTMLButtonElement>(null);

  // Reset animation state when question changes
  useEffect(() => {
    setIsAnimating(false);
    setLocalSelected(null);
  }, [question.id]);

  // Auto-scroll to submit button when option is selected
  useEffect(() => {
    if (localSelected && !isSubmitted && submitRef.current) {
      setTimeout(() => {
        submitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [localSelected, isSubmitted]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-success bg-success/10 border-success/20';
      case 'hard':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      default:
        return 'text-muted-foreground bg-muted/60 border-border';
    }
  };

  const getOptionClass = (label: string) => {
    // During animation, don't show final state yet
    if (isAnimating) {
      return cn(
        'option-default',
        currentSelected === label && 'option-selected'
      );
    }
    
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
    if (!isSubmitted || isAnimating) return null;

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={cn(
          'text-xs font-medium px-2.5 py-1 rounded-md border',
          getDifficultyColor(question.difficulty)
        )}>
          {question.category}
        </span>
        <div className="flex items-center gap-0.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBookmark}
            className={cn(
              'p-2 rounded-lg transition-colors duration-150',
              isBookmarked 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onReport}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
          >
            <Flag className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Question Stem */}
      <p className="text-foreground text-[15px] leading-relaxed mb-6">
        {question.stem}
      </p>

      {/* Options */}
      <div className="space-y-2.5 mb-6">
        {question.options.map((option, index) => (
          <motion.button
            key={option.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
            onClick={() => !isSubmitted && setLocalSelected(option.label)}
            disabled={isSubmitted}
            className={cn(
              'w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-150',
              getOptionClass(option.label),
              !isSubmitted && 'hover:border-primary/30 cursor-pointer'
            )}
          >
            <span className={cn(
              'w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 transition-colors duration-150',
              currentSelected === option.label
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {option.label}
            </span>
            <span className="flex-1 pt-0.5 text-sm">{option.text}</span>
            {getOptionIcon(option.label)}
          </motion.button>
        ))}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <motion.button
          ref={submitRef}
          whileTap={{ scale: localSelected ? 0.98 : 1 }}
          onClick={() => localSelected && onSubmit(localSelected)}
          disabled={!localSelected}
          className={cn(
            "w-full py-3.5 rounded-xl font-semibold transition-all",
            localSelected 
              ? "btn-premium" 
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Submit Answer
        </motion.button>
      )}
    </motion.div>
  );
}
