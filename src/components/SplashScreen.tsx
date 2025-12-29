import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Target } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm animate-fade-in">
        {/* Logo/Brand */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-premium">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          <span className="text-gradient">Pass</span>
          <span className="text-foreground">AI</span>
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          NCLEX-RN Practice
        </p>

        {/* Value propositions */}
        <div className="space-y-3 mb-10 w-full">
          <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Instant Practice</p>
              <p className="text-muted-foreground text-xs">Answer questions in seconds</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-secondary/50 border border-border/50">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
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
