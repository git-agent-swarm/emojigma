# Emojigma — design

A community **emoji-riddle** game that lives inside Reddit posts (Devvit Web).

> One player encodes a secret answer (chosen from a curated, Safe-for-Work bank)
> into an **emoji-only** clue. Everyone else races to guess it. Daily challenge,
> streaks, points, and leaderboards keep people coming back.

## Why this wins (the proven Reddit-game formula)
- **UGC *is* the content** — players create the puzzles, so the game manufactures
  infinite free content and self-distributes natively into the Reddit feed.
- **Two-half loop** — one person *creates*, everyone else *guesses/competes*.
- **Daily replayability** — daily puzzle + streaks + leaderboards (Developer Funds
  pays on a rolling 7-day average of daily engagers, so retention is everything).
- **Safe by construction** — the only public user content is an *emoji-only* clue
  plus an answer *chosen from our curated bank*. No free-form public text → passes
  App Review's UGC-safety bar. Guesses are private and validated server-side; they
  are never shown to anyone.
- **Platform-native** — Redis-for-everything, every request well under the 1s
  execution budget, **zero external network calls** (no LLM/API → no allow-list
  approval needed).

## Post model
Each puzzle is its own Reddit post (like Pixelary).
- **Splash (inline feed view)** — the emoji clue + "N solved · tap to guess". Light/fast.
- **Game (expanded webview)** — solve, then see the answer + stats, your streak,
  the leaderboard, and a one-tap "create your own" / "play another".
- A **hub post** (created on install, or via the mod menu) is the landing pad:
  today's daily, create, leaderboard, how-to-play.

## Screens (client)
`Solve` · `Result` · `Create` (category → pick answer → emoji palette) · `Leaderboard` · `Profile/Hub`.

## Scoring
- Solve: **+10** · Solve the **daily**: **+25** · Each solve your puzzle earns: **+5** (to the creator).
- **Streak** = consecutive days solving the daily puzzle.
- Two leaderboards: top **solvers** (by points) and top **creators** (by solves earned).

## Data model (Redis, per-installation = per-subreddit)
- `puzzle:{postId}` — JSON `{answerId, answer, display, category, emojiClue, author, createdAt}`
- `puzzle:{postId}:stats` — hash `{solves, attempts, giveups}`
- `puzzle:{postId}:solvers` — set of usernames (dedupe + "already solved")
- `user:{name}` — hash `{points, solves, created, streak, bestStreak, lastDailyDate}`
- `lb:solvers` / `lb:creators` — sorted sets (name → score)
- `daily:{YYYY-MM-DD}` — postId of the day's daily puzzle
- `puzzles:index` — sorted set of postIds by createdAt (for "play another")
- `seeds` — list of official seed puzzle postIds (rotated as the daily by date)

## Endpoints
`GET /api/init` · `POST /api/guess` · `POST /api/giveup` · `POST /api/hint`
`GET /api/leaderboard` · `GET /api/create/options?category=` · `POST /api/create`
`GET /api/random` · internal: menu `post-create`, triggers `on-app-install`/`on-post-delete`.

## Safety / review compliance
- Answers come **only** from the curated SFW bank (`src/server/data/bank.ts`) — never user free text.
- Clues are validated to contain **emoji + spaces only** (no letters/digits/text smuggling).
- Honor `PostDelete` (wipe puzzle data) and account-delete events.
- Original branding, no Reddit IP/Snoo, no prohibited-industry content, no off-platform links.
