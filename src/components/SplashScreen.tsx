import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Target } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm animate-fade-in">
        {/* Logo/Brand */}
        <div className="relative mb-8">
          <div className="relative w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-premium">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-semibold tracking-tight mb-2">
          <span className="text-gradient">Pass</span>
          <span className="text-foreground">AI</span>
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          NCLEX-RN Practice
        </p>

        {/* Value propositions - Bento style */}
        <div className="space-y-3 mb-10 w-full">
          <div className="bento-cell flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Instant Practice</p>
              <p className="text-muted-foreground text-xs">Answer questions in seconds</p>
            </div>
          </div>
          
          <div className="bento-cell flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Adaptive Learning</p>
              <p className="text-muted-foreground text-xs">Focus on your weak areas</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          variant="hero" 
          size="xl" 
          onClick={onStart}
          className="w-full"
        >
          Start Practice
        </Button>

        <p className="text-muted-foreground text-xs mt-4">
          No account required • 10 free questions
        </p>
      </div>
    </div>
  );
}
