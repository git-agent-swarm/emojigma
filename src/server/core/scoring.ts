// Pure scoring, answer-matching, and streak/date logic. No Redis, no Devvit —
// kept deliberately side-effect free so it can be unit-tested in isolation.

export const POINTS = {
  solve: 10,
  dailyBonus: 15, // total for solving the daily = solve + dailyBonus = 25
  creatorPerSolve: 5,
} as const;

// Normalize a string for forgiving comparison: strip accents, lowercase,
// reduce every run of non-alphanumeric characters to a single space, trim.
export const normalize = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

export const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev: number[] = [];
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const curr: number[] = [i];
    const ca = a.charAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ca === b.charAt(j - 1) ? 0 : 1;
      const del = (prev[j] ?? 0) + 1;
      const ins = (curr[j - 1] ?? 0) + 1;
      const sub = (prev[j - 1] ?? 0) + cost;
      curr[j] = Math.min(del, ins, sub);
    }
    prev = curr;
  }
  return prev[n] ?? 0;
};

// Typo tolerance scales with answer length so short answers must be exact.
export const matchTolerance = (len: number): number =>
  len <= 4 ? 0 : len <= 8 ? 1 : 2;

const stripArticle = (s: string): string => s.replace(/^(?:the|a|an) /, '');

// Compact (spaceless) variants of a normalized string, with and without a
// leading article, so "lion king" solves "The Lion King".
const variants = (s: string): string[] => {
  const compact = s.replace(/ /g, '');
  const noArticle = stripArticle(s).replace(/ /g, '');
  return compact === noArticle ? [compact] : [compact, noArticle];
};

export const isCorrect = (guess: string, answer: string): boolean => {
  const g = normalize(guess);
  const a = normalize(answer);
  if (g.length === 0) return false;
  if (g === a) return true;
  for (const gv of variants(g)) {
    if (gv.length === 0) continue;
    for (const av of variants(a)) {
      if (av.length === 0) continue;
      if (gv === av) return true;
      if (levenshtein(gv, av) <= matchTolerance(av.length)) return true;
    }
  }
  return false;
};

// ---- dates / streaks -------------------------------------------------------

export const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

export const dayNumber = (iso: string): number =>
  Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86_400_000);

export const dayDiff = (fromIso: string, toIso: string): number =>
  dayNumber(toIso) - dayNumber(fromIso);

export type StreakResult = {
  streak: number;
  bestStreak: number;
  isNewDay: boolean;
};

// Compute the next daily streak given the last day the user solved a daily.
export const nextStreak = (
  lastDate: string | null,
  today: string,
  currentStreak: number,
  bestStreak: number
): StreakResult => {
  if (lastDate === today) {
    return { streak: currentStreak, bestStreak, isNewDay: false };
  }
  const consecutive = lastDate !== null && dayDiff(lastDate, today) === 1;
  const streak = consecutive ? currentStreak + 1 : 1;
  return { streak, bestStreak: Math.max(bestStreak, streak), isNewDay: true };
};

// Deterministically pick today's daily puzzle from the seed pool by date, so we
// need no scheduler/cron: every install shows the same rotation on a given day.
export const dailyIndex = (today: string, poolSize: number): number => {
  if (poolSize <= 0) return 0;
  const n = dayNumber(today);
  return ((n % poolSize) + poolSize) % poolSize;
};
