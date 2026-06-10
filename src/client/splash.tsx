import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { requestExpandedMode } from '@devvit/web/client';
import type { InitResponse } from '../shared/api';

// Inline feed view — intentionally lightweight (no game logic). Shows the emoji
// clue right in the Reddit feed and expands into the full game on tap.
const Splash = () => {
  const [data, setData] = useState<InitResponse | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/init')
      .then((r) => r.json())
      .then((d: InitResponse) => {
        if (alive) setData(d);
      })
      .catch(() => {
        /* feed view stays on the default 🧩 */
      });
    return () => {
      alive = false;
    };
  }, []);

  const isHub = data?.kind === 'hub';
  const clue = data?.puzzle?.emojiClue ?? '🧩';
  const solves = data?.stats?.solves ?? 0;

  return (
    <button
      onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-indigo-950 to-purple-950 text-white cursor-pointer px-6"
    >
      <span className="text-xs font-bold tracking-[0.3em] text-amber-300">EMOJIGMA</span>
      <div className="text-5xl sm:text-6xl text-center break-words leading-tight">
        {isHub ? '🧩' : clue}
      </div>
      <span className="rounded-full bg-amber-400 text-indigo-950 px-6 py-2 font-bold">
        {isHub ? 'Tap to play' : 'Tap to guess'}
      </span>
      {!isHub && (
        <span className="text-xs text-indigo-300">
          {solves === 0 ? 'Be the first to solve it' : `${solves} solved so far`}
        </span>
      )}
    </button>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
