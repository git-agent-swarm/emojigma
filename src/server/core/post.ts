import { reddit } from '@devvit/web/server';
import type { Category } from '../../shared/types';
import { CATEGORY_META } from '../../shared/types';

const categoryLabel = (category: Category): string =>
  CATEGORY_META.find((c) => c.id === category)?.label ?? 'Mixed';

// Puzzle post title shows the emoji clue right in the feed (the riddle is meant
// to be seen) but never the answer.
export const puzzleTitle = (emojiClue: string, category: Category): string =>
  `${emojiClue}  ·  Emojigma (${categoryLabel(category)})`;

export const HUB_TITLE = '🧩 Emojigma — guess the emoji riddle';

export const submitPost = async (title: string): Promise<{ id: string }> => {
  const post = await reddit.submitCustomPost({ title });
  return { id: post.id };
};
