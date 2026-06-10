import { redis } from '@devvit/web/server';
import { keys } from './keys';
import type { LeaderEntry } from '../../shared/types';

export const addSolverPoints = async (
  username: string,
  pts: number
): Promise<void> => {
  if (pts !== 0) await redis.zIncrBy(keys.lbSolvers, username, pts);
};

export const addCreatorPoints = async (
  username: string,
  pts: number
): Promise<void> => {
  if (pts !== 0) await redis.zIncrBy(keys.lbCreators, username, pts);
};

const topN = async (key: string, n: number): Promise<LeaderEntry[]> => {
  const rows = await redis.zRange(key, 0, n - 1, { reverse: true, by: 'rank' });
  return rows.map((r, i) => ({ rank: i + 1, username: r.member, score: r.score }));
};

export const topSolvers = (n: number): Promise<LeaderEntry[]> =>
  topN(keys.lbSolvers, n);

export const topCreators = (n: number): Promise<LeaderEntry[]> =>
  topN(keys.lbCreators, n);

// 1-based descending rank (1 = highest score), or null if the user isn't ranked.
const rankOf = async (key: string, username: string): Promise<number | null> => {
  const score = await redis.zScore(key, username);
  if (score === undefined || score === null) return null;
  const asc = await redis.zRank(key, username);
  if (asc === undefined || asc === null) return null;
  const card = await redis.zCard(key);
  return card - asc;
};

export const solverRank = (username: string): Promise<number | null> =>
  rankOf(keys.lbSolvers, username);

export const creatorRank = (username: string): Promise<number | null> =>
  rankOf(keys.lbCreators, username);
