-- Add confidence column to user_progress
ALTER TABLE public.user_progress 
ADD COLUMN confidence text CHECK (confidence IN ('low', 'medium', 'high'));

-- Create review_queue table for spaced repetition
CREATE TABLE public.review_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  due_at timestamp with time zone NOT NULL DEFAULT now(),
  reason text NOT NULL CHECK (reason IN ('incorrect', 'low_confidence', 'spaced_repetition', 'bookmarked')),
  interval_days integer NOT NULL DEFAULT 1,
  ease_factor numeric(3,2) NOT NULL DEFAULT 2.50,
  review_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(session_id, question_id)
);

-- Enable RLS
ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;

-- Policies for review_queue
CREATE POLICY "Users can view their own review queue"
ON public.review_queue
FOR SELECT
USING (true);

CREATE POLICY "Users can insert into their review queue"
ON public.review_queue
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own review queue"
ON public.review_queue
FOR UPDATE
USING (true);

CREATE POLICY "Users can delete from their review queue"
ON public.review_queue
FOR DELETE
USING (true);

-- Create ai_tutor_cache table to cache AI responses
CREATE TABLE public.ai_tutor_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  query_hash text NOT NULL,
  response text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(question_id, query_hash)
);

-- Enable RLS
ALTER TABLE public.ai_tutor_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cache
CREATE POLICY "Cache is publicly readable"
ON public.ai_tutor_cache
FOR SELECT
USING (true);

-- Anyone can insert to cache
CREATE POLICY "Anyone can add to cache"
ON public.ai_tutor_cache
FOR INSERT
WITH CHECK (true);

-- Create ai_tutor_usage table to track rate limits
CREATE TABLE public.ai_tutor_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(session_id, usage_date)
);

-- Enable RLS
ALTER TABLE public.ai_tutor_usage ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own usage"
ON public.ai_tutor_usage
FOR SELECT
USING (true);

CREATE POLICY "Users can insert usage"
ON public.ai_tutor_usage
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own usage"
ON public.ai_tutor_usage
FOR UPDATE
USING (true);

-- Trigger to update review_queue updated_at
CREATE TRIGGER update_review_queue_updated_at
BEFORE UPDATE ON public.review_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();