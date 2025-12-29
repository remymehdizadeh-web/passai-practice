import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaywallModal } from '@/components/PaywallModal';
import { 
  Crown, 
  HelpCircle, 
  FileText, 
  Mail, 
  ChevronRight,
  AlertTriangle,
  LogOut,
  User,
  LogIn,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { useUserProgress, useQuestions } from '@/hooks/useQuestions';
import { useAuth } from '@/hooks/useAuth';
import { getRemainingFreeQuestions } from '@/lib/session';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function SettingsView() {
  const { data: progress } = useUserProgress();
  const { data: questions } = useQuestions();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const remaining = getRemainingFreeQuestions();
  const totalAnswered = progress?.length || 0;
  const correctAnswers = progress?.filter((p) => p.is_correct).length || 0;
  const accuracy = totalAnswered > 0 
    ? Math.round((correctAnswers / totalAnswered) * 100) 
    : 0;
  const totalQuestions = questions?.length || 0;
  const completionRate = totalQuestions > 0 
    ? Math.round((totalAnswered / totalQuestions) * 100) 
    : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      {user ? (
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Signed in</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/auth')}
          className="w-full bg-card border border-border rounded-xl p-4 mb-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-foreground">Sign in</p>
            <p className="text-xs text-muted-foreground">Sync progress across devices</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Stats Grid */}
      <div className="mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Your Progress
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{totalAnswered}</p>
            <p className="text-xs text-muted-foreground">{completionRate}% of {totalQuestions}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </div>
            <p className={`text-2xl font-semibold ${accuracy >= 70 ? 'text-success' : accuracy >= 50 ? 'text-foreground' : 'text-destructive'}`}>
              {accuracy}%
            </p>
            <p className="text-xs text-muted-foreground">{correctAnswers} correct</p>
          </div>
        </div>
      </div>

      {/* Free Questions Remaining */}
      {remaining > 0 && remaining <= 10 && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{remaining} free questions left</p>
              <p className="text-xs text-muted-foreground">Upgrade for unlimited access</p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Banner */}
      <button
        onClick={() => setShowPaywall(true)}
        className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3 hover:bg-primary/10 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Crown className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground">Upgrade to Premium</p>
          <p className="text-xs text-muted-foreground">Unlimited questions & detailed analytics</p>
        </div>
        <ChevronRight className="w-4 h-4 text-primary" />
      </button>

      {/* Menu Items */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Support
        </p>
        
        <button
          onClick={() => setShowDisclaimer(true)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
        >
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-left text-sm text-foreground">Educational Disclaimer</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <button
          onClick={() => window.open('mailto:support@nclexgo.app', '_blank')}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-left text-sm text-foreground">Help & Support</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <button
          onClick={() => window.open('mailto:feedback@nclexgo.app', '_blank')}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
        >
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-left text-sm text-foreground">Send Feedback</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        NCLEX Go v1.0.0
      </p>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      {/* Disclaimer Modal */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="sm:max-w-md bg-card border-border rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-base">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Educational Disclaimer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              NCLEX Go is designed to help you prepare for the NCLEX-RN examination 
              through practice questions and educational content.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                Not a substitute for professional nursing education
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                Not providing medical advice
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                Not affiliated with NCSBN
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                Not a guarantee of passing the exam
              </li>
            </ul>
            <p className="text-xs">
              Always verify information with authoritative nursing resources.
            </p>
          </div>
          <Button onClick={() => setShowDisclaimer(false)} className="w-full mt-2">
            I Understand
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}