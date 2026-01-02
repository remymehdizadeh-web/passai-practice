-- Drop existing insecure RLS policies on bookmarks
DROP POLICY IF EXISTS "Anyone can insert bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can read their own bookmarks" ON public.bookmarks;

-- Create a function to get the current session_id from request headers
-- This allows secure filtering by session_id passed from the client
CREATE OR REPLACE FUNCTION public.get_current_session_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  );
$$;

-- Create secure RLS policies that filter by session_id
-- Users can only read their own bookmarks (matching session_id from header)
CREATE POLICY "Users can read their own bookmarks"
ON public.bookmarks
FOR SELECT
USING (session_id = public.get_current_session_id());

-- Users can only insert bookmarks with their own session_id
CREATE POLICY "Users can insert their own bookmarks"
ON public.bookmarks
FOR INSERT
WITH CHECK (session_id = public.get_current_session_id());

-- Users can only delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarks
FOR DELETE
USING (session_id = public.get_current_session_id());