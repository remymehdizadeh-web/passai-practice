-- Drop and recreate view with SECURITY INVOKER (default, but explicit)
DROP VIEW IF EXISTS public.subscription_analytics;

CREATE VIEW public.subscription_analytics 
WITH (security_invoker = true) AS
SELECT 
  COUNT(*) FILTER (WHERE event_type = 'INITIAL_PURCHASE') as total_purchases,
  COUNT(*) FILTER (WHERE event_type = 'INITIAL_PURCHASE' AND is_trial = true) as trial_starts,
  COUNT(*) FILTER (WHERE event_type = 'RENEWAL') as renewals,
  COUNT(*) FILTER (WHERE event_type = 'CANCELLATION') as cancellations,
  COUNT(*) FILTER (WHERE event_type = 'EXPIRATION') as expirations,
  COUNT(DISTINCT user_id) as unique_subscribers,
  SUM(price) FILTER (WHERE event_type IN ('INITIAL_PURCHASE', 'RENEWAL') AND is_trial = false) as total_revenue
FROM public.subscription_events
WHERE environment = 'PRODUCTION';