import { X, Crown, Check, Sparkles, Star, Users, Trophy } from 'lucide-react';
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
  { icon: '📚', text: 'Unlimited practice questions' },
  { icon: '🤖', text: 'AI Tutor available 24/7' },
  { icon: '💡', text: 'Detailed explanations' },
  { icon: '🔄', text: 'Smart spaced repetition' },
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

  // Paywall - Beautiful fullscreen design
  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Content container - use grid for precise layout */}
      <div className="h-full grid grid-rows-[auto_1fr_auto] px-5 pt-12 pb-6">
        
        {/* Header section */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Unlock NCLEX Go Pro</h1>
          <p className="text-muted-foreground text-sm mt-1">Join 50,000+ nurses who passed with us</p>
          
          {/* Social proof row */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">94% pass rate</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium">4.9 rating</span>
            </div>
          </div>
        </div>

        {/* Features section - centered in remaining space */}
        <div className="flex items-center justify-center">
          <div className="bg-muted/50 rounded-2xl p-4 w-full max-w-sm">
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <div key={f.text} className="flex items-start gap-2">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm font-medium text-foreground leading-tight">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section - Plans + CTA */}
        <div className="space-y-3 mt-4">
          {/* Plan selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPlan('weekly')}
              className={cn(
                'py-3 rounded-xl border-2 text-center transition-all',
                selectedPlan === 'weekly'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/50'
              )}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Weekly</p>
              <p className="text-xl font-black text-foreground">$4.99</p>
            </button>
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={cn(
                'py-3 rounded-xl border-2 text-center relative transition-all',
                selectedPlan === 'monthly'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/50'
              )}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                SAVE 50%
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly</p>
              <p className="text-xl font-black text-foreground">$9.99</p>
            </button>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubscribe}
            disabled={!user}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            {user ? 'Start 3-Day Free Trial' : 'Sign In to Subscribe'}
          </button>

          {/* Terms */}
          <p className="text-center text-muted-foreground text-[11px]">
            3-day free trial, then {selectedPlan === 'monthly' ? '$9.99/mo' : '$4.99/wk'}. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
