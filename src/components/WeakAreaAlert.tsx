import { AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeakAreaAlertProps {
  category: string;
  accuracy: number;
  onPractice: () => void;
}

export function WeakAreaAlert({ category, accuracy, onPractice }: WeakAreaAlertProps) {
  return (
    <button
      onClick={onPractice}
      className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-left hover:bg-amber-500/10 transition-all active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-0.5">
            Focus Area: {category}
          </p>
          <p className="text-xs text-muted-foreground">
            Your accuracy here is {accuracy}%. A few targeted questions can help.
          </p>
        </div>

        <ArrowRight className="w-5 h-5 text-amber-500 shrink-0 mt-2" />
      </div>
    </button>
  );
}
