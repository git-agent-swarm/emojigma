import { useCallback, useEffect, useState } from 'react';
import { navigateTo } from '@devvit/web/client';
import type {
  GuessResponse,
  HintKind,
  HintState,
  InitResponse,
  PuzzleStats,
  Screen,
  UserStats,
} from '../../shared/api';
import { EMPTY_HINT } from '../../shared/api';
import { fetchInit, fetchRandom, postGiveUp, postGuess, postHint } from '../lib/api';

export type Phase = 'unsolved' | 'solved' | 'gaveup';

export type SolveFeedback = {
  phase: Phase;
  revealedAnswer: string | null;
  hint: HintState;
  wrongCount: number;
  lastWrongAt: number;
  lastPoints: number;
  streakDelta: number;
  stats: PuzzleStats | null;
};

export type GameState = {
  loading: boolean;
  error: string | null;
  init: InitResponse | null;
  me: UserStats | null;
  screen: Screen;
  feedback: SolveFeedback;
};

const initialFeedback: SolveFeedback = {
  phase: 'unsolved',
  revealedAnswer: null,
  hint: EMPTY_HINT,
  wrongCount: 0,
  lastWrongAt: 0,
  lastPoints: 0,
  streakDelta: 0,
  stats: null,
};

export const useGame = () => {
  const [state, setState] = useState<GameState>({
    loading: true,
    error: null,
    init: null,
    me: null,
    screen: 'solve',
    feedback: initialFeedback,
  });

  useEffect(() => {
    let alive = true;
    fetchInit()
      .then((init) => {
        if (!alive) return;
        const phase: Phase = init.alreadySolved ? 'solved' : 'unsolved';
        setState({
          loading: false,
          error: null,
          init,
          me: init.me,
          screen: init.kind === 'hub' ? 'hub' : 'solve',
          feedback: {
            ...initialFeedback,
            phase,
            revealedAnswer: init.revealedAnswer,
            stats: init.stats,
          },
        });
      })
      .catch(() => {
        if (alive) {
          setState((s) => ({ ...s, loading: false, error: 'Could not load Emojigma. Try refreshing.' }));
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const setScreen = useCallback((screen: Screen) => {
    setState((s) => ({ ...s, screen }));
  }, []);

  const guess = useCallback(async (text: string): Promise<boolean> => {
    try {
      const res: GuessResponse = await postGuess(text);
      setState((s) => {
        if (res.correct) {
          return {
            ...s,
            me: res.me,
            feedback: {
              ...s.feedback,
              phase: 'solved',
              revealedAnswer: res.revealedAnswer,
              lastPoints: res.pointsAwarded,
              streakDelta: res.streakDelta,
              stats: res.stats,
            },
          };
        }
        return {
          ...s,
          feedback: {
            ...s.feedback,
            wrongCount: s.feedback.wrongCount + 1,
            lastWrongAt: Date.now(),
            stats: res.stats,
          },
        };
      });
      return res.correct;
    } catch {
      return false;
    }
  }, []);

  const giveUp = useCallback(async () => {
    try {
      const res = await postGiveUp();
      setState((s) => ({
        ...s,
        feedback: {
          ...s.feedback,
          phase: 'gaveup',
          revealedAnswer: res.revealedAnswer,
          stats: res.stats,
        },
      }));
    } catch {
      // ignore — give-up is best-effort
    }
  }, []);

  const hint = useCallback(async (kind: HintKind) => {
    try {
      const res = await postHint(kind);
      setState((s) => ({
        ...s,
        feedback: {
          ...s.feedback,
          hint: {
            length: res.hint.length ?? s.feedback.hint.length,
            firstLetter: res.hint.firstLetter ?? s.feedback.hint.firstLetter,
          },
        },
      }));
    } catch {
      // ignore — hint is best-effort
    }
  }, []);

  const playAnother = useCallback(async () => {
    try {
      const res = await fetchRandom();
      if (res.url) navigateTo(res.url);
    } catch {
      // ignore
    }
  }, []);

  return { ...state, setScreen, guess, giveUp, hint, playAnother };
};

export type GameApi = ReturnType<typeof useGame>;

// Navigate to a specific puzzle post by its (possibly t3_-prefixed) id.
export const navigateToPost = (postId: string): void => {
  const id36 = postId.startsWith('t3_') ? postId.slice(3) : postId;
  navigateTo(`https://www.reddit.com/comments/${id36}`);
};
