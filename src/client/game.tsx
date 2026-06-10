import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useGame, type GameApi } from './hooks/useGame';
import { Spinner } from './ui';
import { Solve } from './views/Solve';
import { Create } from './views/Create';
import { Leaderboard } from './views/Leaderboard';
import { Landing } from './views/Landing';

const Header = ({ game }: { game: GameApi }) => {
  const me = game.me;
  const onHub = game.init?.kind === 'hub';
  return (
    <header className="flex items-center justify-between gap-2 py-3">
      <button
        onClick={() => game.setScreen(onHub ? 'hub' : 'solve')}
        className="flex items-center gap-1 cursor-pointer"
      >
        <span className="text-xl">🧩</span>
        <span className="font-black text-white tracking-tight">Emojigma</span>
      </button>
      <div className="flex items-center gap-2 text-xs">
        {me && (
          <span className="rounded-full bg-white/10 px-2 py-1 text-amber-300 font-bold">
            ⭐ {me.points}
          </span>
        )}
        {me && me.streak > 0 && (
          <span className="rounded-full bg-white/10 px-2 py-1 text-orange-300 font-bold">
            🔥 {me.streak}
          </span>
        )}
        <button
          onClick={() => game.setScreen('profile')}
          className="rounded-full bg-white/10 px-3 py-1 text-white cursor-pointer hover:bg-white/20"
        >
          Me
        </button>
      </div>
    </header>
  );
};

const Body = ({ game }: { game: GameApi }) => {
  if (game.loading) return <Spinner />;
  if (game.error) return <p className="text-center text-rose-300 py-10">{game.error}</p>;
  switch (game.screen) {
    case 'create':
      return <Create game={game} />;
    case 'leaderboard':
      return <Leaderboard game={game} />;
    case 'profile':
    case 'hub':
      return <Landing game={game} />;
    default:
      return game.init?.puzzle ? <Solve game={game} /> : <Landing game={game} />;
  }
};

export const App = () => {
  const game = useGame();
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-indigo-950 via-indigo-950 to-purple-950 text-white">
      <div className="mx-auto w-full max-w-md px-4 pb-12">
        {!game.loading && !game.error && <Header game={game} />}
        <main className="pt-2">
          <Body game={game} />
        </main>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
