-- Drop existing insecure RLS policies on user_progress
DROP POLICY IF EXISTS "Anyone can insert progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can read their own progress" ON public.user_progress;

-- Create secure RLS policies that filter by session_id
-- Users can only read their own progress (matching session_id from header)
CREATE POLICY "Users can read their own progress"
ON public.user_progress
FOR SELECT
USING (session_id = public.get_current_session_id());

-- Users can only insert progress with their own session_id
CREATE POLICY "Users can insert their own progress"
ON public.user_progress
FOR INSERT
WITH CHECK (session_id = public.get_current_session_id());