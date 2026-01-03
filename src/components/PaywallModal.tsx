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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Centered with max-height */}
      <div className="relative z-10 w-full max-w-sm bg-card rounded-2xl overflow-hidden animate-scale-in shadow-2xl border border-border max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
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
            {/* Hero with limit message */}
            <div className="bg-gradient-to-br from-primary to-accent p-5 text-center text-white shrink-0">
              {shouldShowPaywall() && (
                <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-bold mb-3">
                  <span>🎯</span> Limit Reached
                </div>
              )}
              <Crown className="w-10 h-10 mx-auto mb-2 drop-shadow-lg" />
              <h2 className="text-xl font-black">{shouldShowPaywall() ? "You've used all 10 free questions" : "Upgrade to Pro"}</h2>
              <p className="text-white/80 text-sm mt-1">Unlock unlimited access to keep studying</p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* What you get */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What you get</p>
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
                    <span className="text-xs font-medium">Progress Tracking</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-center gap-6 py-2">
                <div className="text-center">
                  <p className="text-lg font-black text-primary">94%</p>
                  <p className="text-[10px] text-muted-foreground">Pass Rate</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-lg font-black text-primary flex items-center justify-center gap-0.5">
                    4.9 <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                  </p>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Testimonial */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-foreground italic leading-relaxed">
                  "Passed on my first try! The AI tutor helped me understand concepts I struggled with for months."
                </p>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">— Sarah M., RN</p>
              </div>

              {/* Plans */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedPlan('weekly')}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all text-center',
                    selectedPlan === 'weekly'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="text-[10px] text-muted-foreground">Weekly</p>
                  <p className="text-xl font-black">$4.99</p>
                  <p className="text-[9px] text-muted-foreground">per week</p>
                </button>
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all text-center relative',
                    selectedPlan === 'monthly'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-success text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    SAVE 50%
                  </div>
                  <p className="text-[10px] text-muted-foreground">Monthly</p>
                  <p className="text-xl font-black">$9.99</p>
                  <p className="text-[9px] text-muted-foreground">per month</p>
                </button>
              </div>

              {/* CTA */}
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full font-bold text-base"
                onClick={handleSubscribe}
                disabled={isLoading || !user}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {user ? 'Start Free Trial' : 'Sign In to Continue'}
                  </>
                )}
              </Button>
              
              <p className="text-[11px] text-center text-muted-foreground">
                ✓ 3-day free trial • ✓ Cancel anytime • ✓ Instant access
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}