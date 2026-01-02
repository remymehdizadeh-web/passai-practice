// Session management for anonymous users
import { supabase } from '@/integrations/supabase/client';
import { getSessionSupabase } from './supabaseWithSession';
import { getSessionId } from './sessionId';

// Re-export getSessionId for backwards compatibility
export { getSessionId } from './sessionId';

const QUESTIONS_ANSWERED_KEY = 'nclexgo_questions_answered';
const FREE_QUESTION_LIMIT = 10;

const getSessionSupabaseLazy = () => {
  return getSessionSupabase();
};

export function getQuestionsAnswered(): number {
  const count = localStorage.getItem(QUESTIONS_ANSWERED_KEY);
  return count ? parseInt(count, 10) : 0;
}

export function incrementQuestionsAnswered(): number {
  const current = getQuestionsAnswered();
  const newCount = current + 1;
  localStorage.setItem(QUESTIONS_ANSWERED_KEY, newCount.toString());
  return newCount;
}

export function shouldShowPaywall(): boolean {
  return getQuestionsAnswered() >= FREE_QUESTION_LIMIT;
}

export function getRemainingFreeQuestions(): number {
  const answered = getQuestionsAnswered();
  return Math.max(0, FREE_QUESTION_LIMIT - answered);
}

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem('nclexgo_onboarding_seen') === 'true';
}

export function markOnboardingSeen(): void {
  localStorage.setItem('nclexgo_onboarding_seen', 'true');
}

export async function clearAllProgress(): Promise<void> {
  const sessionId = getSessionId();
  const sessionSupabase = getSessionSupabaseLazy();
  
  // Clear database tables - use session client for bookmarks
  await Promise.all([
    sessionSupabase.from('user_progress').delete().eq('session_id', sessionId),
    sessionSupabase.from('review_queue').delete().eq('session_id', sessionId),
    sessionSupabase.from('bookmarks').delete().eq('session_id', sessionId),
    sessionSupabase.from('ai_tutor_usage').delete().eq('session_id', sessionId),
  ]);
  
  // Clear localStorage
  localStorage.removeItem(QUESTIONS_ANSWERED_KEY);
  localStorage.removeItem('nclexgo_points');
}
