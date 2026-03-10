// XP System Configuration
// Formula: XP_next = 120 × (level ^ 1.35)
// No hard cap on levels

// ── XP Rewards ──────────────────────────────────────────
export const XP_REWARDS = {
  HABIT_COMPLETED: 20,       // Single habit completed
  ALL_HABITS_DAILY: 30,      // All habits completed in a day (bonus)
  STREAK_7_DAYS: 100,        // 7-day streak milestone
  STREAK_30_DAYS: 400,       // 30-day streak milestone
  DAILY_LOGIN: 5,            // Once per day
  MEAL_LOGGED: 10,           // Meal registered
  TEA_LOGGED: 10,            // Tea consumed
  WEIGHT_LOGGED: 15,         // Weight registered
  PHOTO_UPLOADED: 20,        // Progress photo uploaded
  CHECKIN_COMPLETED: 25,     // Weekly check-in completed
} as const;

// ── Daily XP Cap ────────────────────────────────────────
// Streak bonuses are excluded from this cap
export const DAILY_XP_CAP = 150;

// Actions that are exempt from the daily cap
export const CAP_EXEMPT_ACTIONS = ['STREAK_7_DAYS', 'STREAK_30_DAYS', 'CHECKIN_COMPLETED'] as const;

// ── Level Formula ───────────────────────────────────────
// XP needed to go FROM level N TO level N+1
export function xpForNextLevel(level: number): number {
  return Math.round(120 * Math.pow(level, 1.35));
}

// Total cumulative XP needed to REACH a given level
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForNextLevel(i);
  }
  return total;
}

// Calculate what level a user is at given total XP
export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpUsed = 0;
  while (true) {
    const needed = xpForNextLevel(level);
    if (xpUsed + needed > totalXp) break;
    xpUsed += needed;
    level++;
  }
  return level;
}

// ── Level Titles ────────────────────────────────────────
export function getLevelTitle(level: number): string {
  if (level <= 3) return 'Novato';
  if (level <= 6) return 'Iniciante';
  if (level <= 10) return 'Aprendiz';
  if (level <= 15) return 'Dedicado';
  if (level <= 20) return 'Comprometido';
  if (level <= 30) return 'Experiente';
  if (level <= 40) return 'Avançado';
  if (level <= 50) return 'Mestre';
  if (level <= 65) return 'Grão-Mestre';
  if (level <= 80) return 'Lenda';
  if (level <= 100) return 'Imortal';
  if (level <= 150) return 'Transcendente';
  if (level <= 200) return 'Ascendente';
  const prestige = Math.floor((level - 200) / 100) + 1;
  return `Celestial ${prestige}`;
}

// Get a color class for the level title
export function getLevelColor(level: number): string {
  if (level <= 6) return 'text-muted-foreground';
  if (level <= 15) return 'text-green-500';
  if (level <= 30) return 'text-blue-500';
  if (level <= 50) return 'text-purple-500';
  if (level <= 80) return 'text-amber-500';
  if (level <= 100) return 'text-red-500';
  return 'text-primary';
}
