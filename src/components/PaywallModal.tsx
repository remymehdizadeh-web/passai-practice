import { Button } from '@/components/ui/button';
import { X, Sparkles, Crown, Star, Infinity, Brain, BookOpen, TrendingUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    toast.info('In-app purchase will be available in the native app');
  };

  const handleManageSubscription = async () => {
    await manageSubscription();
    toast.info('Subscription management will be available in the native app');
  };

  // Subscribed state - simple centered modal
  if (subscribed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm bg-card rounded-2xl p-6 space-y-4 text-center animate-scale-in shadow-2xl border border-border">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">You're a Pro!</h2>
            <p className="text-muted-foreground">All features unlocked</p>
          </div>
          <Button onClick={handleManageSubscription} className="w-full" size="lg">
            Manage Subscription
          </Button>
        </div>
      </div>
    );
  }

  // Paywall - FULLSCREEN takeover like real apps
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-primary via-primary/95 to-accent flex flex-col animate-in fade-in duration-200">
      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 flex items-center justify-center"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Main content - centered vertically */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-safe">
        {/* Hero */}
        <div className="text-center text-white mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Crown className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-black mb-1">Unlock Pro</h1>
          <p className="text-white/80 text-sm">Start your 3-day free trial</p>
        </div>

        {/* Features list */}
        <div className="space-y-2.5 mb-6">
          {[
            { icon: Infinity, text: 'Unlimited practice questions' },
            { icon: Brain, text: 'AI Tutor for instant help' },
            { icon: BookOpen, text: 'Detailed rationales' },
            { icon: TrendingUp, text: 'Smart review system' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-medium text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-xl font-black text-white">94%</p>
            <p className="text-[10px] text-white/70">Pass Rate</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="text-center">
            <p className="text-xl font-black text-white flex items-center gap-1">
              4.9 <Star className="w-4 h-4 fill-white text-white" />
            </p>
            <p className="text-[10px] text-white/70">Rating</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="text-center">
            <p className="text-xl font-black text-white">50K+</p>
            <p className="text-[10px] text-white/70">Students</p>
          </div>
        </div>

        {/* Plan selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setSelectedPlan('weekly')}
            className={cn(
              'p-3 rounded-xl border-2 transition-all text-center bg-white/10 backdrop-blur-sm',
              selectedPlan === 'weekly'
                ? 'border-white bg-white/20'
                : 'border-white/30 hover:border-white/50'
            )}
          >
            <p className="text-[10px] text-white/70 uppercase tracking-wide">Weekly</p>
            <p className="text-xl font-black text-white">$4.99</p>
            <p className="text-[10px] text-white/60">per week</p>
          </button>
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={cn(
              'p-3 rounded-xl border-2 transition-all text-center relative bg-white/10 backdrop-blur-sm',
              selectedPlan === 'monthly'
                ? 'border-white bg-white/20'
                : 'border-white/30 hover:border-white/50'
            )}
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white text-primary text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              SAVE 50%
            </div>
            <p className="text-[10px] text-white/70 uppercase tracking-wide">Monthly</p>
            <p className="text-xl font-black text-white">$9.99</p>
            <p className="text-[10px] text-white/60">per month</p>
          </button>
        </div>

        {/* CTA Button */}
        <Button 
          size="lg" 
          className="w-full font-bold text-base py-6 bg-white text-primary hover:bg-white/90 shadow-xl"
          onClick={handleSubscribe}
          disabled={!user}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {user ? 'Start Free Trial' : 'Sign In to Continue'}
        </Button>
        
        <p className="text-[11px] text-center text-white/60 mt-3">
          Cancel anytime • No charge for 3 days
        </p>
      </div>
    </div>
  );
}
