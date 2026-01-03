import { Button } from '@/components/ui/button';
import { X, Check, Sparkles, Crown, Loader2, Star, Infinity, Brain, BookOpen, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { shouldShowPaywall } from '@/lib/session';
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
      // Don't close the modal - let user see checkout opened
      toast.success('Checkout opened in new tab');
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Bottom sheet on mobile, centered on desktop */}
      <div className="relative z-10 w-full sm:max-w-sm bg-card sm:rounded-2xl rounded-t-2xl overflow-hidden animate-scale-in shadow-2xl border border-border max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {subscribed ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold">You're a Pro!</h2>
              <p className="text-sm text-muted-foreground">All features unlocked</p>
            </div>
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manage Subscription'}
            </Button>
          </div>
        ) : (
          <>
            {/* Hero - Compact */}
            <div className="bg-gradient-to-br from-primary to-accent p-4 text-center text-white shrink-0">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Crown className="w-6 h-6 drop-shadow-lg" />
                <h2 className="text-lg font-black">{shouldShowPaywall() ? "Limit Reached" : "Upgrade to Pro"}</h2>
              </div>
              <p className="text-white/80 text-xs">Unlock unlimited access • 3-day free trial</p>
            </div>

            {/* Content - Compact for mobile */}
            <div className="p-4 space-y-3 overflow-y-auto">
              {/* What you get - 2x2 compact grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Infinity className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium">Unlimited Questions</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Brain className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium">AI Tutor Access</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium">Detailed Rationales</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium">Smart Review</span>
                </div>
              </div>

              {/* Social proof - compact */}
              <div className="flex items-center justify-center gap-4 py-1">
                <div className="text-center">
                  <p className="text-base font-black text-primary">94%</p>
                  <p className="text-[9px] text-muted-foreground">Pass Rate</p>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="text-center">
                  <p className="text-base font-black text-primary flex items-center justify-center gap-0.5">
                    4.9 <Star className="w-3 h-3 fill-primary text-primary" />
                  </p>
                  <p className="text-[9px] text-muted-foreground">Rating</p>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="text-center">
                  <p className="text-base font-black text-primary">10K+</p>
                  <p className="text-[9px] text-muted-foreground">Students</p>
                </div>
              </div>

              {/* Plans - side by side compact */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPlan('weekly')}
                  className={cn(
                    'p-2.5 rounded-xl border-2 transition-all text-center',
                    selectedPlan === 'weekly'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="text-[9px] text-muted-foreground">Weekly</p>
                  <p className="text-lg font-black">$4.99</p>
                  <p className="text-[8px] text-muted-foreground">per week</p>
                </button>
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={cn(
                    'p-2.5 rounded-xl border-2 transition-all text-center relative',
                    selectedPlan === 'monthly'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-success text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    BEST VALUE
                  </div>
                  <p className="text-[9px] text-muted-foreground">Monthly</p>
                  <p className="text-lg font-black">$9.99</p>
                  <p className="text-[8px] text-muted-foreground">per month</p>
                </button>
              </div>

              {/* CTA */}
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full font-bold text-sm py-5"
                onClick={handleSubscribe}
                disabled={isLoading || !user}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {user ? 'Start 3-Day Free Trial' : 'Sign In to Continue'}
                  </>
                )}
              </Button>
              
              <p className="text-[10px] text-center text-muted-foreground pb-1">
                ✓ Cancel anytime • ✓ No charge for 3 days
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}