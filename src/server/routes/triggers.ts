import { Hono } from 'hono';
import type { TriggerResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { HUB_TITLE, puzzleTitle, submitPost } from '../core/post';
import { getEntry } from '../data/bank';
import { SEED_PUZZLES } from '../data/seeds';
import { removePuzzle, savePuzzle, type PuzzleRecord } from '../core/puzzles';
import { setSeeds } from '../core/daily';

export const triggers = new Hono();

// On install: seed the official puzzles (so the community starts with content
// and a rotating daily) and drop a hub post.
triggers.post('/on-app-install', async (c) => {
  try {
    const seedIds: string[] = [];
    const now = Date.now();
    for (let i = 0; i < SEED_PUZZLES.length; i++) {
      const seed = SEED_PUZZLES[i];
      if (!seed) continue;
      const entry = getEntry(seed.answerId);
      if (!entry) continue;
      const { id } = await submitPost(puzzleTitle(seed.emojiClue, entry.category));
      const rec: PuzzleRecord = {
        postId: id,
        answerId: entry.id,
        answer: entry.display,
        category: entry.category,
        emojiClue: seed.emojiClue,
        author: 'Emojigma',
        createdAt: now - (SEED_PUZZLES.length - i) * 1000,
      };
      await savePuzzle(rec);
      seedIds.push(id);
    }
    await setSeeds(seedIds);
    await submitPost(HUB_TITLE);

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: `Seeded ${seedIds.length} puzzles in r/${context.subredditName}`,
      },
      200
    );
  } catch (error) {
    console.error(`Install seeding failed: ${error}`);
    return c.json<TriggerResponse>(
      { status: 'error', message: 'Failed to seed puzzles' },
      400
    );
  }
});

// On post delete: wipe that puzzle's data (App-Review data-deletion compliance).
triggers.post('/on-post-delete', async (c) => {
  try {
    const body = await c.req
      .json<{ postId?: string }>()
      .catch(() => ({}) as { postId?: string });
    const postId = body.postId ?? context.postId;
    if (postId) await removePuzzle(postId);
    return c.json<TriggerResponse>(
      { status: 'success', message: 'Puzzle data cleaned up' },
      200
    );
  } catch (error) {
    console.error(`Post-delete cleanup failed: ${error}`);
    return c.json<TriggerResponse>(
      { status: 'error', message: 'Cleanup failed' },
      400
    );
  }
});
