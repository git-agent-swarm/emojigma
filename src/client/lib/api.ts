// Typed fetch wrappers around the /api endpoints. The server's Response.json()
// is typed `any` by lib.dom, so assigning to a typed local needs no cast.

import type {
  Category,
  CreateOptionsResponse,
  CreateResponse,
  GiveUpResponse,
  GuessResponse,
  HintKind,
  HintResponse,
  InitResponse,
  LeaderboardResponse,
  RandomResponse,
} from '../../shared/api';

const getJson = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: T = await res.json();
  return data;
};

const postJson = async <T,>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: T = await res.json();
  return data;
};

export const fetchInit = (): Promise<InitResponse> =>
  getJson<InitResponse>('/api/init');

export const postGuess = (guess: string): Promise<GuessResponse> =>
  postJson<GuessResponse>('/api/guess', { guess });

export const postGiveUp = (): Promise<GiveUpResponse> =>
  postJson<GiveUpResponse>('/api/giveup', {});

export const postHint = (kind: HintKind): Promise<HintResponse> =>
  postJson<HintResponse>('/api/hint', { kind });

export const fetchLeaderboard = (): Promise<LeaderboardResponse> =>
  getJson<LeaderboardResponse>('/api/leaderboard');

export const fetchCreateOptions = (
  category: Category
): Promise<CreateOptionsResponse> =>
  getJson<CreateOptionsResponse>(
    `/api/create/options?category=${encodeURIComponent(category)}`
  );

export const postCreate = (
  answerId: string,
  emojiClue: string
): Promise<CreateResponse> =>
  postJson<CreateResponse>('/api/create', { answerId, emojiClue });

export const fetchRandom = (): Promise<RandomResponse> =>
  getJson<RandomResponse>('/api/random');
