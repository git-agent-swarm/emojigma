import { useEffect, useState } from 'react';
import type { LeaderboardResponse } from '../../shared/api';
import { fetchLeaderboard } from '../lib/api';
import { Button, Card, Spinner } from '../ui';
import type { GameApi } from '../hooks/useGame';

const medal = (rank: number): string =>
  rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

export const Leaderboard = ({ game }: { game: GameApi }) => {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [tab, setTab] = useState<'solvers' | 'creators'>('solvers');
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchLeaderboard()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const me = game.me?.username;
  const rows = data ? (tab === 'solvers' ? data.solvers : data.creators) : [];
  const yourRank = data
    ? tab === 'solvers'
      ? data.yourSolverRank
      : data.yourCreatorRank
    : null;

  const tabClass = (active: boolean): string =>
    `rounded-full px-4 py-2 text-sm font-semibold cursor-pointer ${
      active ? 'bg-amber-400 text-indigo-950' : 'bg-white/10 text-white'
    }`;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-xl font-bold text-white">🏆 Leaderboard</h2>
      <div className="flex gap-2 justify-center">
        <button onClick={() => setTab('solvers')} className={tabClass(tab === 'solvers')}>
          Top solvers
        </button>
        <button onClick={() => setTab('creators')} className={tabClass(tab === 'creators')}>
          Top creators
        </button>
      </div>

      {error ? (
        <p className="text-center text-rose-300 py-6">Couldn’t load the leaderboard.</p>
      ) : !data ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <p className="text-center text-indigo-300 py-6">No scores yet — be the first! 🎉</p>
      ) : (
        <Card className="flex flex-col divide-y divide-white/5 p-0 overflow-hidden">
          {rows.map((r) => (
            <div
              key={r.username}
              className={`flex items-center gap-3 px-4 py-3 ${
                r.username === me ? 'bg-amber-400/10' : ''
              }`}
            >
              <span className="w-7 text-center font-black text-indigo-300">{medal(r.rank)}</span>
              <span className="flex-1 truncate text-white font-semibold">u/{r.username}</span>
              <span className="font-bold text-amber-300">{r.score}</span>
            </div>
          ))}
        </Card>
      )}

      {yourRank !== null && yourRank > 10 && (
        <p className="text-center text-sm text-indigo-300">Your rank: #{yourRank}</p>
      )}

      <Button
        variant="subtle"
        onClick={() => game.setScreen(game.init?.kind === 'hub' ? 'hub' : 'solve')}
      >
        ← Back
      </Button>
    </div>
  );
};
