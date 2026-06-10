import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type {
  CreateRequest,
  CreateResponse,
  CreateOptionsResponse,
  Category,
  ErrorResponse,
  GiveUpResponse,
  GuessResponse,
  HintKind,
  HintResponse,
  HintState,
  InitResponse,
  LeaderboardResponse,
  RandomResponse,
} from '../../shared/api';
import { CATEGORIES, EMPTY_HINT } from '../../shared/api';
import { validateEmojiClue } from '../../shared/validate';
import { isCorrect, isoDate, POINTS } from '../core/scoring';
import { getEntry, sampleOptions } from '../data/bank';
import {
  bumpStat,
  getPuzzle,
  getStats,
  hasSolved,
  markSolved,
  randomPuzzleId,
  savePuzzle,
  toView,
  type PuzzleRecord,
} from '../core/puzzles';
import {
  addPoints,
  applyDailyStreak,
  getUser,
  recordCreate,
  recordSolve,
} from '../core/users';
import {
  addCreatorPoints,
  addSolverPoints,
  creatorRank,
  solverRank,
  topCreators,
  topSolvers,
} from '../core/leaderboard';
import { getDailyPostId } from '../core/daily';
import { puzzleTitle, submitPost } from '../core/post';

export const api = new Hono();

const fail = (message: string): ErrorResponse => ({ status: 'error', message });

const id36 = (id: string): string => (id.startsWith('t3_') ? id.slice(3) : id);
const postUrl = (id: string): string =>
  `https://www.reddit.com/r/${context.subredditName}/comments/${id36(id)}`;

const letterCount = (s: string): number => (s.match(/[a-z0-9]/gi) ?? []).length;
const firstLetterOf = (s: string): string => {
  const m = s.match(/[a-z0-9]/i);
  return m ? m[0].toUpperCase() : '?';
};

const username = async (): Promise<string> =>
  (await reddit.getCurrentUsername()) ?? 'anonymous';

api.get('/init', async (c) => {
  const { postId } = context;
  if (!postId) return c.json(fail('postId missing from context'), 400);

  const name = await username();
  const today = isoDate(new Date());
  const [rec, me, dailyPostId] = await Promise.all([
    getPuzzle(postId),
    getUser(name),
    getDailyPostId(today),
  ]);

  if (!rec) {
    return c.json<InitResponse>({
      type: 'init',
      kind: 'hub',
      username: name,
      puzzle: null,
      stats: null,
      alreadySolved: false,
      gaveUp: false,
      revealedAnswer: null,
      me,
      dailyPostId,
      hint: EMPTY_HINT,
    });
  }

  const [stats, solved] = await Promise.all([
    getStats(postId),
    hasSolved(postId, name),
  ]);
  return c.json<InitResponse>({
    type: 'init',
    kind: 'puzzle',
    username: name,
    puzzle: toView(rec, dailyPostId === postId),
    stats,
    alreadySolved: solved,
    gaveUp: false,
    revealedAnswer: solved ? rec.answer : null,
    me,
    dailyPostId,
    hint: EMPTY_HINT,
  });
});

api.post('/guess', async (c) => {
  const { postId } = context;
  if (!postId) return c.json(fail('postId missing from context'), 400);

  const body = await c.req.json<{ guess?: string }>().catch(() => ({}) as { guess?: string });
  const guess = typeof body.guess === 'string' ? body.guess : '';

  const rec = await getPuzzle(postId);
  if (!rec) return c.json(fail('puzzle not found'), 404);

  const name = await username();
  await bumpStat(postId, 'attempts', 1);

  if (!isCorrect(guess, rec.answer)) {
    const [stats, me] = await Promise.all([getStats(postId), getUser(name)]);
    return c.json<GuessResponse>({
      type: 'guess',
      correct: false,
      pointsAwarded: 0,
      stats,
      revealedAnswer: null,
      me,
      streakDelta: 0,
    });
  }

  let pointsAwarded = 0;
  let streakDelta = 0;
  const isReal = name !== 'anonymous';

  if (isReal && !(await hasSolved(postId, name))) {
    const newlyMarked = await markSolved(postId, name);
    if (newlyMarked) {
      const today = isoDate(new Date());
      const dailyPostId = await getDailyPostId(today);
      const isDaily = dailyPostId === postId;
      pointsAwarded = POINTS.solve + (isDaily ? POINTS.dailyBonus : 0);

      await Promise.all([
        bumpStat(postId, 'solves', 1),
        addPoints(name, pointsAwarded),
        recordSolve(name),
        addSolverPoints(name, pointsAwarded),
      ]);

      const author = rec.author;
      if (
        author &&
        author !== 'anonymous' &&
        author !== 'Emojigma' &&
        author.toLowerCase() !== name.toLowerCase()
      ) {
        await Promise.all([
          addPoints(author, POINTS.creatorPerSolve),
          addCreatorPoints(author, POINTS.creatorPerSolve),
        ]);
      }

      if (isDaily) {
        const s = await applyDailyStreak(name, today);
        streakDelta = s.delta;
      }
    }
  }

  const [stats, me] = await Promise.all([getStats(postId), getUser(name)]);
  return c.json<GuessResponse>({
    type: 'guess',
    correct: true,
    pointsAwarded,
    stats,
    revealedAnswer: rec.answer,
    me,
    streakDelta,
  });
});

api.post('/giveup', async (c) => {
  const { postId } = context;
  if (!postId) return c.json(fail('postId missing from context'), 400);
  const rec = await getPuzzle(postId);
  if (!rec) return c.json(fail('puzzle not found'), 404);

  const name = await username();
  if (!(await hasSolved(postId, name))) {
    await bumpStat(postId, 'giveups', 1);
  }
  const stats = await getStats(postId);
  return c.json<GiveUpResponse>({
    type: 'giveup',
    revealedAnswer: rec.answer,
    stats,
  });
});

api.post('/hint', async (c) => {
  const { postId } = context;
  if (!postId) return c.json(fail('postId missing from context'), 400);
  const rec = await getPuzzle(postId);
  if (!rec) return c.json(fail('puzzle not found'), 404);

  const body = await c.req.json<{ kind?: HintKind }>().catch(() => ({}) as { kind?: HintKind });
  const hint: HintState = { length: null, firstLetter: null };
  if (body.kind === 'length') hint.length = letterCount(rec.answer);
  if (body.kind === 'firstLetter') hint.firstLetter = firstLetterOf(rec.answer);
  return c.json<HintResponse>({ type: 'hint', hint });
});

api.get('/leaderboard', async (c) => {
  const name = await username();
  const [solvers, creators, ysr, ycr] = await Promise.all([
    topSolvers(10),
    topCreators(10),
    solverRank(name),
    creatorRank(name),
  ]);
  return c.json<LeaderboardResponse>({
    type: 'leaderboard',
    solvers,
    creators,
    yourSolverRank: ysr,
    yourCreatorRank: ycr,
  });
});

api.get('/create/options', async (c) => {
  const category = c.req.query('category');
  if (!category || !CATEGORIES.includes(category as Category)) {
    return c.json(fail('unknown category'), 400);
  }
  const cat = category as Category;
  return c.json<CreateOptionsResponse>({
    type: 'createOptions',
    category: cat,
    options: sampleOptions(cat, 6),
  });
});

api.post('/create', async (c) => {
  const name = await reddit.getCurrentUsername();
  if (!name) {
    return c.json<CreateResponse>(
      { type: 'create', ok: false, reason: 'You must be logged in to create' },
      200
    );
  }

  const body = await c.req.json<CreateRequest>().catch(() => null);
  if (!body || typeof body.answerId !== 'string' || typeof body.emojiClue !== 'string') {
    return c.json<CreateResponse>(
      { type: 'create', ok: false, reason: 'Missing answer or clue' },
      200
    );
  }

  const entry = getEntry(body.answerId);
  if (!entry) {
    return c.json<CreateResponse>(
      { type: 'create', ok: false, reason: 'Pick an answer from the list' },
      200
    );
  }

  const v = validateEmojiClue(body.emojiClue);
  if (!v.ok) {
    return c.json<CreateResponse>(
      { type: 'create', ok: false, reason: v.reason ?? 'Invalid clue' },
      200
    );
  }

  const clue = body.emojiClue.trim();
  const { id } = await submitPost(puzzleTitle(clue, entry.category));
  const rec: PuzzleRecord = {
    postId: id,
    answerId: entry.id,
    answer: entry.display,
    category: entry.category,
    emojiClue: clue,
    author: name,
    createdAt: Date.now(),
  };
  await savePuzzle(rec);
  await recordCreate(name);

  return c.json<CreateResponse>({
    type: 'create',
    ok: true,
    postId: id,
    url: postUrl(id),
  });
});

api.get('/random', async (c) => {
  const { postId } = context;
  const id = await randomPuzzleId(postId ?? null);
  if (!id) return c.json<RandomResponse>({ type: 'random', postId: null, url: null });
  return c.json<RandomResponse>({ type: 'random', postId: id, url: postUrl(id) });
});
