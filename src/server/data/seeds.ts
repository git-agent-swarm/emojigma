// Handcrafted official puzzles. Created on app install so a freshly-installed
// community is never empty and there is always a daily puzzle to rotate through.

export type SeedPuzzle = {
  answerId: string;
  emojiClue: string;
};

export const SEED_PUZZLES: readonly SeedPuzzle[] = [
  { answerId: 'movies:the-lion-king', emojiClue: '🦁👑' },
  { answerId: 'phrases:raining-cats-and-dogs', emojiClue: '🌧️🐱🐶' },
  { answerId: 'food:birthday-cake', emojiClue: '🎂🥳' },
  { answerId: 'nature:rainbow', emojiClue: '🌈' },
  { answerId: 'phrases:night-owl', emojiClue: '🌙🦉' },
  { answerId: 'animals:butterfly', emojiClue: '🐛🔜🦋' },
  { answerId: 'movies:finding-nemo', emojiClue: '🔍🐠' },
  { answerId: 'food:hot-dog', emojiClue: '🌭' },
];
