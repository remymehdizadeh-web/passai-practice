import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Lightbulb, ChevronRight, ChevronDown, Sparkles, Star, Zap, Clock } from 'lucide-react';
import type { Question } from '@/types/question';
import { cn } from '@/lib/utils';

interface ExplanationPanelProps {
  question: Question;
  selectedLabel: string;
  onNext: () => void;
  pointsEarned?: number;
  streak?: number;
  timeBonus?: number;
  streakBonus?: number;
}

export function ExplanationPanel({ 
  question, 
  selectedLabel, 
  onNext, 
  pointsEarned = 100, 
  streak = 1,
  timeBonus = 0,
  streakBonus = 0
}: ExplanationPanelProps) {
  const isCorrect = selectedLabel === question.correct_label;
  const correctOption = question.options.find(o => o.label === question.correct_label);
  const [showExplanation, setShowExplanation] = useState(isCorrect);
  const [showCelebration, setShowCelebration] = useState(false);

  const wrongExplanation = question.wrong_option_bullets?.find(
    w => w.label === selectedLabel
  );

  // Trigger celebration animation for correct answers
  useEffect(() => {
    if (isCorrect) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  const totalPoints = pointsEarned + timeBonus + streakBonus;

  return (
    <div className="animate-fade-in space-y-3 mt-4">
      {/* Correct Answer Celebration */}
      {isCorrect && (
        <div className="relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-success/20 via-success/10 to-success/5 border border-success/30">
          {/* Floating particles animation */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-4 animate-bounce delay-100">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="absolute top-4 right-6 animate-bounce delay-200">
                <Sparkles className="w-5 h-5 text-success" />
              </div>
              <div className="absolute bottom-3 left-8 animate-bounce delay-300">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="absolute top-3 left-1/2 animate-bounce">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            </div>
          )}
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle2 className="w-7 h-7 text-success" />
              <span className="text-xl font-bold text-success">Correct!</span>
            </div>
            
            {/* Points breakdown */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="bg-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                <span className="text-emerald-500 font-bold text-lg">+{pointsEarned}</span>
              </div>
              {timeBonus > 0 && (
                <div className="bg-blue-500/20 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-blue-500 font-semibold text-sm">+{timeBonus}</span>
                </div>
              )}
              {streakBonus > 0 && (
                <div className="bg-orange-500/20 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <span className="text-orange-500 font-semibold text-sm">🔥 +{streakBonus}</span>
                </div>
              )}
            </div>
            {totalPoints > pointsEarned && (
              <p className="text-sm text-success/80 mt-2 font-medium">
                Total: +{totalPoints} points!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Incorrect Answer Banner */}
      {!isCorrect && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-sm text-destructive">Incorrect</p>
              <p className="text-xs text-muted-foreground">
                The correct answer is {question.correct_label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show Explanation Toggle (for wrong answers) */}
      {!isCorrect && !showExplanation && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExplanation(true)}
          className="w-full"
        >
          <ChevronDown className="w-4 h-4 mr-1" />
          Show Explanation
        </Button>
      )}

      {/* Explanation Content */}
      {showExplanation && (
        <>
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
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              {question.correct_label}. {correctOption?.text}
            </p>
            
            {/* Rationale Bullets */}
            <ul className="space-y-2 mb-4">
              {question.rationale_bullets.slice(0, 4).map((bullet, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Key Takeaway */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-start gap-2.5">
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
        </>
      )}

      {/* Next Question Button - Always visible and prominent */}
      <Button
        variant="default"
        size="lg"
        onClick={onNext}
        className={cn(
          "w-full",
          isCorrect && "bg-success hover:bg-success/90"
        )}
      >
        Next Question
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}