# 🧩 Emojigma

**Emoji riddles, made by the community, solved by the community — inside Reddit posts.**

One player picks a secret answer and encodes it as an **emoji-only clue**.
Everyone else races to crack it. Solve the daily for your 🔥 streak, earn points
for every puzzle you crack, and earn even more when people solve *yours*.

```
🎬 🦖 🏝️  →  "Jurassic Park"
```

---

## The loop

1. **Solve** — open a puzzle post, read the emoji clue, guess the answer.
2. **Create** — pick a category, choose an answer from the bank, paint it in emoji.
   Your puzzle becomes its own Reddit post for the community to attack.
3. **Climb** — `+10` per solve, `+25` for the daily, `+5` to you every time someone
   solves your puzzle. Two leaderboards: top **solvers** and top **creators**.
4. Come back tomorrow — the daily puzzle resets and your streak is on the line.

Players create the content, so the game generates infinite puzzles on its own —
and every new puzzle is a native Reddit post that pulls its own players in.

## Safe by construction

- Answers come **only from a curated, SFW answer bank** — never free-form user text.
- Clues are validated server-side to contain **emoji and spaces only** — no text smuggling.
- Guesses are private and validated server-side; nobody else ever sees them.
- Zero external network calls; honors post-delete and account-delete events.

## How it's built

| Layer | What's there |
| --- | --- |
| **Client** | React + Vite + Tailwind (Devvit Web). Lightweight splash view in the feed; full game in the expanded view. Screens: Solve · Result · Create · Leaderboard · Hub. |
| **Server** | Devvit serverless (Node 22, Hono). Endpoints for init/guess/give-up/hint/create/leaderboard. Every request well under the platform's 1s budget. |
| **Data** | Redis per-subreddit: puzzles, per-puzzle stats + solver sets, user points/streaks, solver + creator leaderboards, daily rotation. |

TypeScript end-to-end. No LLM calls, no external APIs — pure platform.

## Develop

```bash
npm run dev        # live dev server on Reddit
npm run build      # build client + server
npm run deploy     # upload a new version
npm run launch     # publish for review
```

---

Built by **[Kobey Dev Services](https://kobeydev.web.app)** — AI automation &
full-stack development. More projects: [git-agent-swarm](https://github.com/git-agent-swarm).
