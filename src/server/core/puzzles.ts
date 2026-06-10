import { redis } from '@devvit/web/server';
import { keys } from './keys';
import type { Category, PuzzleStats, PuzzleView } from '../../shared/types';

export type PuzzleRecord = {
  postId: string;
  answerId: string;
  answer: string;
  category: Category;
  emojiClue: string;
  author: string;
  createdAt: number;
};

const num = (v: string | undefined): number => (v ? parseInt(v, 10) || 0 : 0);

export const getPuzzle = async (postId: string): Promise<PuzzleRecord | null> => {
  const raw = await redis.get(keys.puzzle(postId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PuzzleRecord;
  } catch {
    return null;
  }
};

export const savePuzzle = async (rec: PuzzleRecord): Promise<void> => {
  await redis.set(keys.puzzle(rec.postId), JSON.stringify(rec));
  await redis.zAdd(keys.puzzleIndex, { member: rec.postId, score: rec.createdAt });
};

export const getStats = async (postId: string): Promise<PuzzleStats> => {
  const h = await redis.hGetAll(keys.puzzleStats(postId));
  return { solves: num(h.solves), attempts: num(h.attempts), giveups: num(h.giveups) };
};

export const bumpStat = async (
  postId: string,
  field: 'solves' | 'attempts' | 'giveups',
  by = 1
): Promise<void> => {
  await redis.hIncrBy(keys.puzzleStats(postId), field, by);
};

// Devvit Redis has no Set type, so solvers are tracked as a hash
// (field = username → '1').
export const hasSolved = async (
  postId: string,
  username: string
): Promise<boolean> => {
  const v = await redis.hGet(keys.puzzleSolvers(postId), username.toLowerCase());
  return Boolean(v);
};

// Returns true if this username was newly added (i.e., first solve).
export const markSolved = async (
  postId: string,
  username: string
): Promise<boolean> => {
  const key = keys.puzzleSolvers(postId);
  const name = username.toLowerCase();
  const existing = await redis.hGet(key, name);
  if (existing) return false;
  await redis.hSet(key, { [name]: '1' });
  return true;
};

export const toView = (rec: PuzzleRecord, isDaily: boolean): PuzzleView => ({
  postId: rec.postId,
  emojiClue: rec.emojiClue,
  category: rec.category,
  author: rec.author,
  createdAt: rec.createdAt,
  isDaily,
});

export const removePuzzle = async (postId: string): Promise<void> => {
  await redis.del(keys.puzzle(postId));
  await redis.del(keys.puzzleStats(postId));
  await redis.del(keys.puzzleSolvers(postId));
  await redis.zRem(keys.puzzleIndex, [postId]);
};

// A random recent puzzle id for "play another", excluding the current post.
export const randomPuzzleId = async (
  excludePostId: string | null
): Promise<string | null> => {
  const recent = await redis.zRange(keys.puzzleIndex, 0, 49, {
    reverse: true,
    by: 'rank',
  });
  const ids = recent.map((r) => r.member).filter((id) => id !== excludePostId);
  if (ids.length === 0) return null;
  return ids[Math.floor(Math.random() * ids.length)] ?? null;
};
