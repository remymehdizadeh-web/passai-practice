import { Button } from '@/components/ui/button';
import { X, Check, Sparkles, Crown, Loader2, Star } from 'lucide-react';
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Compact */}
      <div className="relative z-10 w-full max-w-xs bg-card rounded-2xl overflow-hidden animate-scale-in shadow-2xl border border-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {subscribed ? (
          <div className="p-5 space-y-4 text-center">
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
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary to-accent p-5 text-center text-white">
              <Crown className="w-10 h-10 mx-auto mb-2 drop-shadow-lg" />
              <h2 className="text-xl font-black">Unlock Full Access</h2>
              <p className="text-white/80 text-xs mt-1">Unlimited questions & AI tutor</p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-black text-primary">94%</p>
                  <p className="text-[10px] text-muted-foreground">Pass Rate</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-black text-primary">10K+</p>
                  <p className="text-[10px] text-muted-foreground">Students</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-black text-primary">4.9</p>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-primary text-primary" /> Rating
                  </p>
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
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPlan('weekly')}
                  className={cn(
                    'p-2.5 rounded-xl border-2 transition-all text-center',
                    selectedPlan === 'weekly'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  <p className="text-[10px] text-muted-foreground">Weekly</p>
                  <p className="text-lg font-black">$4.99</p>
                </button>
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={cn(
                    'p-2.5 rounded-xl border-2 transition-all text-center relative',
                    selectedPlan === 'monthly'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-success text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    BEST
                  </div>
                  <p className="text-[10px] text-muted-foreground">Monthly</p>
                  <p className="text-lg font-black">$9.99</p>
                </button>
              </div>

              {/* CTA */}
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full font-bold"
                onClick={handleSubscribe}
                disabled={isLoading || !user}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {user ? 'Start Free Trial' : 'Sign In'}
                  </>
                )}
              </Button>
              
              <p className="text-[10px] text-center text-muted-foreground">
                3-day free trial • Cancel anytime
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
