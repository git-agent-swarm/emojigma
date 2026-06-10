import { navigateToPost, type GameApi } from '../hooks/useGame';
import { Button, Card, Stat } from '../ui';

export const Landing = ({ game }: { game: GameApi }) => {
  const me = game.me;
  const daily = game.init?.dailyPostId ?? null;
  const onPuzzlePost = game.init?.kind === 'puzzle';

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div className="text-5xl">🧩</div>
        <h1 className="mt-1 text-3xl font-black text-white tracking-tight">Emojigma</h1>
        <p className="text-sm text-indigo-300">Guess the emoji riddle.</p>
      </div>

      {me && (
        <div className="flex justify-center gap-2">
          <Stat icon="⭐" label="Points" value={me.points} />
          <Stat icon="🔥" label="Streak" value={me.streak} />
          <Stat icon="✅" label="Solved" value={me.solves} />
          <Stat icon="✏️" label="Made" value={me.created} />
        </div>
      )}

      <Card className="flex flex-col gap-2">
        <h3 className="font-bold text-white">How to play</h3>
        <p className="text-sm text-indigo-200 leading-relaxed">
          ① Read the emoji clue. ② Guess the hidden answer. ③ Build your own clue
          and stump the community. Solve the daily puzzle every day to grow your 🔥 streak.
        </p>
      </Card>

      <div className="flex flex-col gap-2">
        {daily && (
          <Button onClick={() => navigateToPost(daily)}>⭐ Play today’s daily</Button>
        )}
        {onPuzzlePost && (
          <Button variant="ghost" onClick={() => game.setScreen('solve')}>
            🧩 Back to this puzzle
          </Button>
        )}
        <Button variant="ghost" onClick={() => game.setScreen('create')}>
          ✏️ Create a puzzle
        </Button>
        <Button variant="ghost" onClick={() => game.setScreen('leaderboard')}>
          🏆 Leaderboard
        </Button>
      </div>

      {me && me.bestStreak > 0 && (
        <p className="text-center text-xs text-indigo-300">Best streak: {me.bestStreak} days 🔥</p>
      )}
    </div>
  );
};
