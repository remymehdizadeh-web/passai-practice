-- Fix ai_tutor_cache: Block all client access (edge function uses service role)
DROP POLICY IF EXISTS "Anyone can add to cache" ON public.ai_tutor_cache;
DROP POLICY IF EXISTS "Cache is publicly readable" ON public.ai_tutor_cache;

CREATE POLICY "No public access to cache"
ON public.ai_tutor_cache
FOR ALL
USING (false);

-- Fix issue_reports: Add explicit SELECT deny policy
CREATE POLICY "Issue reports are not publicly readable"
ON public.issue_reports
FOR SELECT
USING (false);

-- Fix review_queue: Replace permissive policies with session-based ones
DROP POLICY IF EXISTS "Users can view their own review queue" ON public.review_queue;
DROP POLICY IF EXISTS "Users can insert into their review queue" ON public.review_queue;
DROP POLICY IF EXISTS "Users can update their own review queue" ON public.review_queue;
DROP POLICY IF EXISTS "Users can delete from their review queue" ON public.review_queue;

CREATE POLICY "Users can view their own review queue"
ON public.review_queue FOR SELECT
USING (session_id = public.get_current_session_id());

CREATE POLICY "Users can insert into their review queue"
ON public.review_queue FOR INSERT
WITH CHECK (session_id = public.get_current_session_id());

CREATE POLICY "Users can update their own review queue"
ON public.review_queue FOR UPDATE
USING (session_id = public.get_current_session_id());

CREATE POLICY "Users can delete from their review queue"
ON public.review_queue FOR DELETE
USING (session_id = public.get_current_session_id());

-- Fix ai_tutor_usage: Replace permissive policies with session-based ones
DROP POLICY IF EXISTS "Users can insert usage" ON public.ai_tutor_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON public.ai_tutor_usage;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.ai_tutor_usage;

CREATE POLICY "Users can view their own usage"
ON public.ai_tutor_usage FOR SELECT
USING (session_id = public.get_current_session_id());

CREATE POLICY "Users can insert usage"
ON public.ai_tutor_usage FOR INSERT
WITH CHECK (session_id = public.get_current_session_id());

CREATE POLICY "Users can update their own usage"
ON public.ai_tutor_usage FOR UPDATE
USING (session_id = public.get_current_session_id());