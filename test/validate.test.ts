import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_EMOJI, clueClusters, validateEmojiClue } from '../src/shared/validate.ts';

test('empty / whitespace clues are invalid', () => {
  assert.equal(validateEmojiClue('').ok, false);
  assert.equal(validateEmojiClue('   ').ok, false);
});

test('letters and digits are rejected', () => {
  assert.equal(validateEmojiClue('🦁abc').ok, false);
  assert.equal(validateEmojiClue('🦁123').ok, false);
  assert.equal(validateEmojiClue('a').ok, false);
});

test('a single emoji is valid (count 1)', () => {
  const r = validateEmojiClue('🦁');
  assert.equal(r.ok, true);
  assert.equal(r.count, 1);
});

test('multiple emoji counted, spaces ignored', () => {
  const r = validateEmojiClue('🦁 👑');
  assert.equal(r.ok, true);
  assert.equal(r.count, 2);
});

test('a ZWJ family sequence counts as one grapheme', () => {
  const r = validateEmojiClue('👨‍👩‍👧');
  assert.equal(r.ok, true);
  assert.equal(r.count, 1);
});

test('a skin-tone modified emoji counts as one', () => {
  const r = validateEmojiClue('👋🏽');
  assert.equal(r.ok, true);
  assert.equal(r.count, 1);
});

test('too many emoji are rejected (count reported)', () => {
  const r = validateEmojiClue('🦁'.repeat(MAX_EMOJI + 1));
  assert.equal(r.ok, false);
  assert.equal(r.count, MAX_EMOJI + 1);
});

test('exactly MAX_EMOJI is allowed', () => {
  assert.equal(validateEmojiClue('🦁'.repeat(MAX_EMOJI)).ok, true);
});

test('clueClusters splits graphemes and drops spaces', () => {
  assert.deepEqual(clueClusters('🦁 👑'), ['🦁', '👑']);
  assert.equal(clueClusters('👨‍👩‍👧').length, 1);
});
