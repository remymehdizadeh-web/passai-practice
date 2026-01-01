import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Stripe price/product mapping
export const SUBSCRIPTION_TIERS = {
  weekly: {
    price_id: 'price_1Skv5UPiNbm75vyPgDiVlJzT',
    product_id: 'prod_TiLnO9OwG9nD3M',
    name: 'Weekly',
    price: 4.99,
    interval: 'week',
  },
  monthly: {
    price_id: 'price_1Skv5gPiNbm75vyPZEiE8GAR',
    product_id: 'prod_TiLnvdsJ9D0GdT',
    name: 'Monthly',
    price: 9.99,
    interval: 'month',
  },
} as const;

export interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
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
    priceId: null,
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
        priceId: null,
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Determine tier based on product_id
      let tier: 'weekly' | 'monthly' | null = null;
      if (data.product_id === SUBSCRIPTION_TIERS.weekly.product_id) {
        tier = 'weekly';
      } else if (data.product_id === SUBSCRIPTION_TIERS.monthly.product_id) {
        tier = 'monthly';
      }

      // Calculate trial days remaining
      let trialDaysRemaining: number | null = null;
      if (data.is_trialing && data.trial_end) {
        const trialEndDate = new Date(data.trial_end);
        const now = new Date();
        trialDaysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }

      setStatus({
        subscribed: data.subscribed,
        productId: data.product_id,
        priceId: data.price_id,
        subscriptionEnd: data.subscription_end,
        tier,
        isLoading: false,
        isTrialing: data.is_trialing || false,
        trialEnd: data.trial_end || null,
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

  const createCheckout = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  return {
    ...status,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
}