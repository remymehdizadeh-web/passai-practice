import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaywallModal } from '@/components/PaywallModal';
import { 
  Crown, 
  HelpCircle, 
  FileText, 
  Mail, 
  ExternalLink,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useUserProgress } from '@/hooks/useQuestions';
import { getRemainingFreeQuestions } from '@/lib/session';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function SettingsView() {
  const { data: progress } = useUserProgress();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const remaining = getRemainingFreeQuestions();
  const totalAnswered = progress?.length || 0;
  const correctAnswers = progress?.filter((p) => p.is_correct).length || 0;
  const accuracy = totalAnswered > 0 
    ? Math.round((correctAnswers / totalAnswered) * 100) 
    : 0;

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
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      {/* Stats Card */}
      <div className="card-premium rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Your Progress
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalAnswered}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{remaining}</p>
            <p className="text-xs text-muted-foreground">Free Left</p>
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      {remaining > 0 && (
        <button
          onClick={() => setShowPaywall(true)}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 mb-6 flex items-center gap-4 hover:from-primary/25 hover:to-primary/10 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Upgrade to Premium</p>
            <p className="text-sm text-muted-foreground">
              Unlock unlimited questions and detailed analytics
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full p-4 rounded-xl bg-card border border-border flex items-center gap-4 hover:border-muted-foreground/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              item.accent ? 'bg-primary/10' : 'bg-muted'
            }`}>
              <item.icon className={`w-5 h-5 ${
                item.accent ? 'text-primary' : 'text-muted-foreground'
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
        <DialogContent className="sm:max-w-md bg-card border-border">
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
                <strong>NOT providing medical advice</strong> - Do not use content 
                from this app to make clinical decisions
              </li>
              <li>
                <strong>NOT affiliated with NCSBN</strong> or any official NCLEX 
                examination body
              </li>
              <li>
                <strong>NOT a guarantee of passing</strong> the NCLEX-RN examination
              </li>
            </ul>
            <p>
              Always verify information with authoritative nursing resources and 
              your educational institution. The practice questions are designed to 
              simulate NCLEX-style items but may not reflect actual examination content.
            </p>
            <p>
              If you have questions about patient care, always consult with a 
              qualified healthcare professional.
            </p>
          </div>
          <Button onClick={() => setShowDisclaimer(false)} className="w-full mt-4">
            I Understand
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
