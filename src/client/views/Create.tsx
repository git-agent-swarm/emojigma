import { useState } from 'react';
import type { AnswerOption, Category } from '../../shared/api';
import { CATEGORY_META } from '../../shared/api';
import { MAX_EMOJI, clueClusters, validateEmojiClue } from '../../shared/validate';
import { EMOJI_GROUPS } from '../emoji';
import { fetchCreateOptions, postCreate } from '../lib/api';
import { navigateToPost, type GameApi } from '../hooks/useGame';
import { Button, Card, Pill, Spinner } from '../ui';

type Step = 'category' | 'compose';

export const Create = ({ game }: { game: GameApi }) => {
  const [step, setStep] = useState<Step>('category');
  const [category, setCategory] = useState<Category | null>(null);
  const [options, setOptions] = useState<AnswerOption[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);
  const [answerId, setAnswerId] = useState<string | null>(null);
  const [clue, setClue] = useState('');
  const [tab, setTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async (cat: Category) => {
    setLoadingOpts(true);
    setError(null);
    try {
      const res = await fetchCreateOptions(cat);
      setOptions(res.options);
      setAnswerId(null);
    } catch {
      setError('Could not load answers.');
    } finally {
      setLoadingOpts(false);
    }
  };

  const chooseCategory = async (cat: Category) => {
    setCategory(cat);
    setStep('compose');
    await loadOptions(cat);
  };

  const v = validateEmojiClue(clue);
  const canSubmit = answerId !== null && v.ok && !submitting;

  const append = (emoji: string) => {
    if (validateEmojiClue(clue + emoji).count <= MAX_EMOJI) {
      setClue((c) => c + emoji);
    }
  };
  const backspace = () => {
    const parts = clueClusters(clue);
    parts.pop();
    setClue(parts.join(''));
  };

  const submit = async () => {
    if (answerId === null || !v.ok) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await postCreate(answerId, clue);
      if (res.ok) {
        navigateToPost(res.postId);
      } else {
        setError(res.reason);
        setSubmitting(false);
      }
    } catch {
      setError('Something went wrong. Try again.');
      setSubmitting(false);
    }
  };

  const backHome = () => game.setScreen(game.init?.kind === 'hub' ? 'hub' : 'solve');

  if (step === 'category') {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-center text-xl font-bold text-white">Create a puzzle</h2>
        <p className="text-center text-sm text-indigo-300">Pick a category to start.</p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORY_META.map((c) => (
            <button
              key={c.id}
              onClick={() => void chooseCategory(c.id)}
              className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 border border-white/10 px-3 py-4 hover:bg-white/10 active:scale-95 transition cursor-pointer"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="text-sm font-semibold text-white">{c.label}</span>
            </button>
          ))}
        </div>
        <Button variant="subtle" onClick={backHome}>
          ← Back
        </Button>
      </div>
    );
  }

  const meta = CATEGORY_META.find((c) => c.id === category);
  const group = EMOJI_GROUPS[tab];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep('category')}
          className="text-indigo-300 text-sm cursor-pointer hover:text-white"
        >
          ← Category
        </button>
        <Pill className="bg-white/10 text-indigo-200">
          {meta?.icon} {meta?.label}
        </Pill>
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">1 · Pick the secret answer</h3>
          <button
            onClick={() => category && void loadOptions(category)}
            className="text-xs text-amber-300 cursor-pointer hover:text-amber-200"
          >
            🔀 Shuffle
          </button>
        </div>
        {loadingOpts ? (
          <Spinner />
        ) : (
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <button
                key={o.id}
                onClick={() => setAnswerId(o.id)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition cursor-pointer ${
                  answerId === o.id
                    ? 'bg-amber-400 text-indigo-950'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {o.display}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h3 className="font-bold text-white">2 · Build your emoji clue</h3>
        <div className="min-h-[56px] rounded-2xl bg-black/30 px-3 py-3 text-3xl flex items-center justify-center break-words text-center">
          {clue || <span className="text-sm text-indigo-300/60">tap emoji below…</span>}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={v.ok ? 'text-emerald-300' : 'text-indigo-300'}>
            {v.reason ?? `${v.count}/${MAX_EMOJI} emoji`}
          </span>
          <div className="flex gap-3">
            <button onClick={backspace} className="text-indigo-200 hover:text-white cursor-pointer">
              ⌫ Delete
            </button>
            <button onClick={() => setClue('')} className="text-indigo-200 hover:text-white cursor-pointer">
              Clear
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {EMOJI_GROUPS.map((g, i) => (
            <button
              key={g.name}
              onClick={() => setTab(i)}
              className={`shrink-0 rounded-xl px-2 py-1 text-lg cursor-pointer ${
                tab === i ? 'bg-white/20' : 'bg-white/5'
              }`}
            >
              {g.icon}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1">
          {group?.emojis.map((e, i) => (
            <button
              key={`${e}-${i}`}
              onClick={() => append(e)}
              className="text-2xl rounded-lg py-1 hover:bg-white/10 active:scale-90 transition cursor-pointer"
            >
              {e}
            </button>
          ))}
        </div>
      </Card>

      {error && <p className="text-center text-sm text-rose-300">{error}</p>}
      <Button onClick={() => void submit()} disabled={!canSubmit}>
        {submitting ? 'Posting…' : '🚀 Post puzzle'}
      </Button>
      {answerId === null && (
        <p className="text-center text-xs text-indigo-300">Pick an answer first.</p>
      )}
    </div>
  );
};
