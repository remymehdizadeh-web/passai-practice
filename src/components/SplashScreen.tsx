import { Button } from '@/components/ui/button';
import { LogIn, Sparkles, Target, Zap, Trophy, BookOpen, TrendingUp } from 'lucide-react';
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
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-accent/15 to-accent/5 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Floating medical icons */}
        <div className="absolute top-[15%] left-[10%] animate-float opacity-20" style={{ animationDelay: '0.5s' }}>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="absolute top-[25%] right-[12%] animate-float opacity-20" style={{ animationDelay: '1s' }}>
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
        </div>
        <div className="absolute bottom-[30%] left-[8%] animate-float opacity-15" style={{ animationDelay: '2s' }}>
          <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-success" />
          </div>
        </div>
        <div className="absolute bottom-[35%] right-[15%] animate-float opacity-15" style={{ animationDelay: '0.8s' }}>
          <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-warning" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Logo with glow effect */}
        <div className="relative mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl scale-150" />
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-2 border-primary/20">
            <img src={logoIcon} alt="NCLEX RN Pro" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
          </div>
        </div>

        {/* Brand text */}
        <div className="text-center mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            NCLEX RN Pro
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Your path to passing the NCLEX-RN
          </p>
        </div>

        {/* Feature cards - horizontal scroll */}
        <div className="w-full max-w-sm mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="grid grid-cols-3 gap-3">
            <div className="card-organic p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs font-semibold text-foreground">Adaptive</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Smart practice</p>
            </div>
            
            <div className="card-organic p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <p className="text-xs font-semibold text-foreground">Readiness</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Track progress</p>
            </div>
            
            <div className="card-organic p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-success" />
              </div>
              <p className="text-xs font-semibold text-foreground">Compete</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Leaderboards</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">2,000+</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">98%</p>
            <p className="text-xs text-muted-foreground">Pass Rate</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">50k+</p>
            <p className="text-xs text-muted-foreground">Students</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm space-y-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onStart}
            className="w-full h-14 text-base"
          >
            Start Practicing Free
          </Button>
          
          {!user && (
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="w-full gap-2 text-muted-foreground hover:text-foreground h-12"
            >
              <LogIn className="w-4 h-4" />
              Sign in to sync progress
            </Button>
          )}
        </div>
      </div>

      {/* Bottom trust badge */}
      <div className="relative z-10 pb-8 px-6 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <p className="text-xs text-muted-foreground">
          10 free questions · No credit card required
        </p>
      </div>
    </div>
  );
}
