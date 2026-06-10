// Domain + API types shared between the Devvit server and the React client.
// NOTE: a puzzle's answer is NEVER sent to the client until the viewer has
// solved it or given up — `PuzzleView` deliberately omits it.

export type Category =
  | 'movies'
  | 'animals'
  | 'food'
  | 'nature'
  | 'sports'
  | 'objects'
  | 'places'
  | 'jobs'
  | 'music'
  | 'phrases';

export type CategoryMeta = {
  id: Category;
  label: string;
  icon: string;
};

export const CATEGORY_META: readonly CategoryMeta[] = [
  { id: 'movies', label: 'Movies & TV', icon: '🎬' },
  { id: 'animals', label: 'Animals', icon: '🐾' },
  { id: 'food', label: 'Food & Drink', icon: '🍔' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'objects', label: 'Objects', icon: '📦' },
  { id: 'places', label: 'Places', icon: '🗺️' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'phrases', label: 'Phrases & Idioms', icon: '💬' },
];

export const CATEGORIES: readonly Category[] = CATEGORY_META.map((c) => c.id);

export type Screen = 'solve' | 'create' | 'leaderboard' | 'profile' | 'hub';

export type PuzzleView = {
  postId: string;
  emojiClue: string;
  category: Category;
  author: string;
  createdAt: number;
  isDaily: boolean;
};

export type PuzzleStats = {
  solves: number;
  attempts: number;
  giveups: number;
};

export type UserStats = {
  username: string;
  points: number;
  solves: number;
  created: number;
  streak: number;
  bestStreak: number;
};

export type HintState = {
  length: number | null;
  firstLetter: string | null;
};

export const EMPTY_HINT: HintState = { length: null, firstLetter: null };

export type InitResponse = {
  type: 'init';
  kind: 'puzzle' | 'hub';
  username: string;
  puzzle: PuzzleView | null;
  stats: PuzzleStats | null;
  alreadySolved: boolean;
  gaveUp: boolean;
  revealedAnswer: string | null;
  me: UserStats;
  dailyPostId: string | null;
  hint: HintState;
};

export type GuessResponse = {
  type: 'guess';
  correct: boolean;
  pointsAwarded: number;
  stats: PuzzleStats;
  revealedAnswer: string | null;
  me: UserStats;
  streakDelta: number;
};

export type GiveUpResponse = {
  type: 'giveup';
  revealedAnswer: string;
  stats: PuzzleStats;
};

export type HintKind = 'length' | 'firstLetter';

export type HintResponse = {
  type: 'hint';
  hint: HintState;
};

export type LeaderEntry = {
  rank: number;
  username: string;
  score: number;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  solvers: LeaderEntry[];
  creators: LeaderEntry[];
  yourSolverRank: number | null;
  yourCreatorRank: number | null;
};

export type AnswerOption = {
  id: string;
  display: string;
};

export type CreateOptionsResponse = {
  type: 'createOptions';
  category: Category;
  options: AnswerOption[];
};

export type CreateRequest = {
  answerId: string;
  emojiClue: string;
};

export type CreateResponse =
  | { type: 'create'; ok: true; postId: string; url: string }
  | { type: 'create'; ok: false; reason: string };

export type RandomResponse = {
  type: 'random';
  postId: string | null;
  url: string | null;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
