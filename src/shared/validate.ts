// Emoji-clue validation. Used by the client for live feedback while building a
// clue AND enforced authoritatively on the server. Guarantees the only public
// user content is emoji (no smuggled letters/numbers/free text), which is the
// core of Emojigma's App-Review safety story.

export const MIN_EMOJI = 1;
export const MAX_EMOJI = 12;

export type ClueValidation = {
  ok: boolean;
  reason: string | null;
  count: number;
};

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const LETTER_OR_DIGIT_RE = /[\p{L}\p{N}]/u;

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

// Split into visible grapheme clusters, dropping whitespace-only segments.
export const clueClusters = (clue: string): string[] =>
  [...segmenter.segment(clue.trim())]
    .map((s) => s.segment)
    .filter((s) => s.trim().length > 0);

export const validateEmojiClue = (clue: string): ClueValidation => {
  const trimmed = clue.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'Add at least one emoji', count: 0 };
  }
  // Letters and numbers are never allowed — emoji only.
  if (LETTER_OR_DIGIT_RE.test(trimmed)) {
    return { ok: false, reason: 'Emoji only — no letters or numbers', count: 0 };
  }
  const clusters = clueClusters(trimmed);
  for (const cluster of clusters) {
    if (!EMOJI_RE.test(cluster)) {
      return { ok: false, reason: 'Use emoji only', count: clusters.length };
    }
  }
  if (clusters.length < MIN_EMOJI) {
    return { ok: false, reason: 'Add at least one emoji', count: clusters.length };
  }
  if (clusters.length > MAX_EMOJI) {
    return {
      ok: false,
      reason: `Use at most ${MAX_EMOJI} emoji`,
      count: clusters.length,
    };
  }
  return { ok: true, reason: null, count: clusters.length };
};
