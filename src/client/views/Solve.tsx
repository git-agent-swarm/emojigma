import { useRef, useState } from 'react';
import { CATEGORY_META } from '../../shared/api';
import type { GameApi } from '../hooks/useGame';
import { Button, Card, Pill } from '../ui';

export const Solve = ({ game }: { game: GameApi }) => {
  const puzzle = game.init?.puzzle ?? null;
  const { feedback } = game;
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!puzzle) return null;

  const meta = CATEGORY_META.find((c) => c.id === puzzle.category);
  const solved = feedback.phase === 'solved';
  const gaveUp = feedback.phase === 'gaveup';
  const done = solved || gaveUp;

  const submit = async () => {
    const value = text.trim();
    if (!value || done) return;
    const correct = await game.guess(value);
    if (correct) {
      setText('');
    } else {
      inputRef.current?.select();
    }
  };

  const backHome = () => game.setScreen(game.init?.kind === 'hub' ? 'hub' : 'solve');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {puzzle.isDaily && <Pill className="bg-amber-400/20 text-amber-300">⭐ Daily</Pill>}
        <Pill className="bg-white/10 text-indigo-200">
          {meta?.icon} {meta?.label}
        </Pill>
      </div>

      <div
        key={feedback.lastWrongAt}
        className={`text-center select-none ${
          feedback.lastWrongAt && !done ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        <div className="text-5xl sm:text-6xl leading-tight tracking-wide break-words px-2 py-4">
          {puzzle.emojiClue}
        </div>
      </div>

      <p className="text-center text-xs text-indigo-300">
        clue by {puzzle.author === 'Emojigma' ? 'Emojigma ✨' : `u/${puzzle.author}`}
      </p>

      {!done && (
        <Card className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submit();
              }}
              placeholder="Type your guess…"
              autoComplete="off"
              autoCapitalize="none"
              className="flex-1 min-w-0 rounded-2xl bg-black/30 px-4 py-3 text-white placeholder:text-indigo-300/50 outline-none focus:ring-2 focus:ring-amber-400/60"
            />
            <Button onClick={() => void submit()} disabled={text.trim().length === 0}>
              Guess
            </Button>
          </div>

          {feedback.wrongCount > 0 && (
            <p className="text-center text-sm text-rose-300">
              Not quite — {feedback.wrongCount}{' '}
              {feedback.wrongCount === 1 ? 'try' : 'tries'} so far. Keep going!
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="ghost"
              onClick={() => void game.hint('length')}
              disabled={feedback.hint.length !== null}
            >
              🔢 {feedback.hint.length !== null ? `${feedback.hint.length} letters` : 'Length'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => void game.hint('firstLetter')}
              disabled={feedback.hint.firstLetter !== null}
            >
              🅰️ {feedback.hint.firstLetter ? `Starts “${feedback.hint.firstLetter}”` : 'First letter'}
            </Button>
            <Button variant="danger" onClick={() => void game.giveUp()}>
              Give up
            </Button>
          </div>
        </Card>
      )}

      {done && (
        <Card className="flex flex-col items-center gap-3 text-center">
          {solved ? (
            <>
              <div className="text-4xl">🎉</div>
              <h2 className="text-2xl font-extrabold text-emerald-300">Solved!</h2>
            </>
          ) : (
            <>
              <div className="text-4xl">🫣</div>
              <h2 className="text-lg font-bold text-indigo-200">The answer was</h2>
            </>
          )}
          <div className="text-3xl font-black text-white">{feedback.revealedAnswer}</div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {solved && feedback.lastPoints > 0 && (
              <Pill className="bg-amber-400/20 text-amber-300 text-sm">+{feedback.lastPoints} points</Pill>
            )}
            {solved && feedback.streakDelta > 0 && (
              <Pill className="bg-orange-500/20 text-orange-300 text-sm">
                🔥 Streak {game.me?.streak ?? ''}
              </Pill>
            )}
          </div>

          {feedback.stats && (
            <p className="text-xs text-indigo-300">
              👥 {feedback.stats.solves} solved · {feedback.stats.attempts} guesses
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button onClick={() => void game.playAnother()}>▶ Play another</Button>
            <Button variant="ghost" onClick={() => game.setScreen('create')}>
              ✏️ Create
            </Button>
            <Button variant="ghost" onClick={() => game.setScreen('leaderboard')}>
              🏆 Ranks
            </Button>
          </div>
          <button onClick={backHome} className="text-xs text-indigo-300 hover:text-white cursor-pointer">
            home
          </button>
        </Card>
      )}
    </div>
  );
};
