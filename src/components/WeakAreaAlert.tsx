import { Target, ArrowRight } from 'lucide-react';

interface WeakAreaAlertProps {
  category: string;
  accuracy: number;
  onPractice: () => void;
}

export function WeakAreaAlert({ category, accuracy, onPractice }: WeakAreaAlertProps) {
  return (
    <button
      onClick={onPractice}
      className="w-full bg-primary/5 border border-primary/20 rounded-2xl p-4 text-left hover:bg-primary/10 transition-all active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-0.5">
            Suggested Focus: {category}
          </p>
          <p className="text-xs text-muted-foreground">
            Currently at {accuracy}% — a few targeted questions can boost this.
          </p>
        </div>

        <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-2" />
      </div>
    </button>
  );
}
