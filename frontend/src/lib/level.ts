// Play-level ordering: Beginner < Intermediate < Advanced
// "All" means the game is open to any skill level.
const LEVEL_ORDER: Record<string, number> = {
  All: 0,
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

/**
 * Returns the numeric rank of a play level.
 * Unknown levels default to 0 (treated as "All").
 */
export function levelRank(level: string): number {
  return LEVEL_ORDER[level] ?? 0;
}

/**
 * Whether a user with `userLevel` can play a game requiring `gameLevel`.
 *
 * Rules:
 *   - "All" → anyone can join
 *   - user's verified level must be >= game's required level
 */
export function canUserPlayGame(userLevel: string, gameLevel: string): boolean {
  if (!userLevel || gameLevel === 'All') return false;
  return levelRank(userLevel) >= levelRank(gameLevel);
}
