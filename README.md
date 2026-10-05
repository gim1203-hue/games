# Fieldnotes Arcade

A small React arcade that is growing toward a collection of 100 browser games. This release has eleven playable games, including a four-stage original platformer campaign.

## Games

- **Forest Dash**: Endless woodland runner with jumping, obstacles, berries, pause, replay, and a locally saved high score.
- **Memory Meadow**: Match six pairs of woodland cards and try to finish in fewer moves.
- **Acorn & Oak**: Local two-player tic-tac-toe with round and draw scores.
- **Rock, Paper, Scissors**: Best-of-five match against the grove.
- **Forest Word**: Guess the hidden woodland word with six mistakes allowed.
- **Whack-a-Stump**: Hit twelve visitors while avoiding five misses.
- **Simon's Trail**: Repeat an increasingly long sequence of colored pads.
- **Guess the Number**: Find a hidden number from higher/lower clues in six tries.
- **Reaction Grove**: Complete five reaction-time rounds and see your average.
- **Lights Out**: Toggle each tile and its neighbors until the board is dark.
- **Canopy Quest**: Guide Kai through four original jungle stages with running, jumping, vine swings, seed pods, hazards, lives, and checkpoints.

The collection is being built in batches. The current release is **11 of 100 games**; the other ideas are not playable yet.

## Technologies

- React
- JavaScript
- Vite
- Phaser
- CSS

## Run Locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To make a production build, run `npm run build`. To run lint checks, run `npm run lint`.

## Controls

- Forest Dash: `Space` or `Arrow Up` to jump; `P` or `Escape` to pause. On touch screens, use the Jump button.
- Memory Meadow: select two cards to reveal them.
- Acorn & Oak: two players take turns selecting squares on the same device.
- Rock, Paper, Scissors: choose a move for each of five rounds.
- Forest Word: select letters to reveal the word.
- Whack-a-Stump: tap the active stump; avoid empty ones.
- Simon's Trail: watch the pads light up, then repeat the sequence.
- Guess the Number: submit a number and follow the higher/lower clues.
- Reaction Grove: tap only after the clearing changes color.
- Lights Out: selecting a tile toggles it and its orthogonal neighbors.
- Canopy Quest: `←` / `→` or `A` / `D` to move, `Space` or `↑` to jump, and `E` or `Shift` to grab/release a vine. Touch controls appear on mobile.

## GitHub Pages

The Vite base path is configured for the `games` repository. The GitHub Actions workflow builds and deploys the site when changes are pushed to `main`. In the repository settings, set **Pages** to **GitHub Actions** if it is not already selected.

Once the first deployment succeeds, the arcade will be available at <https://gim1203-hue.github.io/games/>.

## Project Structure

```text
src/
  Arcade.jsx       Arcade home and game selection
  ForestDash.jsx   Canvas endless runner
  MemoryMatch.jsx  Matching puzzle
  TicTacToe.jsx    Two-player tic-tac-toe
  ExtraGames.jsx   Seven additional complete games
  ExtraGames.css   Additional game styles
  CanopyQuest.jsx  Four-stage Phaser platformer campaign
  CanopyQuest.css  Platformer HUD and responsive controls
  App.jsx          Application entry component
  App.css          Shared arcade styles
  Arcade.css       Game library styles
  MiniGames.css    Mini-game styles
```

## Future Improvements

- Add more complete games in tested batches toward the 100-game goal.
- Add optional sound, accessibility settings, and more saved high scores.

## Author

Created as a React learning and portfolio project.