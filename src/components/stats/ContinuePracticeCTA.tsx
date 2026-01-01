import { Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContinuePracticeCTAProps {
  weakestCategory?: string | null;
}

export function ContinuePracticeCTA({ weakestCategory }: ContinuePracticeCTAProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (weakestCategory) {
      navigate('/', { state: { tab: 'practice', category: weakestCategory } });
    } else {
      navigate('/', { state: { tab: 'practice' } });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
    >
      <div className="flex items-center justify-center gap-3">
        <Zap className="w-5 h-5 group-hover:animate-pulse" />
        <span className="text-base font-bold">Continue Practice</span>
        <Sparkles className="w-4 h-4 opacity-70" />
      </div>
      {weakestCategory && (
        <p className="text-xs text-primary-foreground/80 mt-1">
          Focus on your weakest area
        </p>
      )}
    </button>
  );
}
