// Session management for anonymous users

const SESSION_KEY = 'nclexgo_session_id';
const QUESTIONS_ANSWERED_KEY = 'nclexgo_questions_answered';
const FREE_QUESTION_LIMIT = 10;

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

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

export function clearProgress(): void {
  localStorage.removeItem(QUESTIONS_ANSWERED_KEY);
  localStorage.removeItem('nclexgo_points');
}
