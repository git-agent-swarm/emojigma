import { redis } from '@devvit/web/server';
import { keys } from './keys';
import type { UserStats } from '../../shared/types';
import { nextStreak } from './scoring';

const num = (v: string | undefined): number => (v ? parseInt(v, 10) || 0 : 0);

export const getUser = async (username: string): Promise<UserStats> => {
  const h = await redis.hGetAll(keys.user(username));
  return {
    username,
    points: num(h.points),
    solves: num(h.solves),
    created: num(h.created),
    streak: num(h.streak),
    bestStreak: num(h.bestStreak),
  };
};

export const addPoints = async (username: string, pts: number): Promise<void> => {
  if (pts !== 0) await redis.hIncrBy(keys.user(username), 'points', pts);
};

export const recordSolve = async (username: string): Promise<void> => {
  await redis.hIncrBy(keys.user(username), 'solves', 1);
};

export const recordCreate = async (username: string): Promise<void> => {
  await redis.hIncrBy(keys.user(username), 'created', 1);
};

export type StreakUpdate = { streak: number; delta: number };

// Advance (or reset) the user's daily streak. Idempotent within a single day.
export const applyDailyStreak = async (
  username: string,
  today: string
): Promise<StreakUpdate> => {
  const h = await redis.hGetAll(keys.user(username));
  const lastDate = h.lastDailyDate ? h.lastDailyDate : null;
  const cur = num(h.streak);
  const best = num(h.bestStreak);
  const res = nextStreak(lastDate, today, cur, best);
  if (res.isNewDay) {
    await redis.hSet(keys.user(username), {
      streak: String(res.streak),
      bestStreak: String(res.bestStreak),
      lastDailyDate: today,
    });
  }
  return { streak: res.streak, delta: res.isNewDay ? res.streak - cur : 0 };
};
