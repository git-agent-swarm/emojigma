import { redis } from '@devvit/web/server';
import { keys } from './keys';
import { dailyIndex } from './scoring';

// `seeds` holds the official puzzle postIds created at install. The daily puzzle
// rotates through them deterministically by date, so no scheduler is needed.

export const getSeeds = async (): Promise<string[]> => {
  const raw = await redis.get(keys.seeds);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as string[]) : [];
  } catch {
    return [];
  }
};

export const setSeeds = async (ids: string[]): Promise<void> => {
  await redis.set(keys.seeds, JSON.stringify(ids));
};

export const getDailyPostId = async (today: string): Promise<string | null> => {
  const cached = await redis.get(keys.daily(today));
  if (cached) return cached;
  const seeds = await getSeeds();
  if (seeds.length === 0) return null;
  const id = seeds[dailyIndex(today, seeds.length)] ?? null;
  if (id) await redis.set(keys.daily(today), id);
  return id;
};
