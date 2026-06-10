// Centralized Redis key builders. Redis is per-installation (per subreddit),
// so these are already namespaced to the community the app is installed in.

export const keys = {
  puzzle: (postId: string): string => `puzzle:${postId}`,
  puzzleStats: (postId: string): string => `puzzle:${postId}:stats`,
  puzzleSolvers: (postId: string): string => `puzzle:${postId}:solvers`,
  user: (name: string): string => `user:${name.toLowerCase()}`,
  lbSolvers: 'lb:solvers',
  lbCreators: 'lb:creators',
  daily: (isoDate: string): string => `daily:${isoDate}`,
  puzzleIndex: 'puzzles:index',
  seeds: 'seeds',
} as const;
