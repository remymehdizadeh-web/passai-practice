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
      
      {/* Modal Content - Fixed height with scroll */}
      <div className="relative z-10 w-full max-w-md max-h-[90vh] bg-card border border-border rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up safe-bottom flex flex-col">
        {/* Hero Header with animated gradient */}
        <div className="relative bg-gradient-to-br from-primary via-accent to-primary/80 p-6 pb-8 shrink-0 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge with shine effect */}
          <div className="relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/25 backdrop-blur-sm text-white text-xs font-bold mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <Sparkles className="w-4 h-4" />
            3-Day Free Trial
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/20">
              <Crown className="w-9 h-9 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-1 drop-shadow-lg">
                {subscribed ? 'Pro Active ✨' : 'Go Pro Today'}
              </h2>
              <p className="text-white/90 text-sm font-medium">
                {subscribed 
                  ? 'All premium features unlocked'
                  : 'Pass NCLEX on your first try'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 space-y-4">
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
                {/* Social Proof */}
                <div className="flex items-center justify-center gap-1 text-center">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 border-2 border-card flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    Trusted by <span className="font-bold text-foreground">10,000+</span> nursing students
                  </span>
                </div>

                {/* Plans */}
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all relative overflow-hidden',
                        selectedPlan === plan.id
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                          : 'border-border bg-card hover:border-muted-foreground/30'
                      )}
                    >
                      {plan.popular && selectedPlan === plan.id && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-bl-lg">
                          BEST VALUE
                        </div>
                      )}
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
                          </div>
                          {plan.save && (
                            <span className="text-xs text-success font-bold">
                              Save {plan.save}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-foreground">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Features - Compact Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {features.slice(0, 4).map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div 
                        key={index} 
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-xl border",
                          feature.highlight 
                            ? "bg-primary/5 border-primary/20" 
                            : "bg-muted/30 border-border"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          feature.highlight ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "w-4 h-4",
                            feature.highlight ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <span className="text-xs font-semibold text-foreground leading-tight">
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sticky CTA Footer */}
        {!subscribed && (
          <div className="shrink-0 p-4 pt-2 border-t border-border bg-card/95 backdrop-blur-sm">
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full text-base font-black shadow-lg shadow-primary/20"
              onClick={handleSubscribe}
              disabled={isLoading || !user}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {user ? 'Start Free Trial →' : 'Sign in to Subscribe'}
                </>
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground mt-2">
              {user 
                ? 'Cancel anytime • No charges until day 4'
                : 'Sign in required to start your trial'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
