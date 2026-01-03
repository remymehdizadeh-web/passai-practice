import { X, Crown, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURES = [
  'Unlimited practice questions',
  'AI Tutor available 24/7',
  'Detailed explanations',
  'Smart spaced repetition',
];

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('monthly');
  const { subscribed, startPurchase, manageSubscription } = useSubscription();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }
    const productId = SUBSCRIPTION_TIERS[selectedPlan].product_id;
    await startPurchase(productId);
    toast.info('In-app purchase available in the native app');
  };

  // Already subscribed view
  if (subscribed) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're a Pro!</h2>
          <p className="text-muted-foreground mb-6">All features unlocked</p>
          <button
            onClick={() => { manageSubscription(); onClose(); }}
            className="btn-premium text-primary-foreground px-8 py-4 text-lg"
          >
            Manage Subscription
          </button>
        </div>
      </div>
    );
  }

  // Paywall - FULLSCREEN, NO SCROLL
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-primary via-primary to-accent flex flex-col">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Top section - Icon + Title */}
      <div className="pt-16 pb-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white">Go Pro</h1>
        <p className="text-white/70 text-sm mt-1">3-day free trial • Cancel anytime</p>
      </div>

      {/* Middle - Features */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="space-y-3 w-full max-w-xs">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-medium">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom - Plans + CTA */}
      <div className="px-6 pb-8 space-y-4">
        {/* Plan selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedPlan('weekly')}
            className={cn(
              'py-4 rounded-2xl border-2 text-center transition-all',
              selectedPlan === 'weekly'
                ? 'border-white bg-white/20'
                : 'border-white/30 bg-white/10'
            )}
          >
            <p className="text-xs text-white/60 uppercase tracking-wide">Weekly</p>
            <p className="text-2xl font-black text-white">$4.99</p>
          </button>
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={cn(
              'py-4 rounded-2xl border-2 text-center relative transition-all',
              selectedPlan === 'monthly'
                ? 'border-white bg-white/20'
                : 'border-white/30 bg-white/10'
            )}
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-primary text-xs font-bold px-3 py-0.5 rounded-full">
              BEST VALUE
            </div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Monthly</p>
            <p className="text-2xl font-black text-white">$9.99</p>
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={!user}
          className="w-full py-5 rounded-2xl bg-white text-primary font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Sparkles className="w-5 h-5" />
          {user ? 'Start Free Trial' : 'Sign In First'}
        </button>

        {/* Terms */}
        <p className="text-center text-white/50 text-xs">
          Payment charged after trial ends. Cancel anytime in settings.
        </p>
      </div>
    </div>
  );
}
