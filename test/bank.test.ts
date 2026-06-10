import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BANK,
  bankSize,
  entriesByCategory,
  getEntry,
  sampleOptions,
} from '../src/server/data/bank.ts';
import { SEED_PUZZLES } from '../src/server/data/seeds.ts';
import { CATEGORIES } from '../src/shared/api.ts';

test('the bank is substantial', () => {
  assert.ok(bankSize > 100);
  assert.equal(BANK.length, bankSize);
});

test('all answer ids are unique', () => {
  const ids = new Set(BANK.map((e) => e.id));
  assert.equal(ids.size, BANK.length);
});

test('every entry has a known category and non-empty display', () => {
  for (const e of BANK) {
    assert.ok(CATEGORIES.includes(e.category), `bad category: ${e.category}`);
    assert.ok(e.display.length > 0);
  }
});

test('getEntry round-trips and misses cleanly', () => {
  const first = BANK[0];
  assert.ok(first);
  assert.equal(getEntry(first.id)?.display, first.display);
  assert.equal(getEntry('nope:nope'), undefined);
});

test('every category has entries', () => {
  for (const c of CATEGORIES) {
    assert.ok(entriesByCategory(c).length > 0, `empty category: ${c}`);
  }
});

test('sampleOptions returns unique, valid options within the limit', () => {
  const opts = sampleOptions('movies', 6);
  assert.ok(opts.length > 0 && opts.length <= 6);
  const ids = new Set(opts.map((o) => o.id));
  assert.equal(ids.size, opts.length);
  for (const o of opts) assert.ok(getEntry(o.id), `bad option id: ${o.id}`);
});

test('every seed puzzle answerId exists in the bank', () => {
  for (const s of SEED_PUZZLES) {
    assert.ok(getEntry(s.answerId), `seed answerId not in bank: ${s.answerId}`);
  }
});
