import { Button } from '@/components/ui/button';
import { X, Check, Sparkles, Crown, Loader2, Zap, Brain, Target, TrendingUp } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const { createCheckout, subscribed, openCustomerPortal } = useSubscription();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setIsLoading(true);
    try {
      const priceId = SUBSCRIPTION_TIERS[selectedPlan].price_id;
      await createCheckout(priceId);
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      await openCustomerPortal();
      onClose();
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open subscription management.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-card rounded-3xl overflow-hidden animate-scale-in shadow-2xl border border-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors z-20"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {subscribed ? (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold">You're a Pro!</h2>
              <p className="text-muted-foreground mt-1">All premium features are unlocked</p>
            </div>
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Manage Subscription'}
            </Button>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary to-accent p-6 text-center text-white">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                <Crown className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black mb-1">Pass NCLEX Guaranteed</h2>
              <p className="text-white/80 text-sm">Join 10,000+ nurses who passed on their first try</p>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* What You Get */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">What you get</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Zap, title: 'Unlimited Practice Questions', desc: 'Access our entire 2,000+ question bank' },
                    { icon: Brain, title: 'AI-Powered Tutor', desc: 'Get instant explanations for any question' },
                    { icon: Target, title: 'Personalized Study Plan', desc: 'Focus on your weak areas automatically' },
                    { icon: TrendingUp, title: 'Track Your Progress', desc: 'See your readiness score improve daily' },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Choose your plan</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedPlan('weekly')}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all text-center',
                      selectedPlan === 'weekly'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <p className="text-xs text-muted-foreground">Weekly</p>
                    <p className="text-xl font-black">$4.99</p>
                    <p className="text-xs text-muted-foreground">/week</p>
                  </button>
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all text-center relative',
                      selectedPlan === 'monthly'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SAVE 50%
                    </div>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                    <p className="text-xl font-black">$9.99</p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full text-base font-bold"
                  onClick={handleSubscribe}
                  disabled={isLoading || !user}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {user ? 'Start 3-Day Free Trial' : 'Sign In to Start Trial'}
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-success" />
                    Cancel anytime
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-success" />
                    No charge for 3 days
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
