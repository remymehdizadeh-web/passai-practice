import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// App Store subscription tiers (RevenueCat product IDs)
export const SUBSCRIPTION_TIERS = {
  weekly: {
    product_id: 'nclex_pro_weekly',
    name: 'Weekly',
    price: 4.99,
    interval: 'week',
  },
  monthly: {
    product_id: 'nclex_pro_monthly',
    name: 'Monthly',
    price: 9.99,
    interval: 'month',
  },
} as const;

export interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  tier: 'weekly' | 'monthly' | null;
  isLoading: boolean;
  isTrialing: boolean;
  trialEnd: string | null;
  trialDaysRemaining: number | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    tier: null,
    isLoading: true,
    isTrialing: false,
    trialEnd: null,
    trialDaysRemaining: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus({
        subscribed: false,
        productId: null,
        subscriptionEnd: null,
        tier: null,
        isLoading: false,
        isTrialing: false,
        trialEnd: null,
        trialDaysRemaining: null,
      });
      return;
    }

    try {
      // Check subscription_events table for active subscription
      const { data: events, error } = await supabase
        .from('subscription_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking subscription:', error);
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const latestEvent = events?.[0];
      
      if (!latestEvent) {
        setStatus({
          subscribed: false,
          productId: null,
          subscriptionEnd: null,
          tier: null,
          isLoading: false,
          isTrialing: false,
          trialEnd: null,
          trialDaysRemaining: null,
        });
        return;
      }

      // Check if subscription is still active
      const isActive = latestEvent.expiration_at 
        ? new Date(latestEvent.expiration_at) > new Date()
        : false;
      
      const isCancelled = ['CANCELLATION', 'EXPIRATION'].includes(latestEvent.event_type);
      const subscribed = isActive && !isCancelled;
      
      // Determine tier based on product_id
      let tier: 'weekly' | 'monthly' | null = null;
      if (latestEvent.product_id?.includes('weekly')) {
        tier = 'weekly';
      } else if (latestEvent.product_id?.includes('monthly')) {
        tier = 'monthly';
      }

      // Calculate trial days remaining
      let trialDaysRemaining: number | null = null;
      if (latestEvent.is_trial && latestEvent.expiration_at) {
        const trialEndDate = new Date(latestEvent.expiration_at);
        const now = new Date();
        trialDaysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }

      setStatus({
        subscribed,
        productId: latestEvent.product_id,
        subscriptionEnd: latestEvent.expiration_at,
        tier,
        isLoading: false,
        isTrialing: latestEvent.is_trial || false,
        trialEnd: latestEvent.is_trial ? latestEvent.expiration_at : null,
        trialDaysRemaining,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  // Check on mount and when user changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh periodically (every minute)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  // Placeholder for native in-app purchase - will be handled by RevenueCat SDK
  const startPurchase = async (productId: string) => {
    console.log('Native purchase will be handled by RevenueCat SDK:', productId);
    // This will be replaced with RevenueCat SDK call in the native app
  };

  // Placeholder for managing subscription - opens App Store subscriptions
  const manageSubscription = async () => {
    // On iOS, this would deep link to Settings > Subscriptions
    // On Android, this would open Play Store subscriptions
    console.log('Opening native subscription management...');
  };

  return {
    ...status,
    checkSubscription,
    startPurchase,
    manageSubscription,
  };
}
