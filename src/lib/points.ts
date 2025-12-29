// Points and gamification system

const POINTS_KEY = 'nclexgo_points';
const CORRECT_STREAK_KEY = 'nclexgo_correct_streak';
const ANSWER_START_TIME_KEY = 'nclexgo_answer_start_time';

export const POINTS_BASE = 100; // Base points for correct answer
export const STREAK_BONUS_THRESHOLD = 3; // Bonus starts at 3 correct in a row
export const STREAK_BONUS_MULTIPLIER = 0.25; // 25% bonus per streak level
export const TIME_BONUS_MAX = 50; // Max time bonus points
export const TIME_BONUS_THRESHOLD_SECONDS = 30; // Full bonus if answered within this time

export function getPoints(): number {
  const stored = localStorage.getItem(POINTS_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function addPoints(points: number): number {
  const current = getPoints();
  const newTotal = current + points;
  localStorage.setItem(POINTS_KEY, newTotal.toString());
  return newTotal;
}

export function getCorrectStreak(): number {
  const stored = localStorage.getItem(CORRECT_STREAK_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function incrementStreak(): number {
  const current = getCorrectStreak();
  const newStreak = current + 1;
  localStorage.setItem(CORRECT_STREAK_KEY, newStreak.toString());
  return newStreak;
}

export function resetStreak(): void {
  localStorage.setItem(CORRECT_STREAK_KEY, '0');
}

// Track when user starts viewing a question
export function startAnswerTimer(): void {
  localStorage.setItem(ANSWER_START_TIME_KEY, Date.now().toString());
}

export function getAnswerTime(): number {
  const startTime = localStorage.getItem(ANSWER_START_TIME_KEY);
  if (!startTime) return 999; // Default to max time if not set
  return (Date.now() - parseInt(startTime, 10)) / 1000;
}

export function calculatePointsEarned(streak: number): { base: number; timeBonus: number; streakBonus: number; total: number; answerTime: number } {
  const base = POINTS_BASE;
  const answerTime = getAnswerTime();
  
  // Time bonus: full bonus if answered within threshold, decreasing to 0 at 2x threshold
  const timeBonus = answerTime <= TIME_BONUS_THRESHOLD_SECONDS 
    ? TIME_BONUS_MAX 
    : answerTime <= TIME_BONUS_THRESHOLD_SECONDS * 2
      ? Math.floor(TIME_BONUS_MAX * (1 - (answerTime - TIME_BONUS_THRESHOLD_SECONDS) / TIME_BONUS_THRESHOLD_SECONDS))
      : 0;
  
  // Streak bonus: 25% per streak level starting at 3
  const streakBonus = streak >= STREAK_BONUS_THRESHOLD 
    ? Math.floor(base * STREAK_BONUS_MULTIPLIER * (streak - STREAK_BONUS_THRESHOLD + 1))
    : 0;
  
  return { 
    base, 
    timeBonus,
    streakBonus, 
    total: base + timeBonus + streakBonus,
    answerTime
  };
}