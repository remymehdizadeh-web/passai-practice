import { Button } from '@/components/ui/button';
import { X, Check, Sparkles, Crown, Loader2, Zap, Brain, BarChart3, Clock, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: 'weekly' as const,
    name: 'Weekly',
    price: '$4.99',
    period: '/week',
    popular: false,
    save: null,
  },
  {
    id: 'monthly' as const,
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    popular: true,
    save: '50%',
  },
];

const features = [
  { icon: Zap, text: 'Unlimited Questions', description: 'Practice as much as you need', highlight: true },
  { icon: Brain, text: 'AI Tutor', description: 'Get instant explanations from AI', highlight: true },
  { icon: BarChart3, text: 'Smart Review', description: 'Focus on your weak areas automatically', highlight: true },
  { icon: Clock, text: 'Spaced Repetition', description: 'Optimal timing for long-term memory', highlight: false },
  { icon: Shield, text: 'Detailed Rationales', description: 'Understand why answers are correct', highlight: false },
  { icon: Star, text: 'Weekly Updates', description: 'New questions added regularly', highlight: false },
];

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
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content - Compact, no scroll needed */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden animate-scale-in shadow-2xl">
        {/* Compact Hero Header */}
        <div className="relative bg-gradient-to-br from-primary via-accent to-primary/80 p-4 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/20">
              <Crown className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-0.5 drop-shadow-lg">
                {subscribed ? 'Pro Active ✨' : 'Unlock Unlimited'}
              </h2>
              <p className="text-white/90 text-xs font-medium">
                {subscribed 
                  ? 'All premium features unlocked'
                  : 'You\'ve reached your free question limit'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content - No scroll */}
        <div className="p-4 space-y-3">
          {subscribed ? (
            <>
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <span className="font-semibold text-success block text-sm">Pro Subscription Active</span>
                    <span className="text-xs text-muted-foreground">All premium features unlocked</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Manage Subscription'
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Compact Plans */}
              <div className="flex gap-2">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      'flex-1 p-3 rounded-xl border-2 transition-all relative overflow-hidden',
                      selectedPlan === plan.id
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-border bg-card hover:border-muted-foreground/30'
                    )}
                  >
                    {plan.popular && selectedPlan === plan.id && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg">
                        BEST
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-xs font-medium text-muted-foreground block">{plan.name}</span>
                      <span className="text-xl font-black text-foreground">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                      {plan.save && (
                        <span className="block text-xs text-success font-bold mt-0.5">
                          Save {plan.save}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Key Features - Inline */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[
                  { icon: Zap, text: 'Unlimited Questions' },
                  { icon: Brain, text: 'AI Tutor' },
                  { icon: BarChart3, text: 'Smart Review' },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20"
                    >
                      <Icon className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Free Trial Badge */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>3-day free trial • Cancel anytime</span>
              </div>

              {/* CTA Button */}
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full text-base font-black shadow-lg shadow-primary/20"
                onClick={handleSubscribe}
                disabled={isLoading || !user}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {user ? 'Start Free Trial' : 'Sign in to Subscribe'}
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-[10px] text-center text-muted-foreground">
                  Sign in required to start your trial
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
