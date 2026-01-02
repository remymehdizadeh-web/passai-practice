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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-background/80 paywall-blur"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up safe-bottom">
        {/* Hero Header with Gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-accent p-6 pb-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            3-Day Free Trial
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {subscribed ? 'Manage Subscription' : 'Upgrade to Pro'}
              </h2>
              <p className="text-white/80 text-sm">
                {subscribed 
                  ? 'You have an active Pro subscription.'
                  : 'Unlock your full NCLEX prep potential'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {subscribed ? (
            <>
              {/* Subscribed State */}
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <span className="font-semibold text-success block">Pro Subscription Active</span>
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
              {/* Plans */}
              <div className="space-y-2">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all',
                      selectedPlan === plan.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card hover:border-muted-foreground/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedPlan === plan.id
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/50'
                      )}>
                        {selectedPlan === plan.id && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{plan.name}</span>
                          {plan.popular && (
                            <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase">
                              Best Value
                            </span>
                          )}
                        </div>
                        {plan.save && (
                          <span className="text-xs text-success font-semibold">
                            Save {plan.save}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-foreground">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Features Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">What's included in Pro:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div 
                        key={index} 
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                          feature.highlight 
                            ? "bg-primary/5 border-primary/20" 
                            : "bg-muted/30 border-border"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          feature.highlight ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "w-4.5 h-4.5",
                            feature.highlight ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-semibold",
                            feature.highlight ? "text-foreground" : "text-foreground/80"
                          )}>
                            {feature.text}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                        {feature.highlight && (
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full"
                onClick={handleSubscribe}
                disabled={isLoading || !user}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {user ? 'Start 3-Day Free Trial' : 'Sign in to Subscribe'}
                  </>
                )}
              </Button>

              {user && (
                <p className="text-[11px] text-center text-muted-foreground">
                  Cancel anytime during your trial. No charges until day 4.
                </p>
              )}

              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  You need to sign in before subscribing
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
