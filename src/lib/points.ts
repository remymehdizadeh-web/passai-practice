// Points and gamification system

const POINTS_KEY = 'nclexgo_points';
const CORRECT_STREAK_KEY = 'nclexgo_correct_streak';

export const POINTS_PER_CORRECT = 10;
export const STREAK_BONUS_THRESHOLD = 3; // Bonus starts at 3 correct in a row
export const STREAK_BONUS_MULTIPLIER = 0.5; // 50% bonus

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

export function calculatePointsEarned(streak: number): { base: number; bonus: number; total: number } {
  const base = POINTS_PER_CORRECT;
  const bonus = streak >= STREAK_BONUS_THRESHOLD 
    ? Math.floor(base * STREAK_BONUS_MULTIPLIER) 
    : 0;
  return { base, bonus, total: base + bonus };
}