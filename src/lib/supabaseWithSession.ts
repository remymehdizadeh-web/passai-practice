import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getSessionId } from './sessionId';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Creates a Supabase client with the session ID header set.
 * This is required for RLS policies that filter by session_id.
 * 
 * Use this client for all operations on session-scoped tables like:
 * - bookmarks
 * - user_progress (will be updated)
 * - review_queue (will be updated)
 * - ai_tutor_usage (will be updated)
 */
export function createSessionClient() {
  const sessionId = getSessionId();
  
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-session-id': sessionId,
      },
    },
  });
}

// Singleton instance - will use the session ID from when it was first created
let sessionClient: ReturnType<typeof createSessionClient> | null = null;

/**
 * Gets a Supabase client with session headers.
 * Creates one if it doesn't exist.
 */
export function getSessionSupabase() {
  if (!sessionClient) {
    sessionClient = createSessionClient();
  }
  return sessionClient;
}

/**
 * Resets the session client (useful if session ID changes)
 */
export function resetSessionClient() {
  sessionClient = null;
}
