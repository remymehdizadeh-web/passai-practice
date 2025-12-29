import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Target, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SplashScreenProps {
  onStart: () => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-premium">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Brand */}
        <h1 className="text-4xl font-semibold tracking-tight mb-2">
          <span className="text-gradient">Pass</span>
          <span className="text-foreground">AI</span>
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          NCLEX-RN Practice
        </p>

        {/* Features */}
        <div className="space-y-3 mb-10 w-full">
          <div className="bento-cell flex items-center gap-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Instant Practice</p>
              <p className="text-muted-foreground text-sm">Answer questions in seconds</p>
            </div>
          </div>
          
          <div className="bento-cell flex items-center gap-4 text-left">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Adaptive Learning</p>
              <p className="text-muted-foreground text-sm">Focus on your weak areas</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="w-full space-y-3">
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onStart}
            className="w-full"
          >
            Start Practice
          </Button>
          
          {!user && (
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="w-full gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign in to save progress
            </Button>
          )}
        </div>

        <p className="text-muted-foreground text-xs mt-5">
          10 free questions • No account required
        </p>
      </div>
    </div>
  );
}
