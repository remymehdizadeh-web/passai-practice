-- Create subscription events table to store all RevenueCat webhook data
CREATE TABLE public.subscription_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT UNIQUE, -- RevenueCat event ID to prevent duplicates
  event_type TEXT NOT NULL, -- INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.
  user_id TEXT, -- RevenueCat app_user_id (maps to your user)
  product_id TEXT,
  price DECIMAL(10,2),
  currency TEXT,
  store TEXT, -- APP_STORE, PLAY_STORE
  environment TEXT, -- SANDBOX or PRODUCTION
  is_trial BOOLEAN DEFAULT false,
  expiration_at TIMESTAMP WITH TIME ZONE,
  original_purchase_date TIMESTAMP WITH TIME ZONE,
  raw_payload JSONB, -- Store full webhook for debugging
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX idx_subscription_events_event_type ON public.subscription_events(event_type);
CREATE INDEX idx_subscription_events_created_at ON public.subscription_events(created_at DESC);
CREATE INDEX idx_subscription_events_product_id ON public.subscription_events(product_id);

-- Enable RLS
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view subscription events (for dashboard)
CREATE POLICY "Admins can view subscription events"
ON public.subscription_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- No public access - only edge function with service role can insert
CREATE POLICY "No public insert"
ON public.subscription_events
FOR INSERT
WITH CHECK (false);

-- Create a view for subscription analytics
CREATE VIEW public.subscription_analytics AS
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