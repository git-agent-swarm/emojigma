import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  POINTS,
  dailyIndex,
  dayDiff,
  isCorrect,
  isoDate,
  levenshtein,
  matchTolerance,
  nextStreak,
  normalize,
} from '../src/server/core/scoring.ts';

test('normalize lowercases, strips punctuation/accents, collapses spaces', () => {
  assert.equal(normalize('  The  Lion-King! '), 'the lion king');
  assert.equal(normalize('Café'), 'cafe');
  assert.equal(normalize('Spider-Man'), 'spider man');
});

test('levenshtein basic distances', () => {
  assert.equal(levenshtein('', ''), 0);
  assert.equal(levenshtein('a', ''), 1);
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('spiderman', 'spidermon'), 1);
});

test('matchTolerance scales with length', () => {
  assert.equal(matchTolerance(3), 0);
  assert.equal(matchTolerance(4), 0);
  assert.equal(matchTolerance(5), 1);
  assert.equal(matchTolerance(8), 1);
  assert.equal(matchTolerance(9), 2);
});

test('isCorrect is case/space/punctuation insensitive', () => {
  assert.equal(isCorrect('pizza', 'Pizza'), true);
  assert.equal(isCorrect('HOT DOG', 'Hot Dog'), true);
  assert.equal(isCorrect('hotdog', 'Hot Dog'), true);
});

test('isCorrect is article-insensitive', () => {
  assert.equal(isCorrect('lion king', 'The Lion King'), true);
  assert.equal(isCorrect('the lion king', 'Lion King'), true);
});

test('isCorrect tolerates typos on longer answers', () => {
  assert.equal(isCorrect('finding nemo', 'Finding Nemo'), true);
  assert.equal(isCorrect('finding nemoo', 'Finding Nemo'), true);
  assert.equal(isCorrect('elephnt', 'Elephant'), true);
});

test('isCorrect rejects wrong answers and empties', () => {
  assert.equal(isCorrect('', 'Pizza'), false);
  assert.equal(isCorrect('burger', 'Pizza'), false);
  assert.equal(isCorrect('cat', 'Dog'), false);
});

test('short answers require near-exact matches', () => {
  assert.equal(isCorrect('cat', 'Cat'), true);
  assert.equal(isCorrect('bat', 'Cat'), false);
});

test('dates and day math', () => {
  assert.equal(isoDate(new Date('2026-06-09T12:00:00Z')), '2026-06-09');
  assert.equal(dayDiff('2026-06-08', '2026-06-09'), 1);
  assert.equal(dayDiff('2026-06-01', '2026-06-09'), 8);
});

test('nextStreak advances on a consecutive day', () => {
  assert.deepEqual(nextStreak('2026-06-08', '2026-06-09', 4, 4), {
    streak: 5,
    bestStreak: 5,
    isNewDay: true,
  });
});

test('nextStreak resets after a gap but keeps best', () => {
  assert.deepEqual(nextStreak('2026-06-05', '2026-06-09', 4, 7), {
    streak: 1,
    bestStreak: 7,
    isNewDay: true,
  });
});

test('nextStreak is a no-op on the same day', () => {
  assert.deepEqual(nextStreak('2026-06-09', '2026-06-09', 4, 7), {
    streak: 4,
    bestStreak: 7,
    isNewDay: false,
  });
});

test('nextStreak starts a fresh streak with no history', () => {
  assert.deepEqual(nextStreak(null, '2026-06-09', 0, 0), {
    streak: 1,
    bestStreak: 1,
    isNewDay: true,
  });
});

test('dailyIndex is deterministic and in range', () => {
  assert.equal(dailyIndex('2026-06-09', 0), 0);
  const i = dailyIndex('2026-06-09', 8);
  assert.ok(i >= 0 && i < 8);
  assert.equal(dailyIndex('2026-06-09', 8), dailyIndex('2026-06-09', 8));
  assert.notEqual(dailyIndex('2026-06-09', 8), dailyIndex('2026-06-10', 8));
});

test('solving the daily is worth 25 points', () => {
  assert.equal(POINTS.solve + POINTS.dailyBonus, 25);
});
