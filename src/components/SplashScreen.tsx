import { Button } from '@/components/ui/button';
import { Clock, Brain, Shield, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import logoIcon from '@/assets/logo-icon.png';

interface SplashScreenProps {
  onStart: () => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full animate-fade-in">
        {/* Logo */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-premium border border-border/50">
            <img src={logoIcon} alt="NCLEX Go" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Brand */}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-1">
          NCLEX RN Pro
        </h1>
        
        {/* Tagline */}
        <p className="text-muted-foreground text-base mb-8">
          Master Your NCLEX-RN Exam
        </p>

        {/* Features - more professional grid */}
        <div className="grid grid-cols-3 gap-3 mb-8 w-full">
          <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs font-medium text-foreground">Quick Sessions</p>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs font-medium text-foreground">Smart Review</p>
          </div>
          
          <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs font-medium text-foreground">Exam Ready</p>
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
            Start Practicing
          </Button>
          
          {!user && (
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogIn className="w-4 h-4" />
              Sign in to sync progress
            </Button>
          )}
        </div>

        <p className="text-muted-foreground text-xs mt-6">
          10 free questions · No signup required
        </p>
      </div>
      
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
