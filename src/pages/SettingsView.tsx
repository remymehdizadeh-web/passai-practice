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
  LogIn
} from 'lucide-react';
import { useUserProgress } from '@/hooks/useQuestions';
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    {
      icon: Crown,
      label: 'Manage Subscription',
      description: 'View or change your plan',
      onClick: () => setShowPaywall(true),
      accent: true,
    },
    {
      icon: FileText,
      label: 'Educational Disclaimer',
      description: 'Important information',
      onClick: () => setShowDisclaimer(true),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help with PassAI',
      onClick: () => window.open('mailto:support@passai.app', '_blank'),
    },
    {
      icon: Mail,
      label: 'Send Feedback',
      description: 'We love hearing from you',
      onClick: () => window.open('mailto:feedback@passai.app', '_blank'),
    },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bento-cell mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      </div>

      {/* Account Section */}
      {user ? (
        <div className="bento-cell mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">Signed in</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/auth')}
          className="w-full bento-cell mb-6 flex items-center gap-4 hover:shadow-glass transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <LogIn className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Sign in or create account</p>
            <p className="text-sm text-muted-foreground">Save your progress across devices</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Stats */}
      <div className="bento-cell mb-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Your Progress
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 rounded-xl bg-muted/40">
            <p className="text-2xl font-semibold text-foreground">{totalAnswered}</p>
            <p className="text-xs text-muted-foreground mt-1">Questions</p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--success) / 0.1)' }}>
            <p className="text-2xl font-semibold text-success">{accuracy}%</p>
            <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/40">
            <p className="text-2xl font-semibold text-foreground">{remaining}</p>
            <p className="text-xs text-muted-foreground mt-1">Free Left</p>
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      {remaining > 0 && (
        <button
          onClick={() => setShowPaywall(true)}
          className="w-full bento-cell mb-6 flex items-center gap-4 hover:shadow-glass transition-all"
          style={{ background: 'linear-gradient(135deg, hsl(var(--accent) / 0.08) 0%, hsl(var(--accent) / 0.02) 100%)' }}
        >
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
            <Crown className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Upgrade to Premium</p>
            <p className="text-sm text-muted-foreground">Unlimited questions & analytics</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full bento-cell flex items-center gap-4 hover:shadow-glass transition-all"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              item.accent ? 'bg-accent/10' : 'bg-muted/50'
            }`}>
              <item.icon className={`w-5 h-5 ${
                item.accent ? 'text-accent' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        PassAI v1.0.0
      </p>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      {/* Disclaimer Modal */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Educational Disclaimer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">For Educational Purposes Only</strong>
            </p>
            <p>
              PassAI is designed to help you prepare for the NCLEX-RN examination 
              through practice questions and educational content. This app is:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>NOT a substitute for professional nursing education</strong>
              </li>
              <li>
                <strong>NOT providing medical advice</strong>
              </li>
              <li>
                <strong>NOT affiliated with NCSBN</strong>
              </li>
              <li>
                <strong>NOT a guarantee of passing</strong>
              </li>
            </ul>
            <p>
              Always verify information with authoritative nursing resources and 
              your educational institution.
            </p>
          </div>
          <Button onClick={() => setShowDisclaimer(false)} className="w-full mt-4 rounded-xl">
            I Understand
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
