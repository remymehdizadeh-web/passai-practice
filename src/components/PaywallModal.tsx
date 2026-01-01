import { Button } from '@/components/ui/button';
import { X, Check, Sparkles, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: 'weekly',
    name: 'Weekly',
    price: '$4.99',
    period: '/week',
    popular: false,
    save: null,
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    popular: true,
    save: '50%',
  },
];

const features = [
  'Unlimited practice questions',
  'Smart Review Sessions',
  'Adaptive learning algorithm',
  'Track progress by category',
  'Detailed explanations & rationales',
  'New questions added weekly',
];

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-background/80 paywall-blur"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up safe-bottom">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-4 shadow-premium">
            <Crown className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Unlock Unlimited Practice
          </h2>
          <p className="text-muted-foreground text-sm">
            You've completed your free questions. Subscribe to continue your NCLEX prep.
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-3 mb-6">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                'w-full p-4 rounded-xl border flex items-center justify-between transition-all',
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                  : 'border-border bg-secondary/50 hover:border-muted-foreground/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
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
                    <span className="font-semibold text-foreground">{plan.name}</span>
                    {plan.popular && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                    {plan.save && (
                      <span className="text-xs text-success font-medium">
                        Save {plan.save}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-2">
            {features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button variant="hero" size="xl" className="w-full mb-3">
          <Sparkles className="w-5 h-5" />
          Continue with {plans.find(p => p.id === selectedPlan)?.name}
        </Button>

        {/* Restore Purchases */}
        <button className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          Restore Purchases
        </button>
      </div>
    </div>
  );
}
