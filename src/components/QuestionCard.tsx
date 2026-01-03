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
  const submitRef = useRef<HTMLButtonElement>(null);

  // Reset local state when question changes
  useEffect(() => {
    setLocalSelected(null);
  }, [question.id]);

  // Auto-scroll to submit button only if it's not fully visible
  useEffect(() => {
    if (localSelected && !isSubmitted && submitRef.current) {
      setTimeout(() => {
        const button = submitRef.current;
        if (!button) return;
        
        const rect = button.getBoundingClientRect();
        const isFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isFullyVisible) {
          button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
    // Before submission, only show selection state
    if (!isSubmitted) {
      return cn(
        'option-default',
        localSelected === label && 'option-selected'
      );
    }

    // After submission, show correct/incorrect based on parent's selectedLabel
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

  const handleOptionClick = (label: string) => {
    if (isSubmitted) return;
    setLocalSelected(label);
  };

  const handleSubmit = () => {
    if (localSelected && !isSubmitted) {
      onSubmit(localSelected);
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
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

      {/* Options - increased touch targets */}
      <div className="space-y-3 mb-6">
        {question.options.map((option) => (
          <button
            key={`${question.id}-${option.label}`}
            onClick={() => handleOptionClick(option.label)}
            disabled={isSubmitted}
            className={cn(
              'w-full text-left p-4 rounded-xl border flex items-start gap-3 transition-all duration-150',
              'min-h-[56px]', // Touch target height
              getOptionClass(option.label),
              !isSubmitted && 'hover:border-primary/30 cursor-pointer active:scale-[0.98]'
            )}
          >
            <span className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 transition-colors duration-150',
              (isSubmitted ? selectedLabel : localSelected) === option.label
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {option.label}
            </span>
            <span className="flex-1 pt-1 text-[15px] leading-snug">{option.text}</span>
            {getOptionIcon(option.label)}
          </button>
        ))}
      </div>

      {/* Submit Button - thumb-zone friendly at bottom */}
      {!isSubmitted && (
        <motion.button
          ref={submitRef}
          whileTap={{ scale: localSelected ? 0.98 : 1 }}
          onClick={handleSubmit}
          disabled={!localSelected}
          className={cn(
            "w-full py-4 rounded-xl font-semibold transition-all will-change-transform",
            "min-h-[52px] text-base", // Touch target
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
