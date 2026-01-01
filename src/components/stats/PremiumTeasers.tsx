import { Lock, TrendingUp, Trophy, Brain, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumTeasersProps {
  onUpgradeClick: () => void;
}

export function PremiumTeasers({ onUpgradeClick }: PremiumTeasersProps) {
  return (
    <div className="space-y-3">
      {/* Pass Probability Teaser */}
      <div className="relative bg-card border border-border rounded-2xl p-4 overflow-hidden">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-background/60 z-10 flex items-center justify-center">
          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-[0.98]"
          >
            <Lock className="w-4 h-4" />
            Unlock AI Prediction
          </button>
        </div>
        
        {/* Blurred content */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Predicted Pass Probability</p>
            <p className="text-2xl font-black text-primary blur-sm">78%</p>
          </div>
          <TrendingUp className="w-6 h-6 text-success blur-sm" />
        </div>
      </div>

      {/* Comparison Mode Teaser */}
      <div className="relative bg-card border border-border rounded-2xl p-4 overflow-hidden">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-background/60 z-10 flex items-center justify-center">
          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-[0.98]"
          >
            <Lock className="w-4 h-4" />
            See Full Comparison
          </button>
        </div>
        
        {/* Blurred content */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Your Ranking</p>
            <p className="text-lg font-bold text-foreground blur-sm">Top 23% of students</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
