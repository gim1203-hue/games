import { useState } from 'react'
import ForestDash from './ForestDash.jsx'
import MemoryMatch from './MemoryMatch.jsx'
import TicTacToe from './TicTacToe.jsx'
import ExtraGames from './ExtraGames.jsx'
import './Arcade.css'

const games = [
  {
    id: 'forest',
    number: '01',
    title: 'Forest Dash',
    category: 'ENDLESS RUNNER',
    description: 'Leap over logs, dodge rocks, and gather berries on a woodland trail.',
    mark: 'FD',
    tone: 'moss',
  },
  {
    id: 'memory',
    number: '02',
    title: 'Memory Meadow',
    category: 'MATCHING PUZZLE',
    description: 'Turn over woodland cards and find all six matching pairs.',
    mark: 'MM',
    tone: 'marigold',
  },
  {
    id: 'tic-tac-toe',
    number: '03',
    title: 'Acorn & Oak',
    category: 'TWO-PLAYER',
    description: 'Take turns, make a line, and claim the forest clearing.',
    mark: 'A/O',
    tone: 'coral',
  },
  {
    id: 'rps',
    number: '04',
    title: 'Rock, Paper, Scissors',
    category: 'BEST OF FIVE',
    description: 'Challenge the grove to a quick five-round match.',
    mark: 'RPS',
    tone: 'moss',
  },
  {
    id: 'word',
    number: '05',
    title: 'Forest Word',
    category: 'WORD GUESS',
    description: 'Uncover a woodland word before six wrong guesses.',
    mark: 'FW',
    tone: 'marigold',
  },
  {
    id: 'whack',
    number: '06',
    title: 'Whack-a-Stump',
    category: 'QUICK REFLEXES',
    description: 'Tap the forest visitor and avoid empty stumps.',
    mark: 'WS',
    tone: 'coral',
  },
  {
    id: 'simon',
    number: '07',
    title: 'Simon’s Trail',
    category: 'SEQUENCE MEMORY',
    description: 'Watch the glowing trail and repeat its growing pattern.',
    mark: 'ST',
    tone: 'moss',
  },
  {
    id: 'guess',
    number: '08',
    title: 'Guess the Number',
    category: 'NUMBER PUZZLE',
    description: 'Use higher and lower clues to find the hidden number.',
    mark: '13',
    tone: 'marigold',
  },
  {
    id: 'reaction',
    number: '09',
    title: 'Reaction Grove',
    category: 'REACTION TEST',
    description: 'Wait for the signal, then see how fast you can tap.',
    mark: 'GO',
    tone: 'coral',
  },
  {
    id: 'lights',
    number: '10',
    title: 'Lights Out',
    category: 'LIGHT PUZZLE',
    description: 'Toggle a tile and its neighbors until the board goes dark.',
    mark: 'LO',
    tone: 'moss',
  },
]

export default function Arcade() {
  const [selectedGame, setSelectedGame] = useState(null)

  if (selectedGame === 'forest') return <ForestDash onExit={() => setSelectedGame(null)} />
  if (selectedGame === 'memory') return <MemoryMatch onExit={() => setSelectedGame(null)} />
  if (selectedGame === 'tic-tac-toe') return <TicTacToe onExit={() => setSelectedGame(null)} />
  if (selectedGame) return <ExtraGames gameId={selectedGame} onExit={() => setSelectedGame(null)} />

  return (
    <main className="game-page arcade-page">
      <header className="game-header">
        <a className="brand" href="#arcade" aria-label="Fieldnotes Arcade home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>fieldnotes<span className="brand-dot">.</span></span>
        </a>
        <div className="header-right">
          <span className="edition-label">SMALL GAMES, BIG OUTSIDE</span>
          <span className="best-chip"><span aria-hidden="true">✳</span> THE ARCADE</span>
        </div>
      </header>

      <section className="arcade-intro" id="arcade">
        <div>
          <p className="eyebrow"><span className="live-dot" /> THE FIELDNOTES ARCADE</p>
          <h1>Pick your <span>play.</span></h1>
          <p className="intro-copy">A growing collection of little games for a quick break.</p>
        </div>
        <div className="arcade-count"><strong>{games.length.toString().padStart(2, '0')}</strong><span>GAMES<br />READY TO PLAY</span></div>
      </section>

      <section className="arcade-library" aria-label="Playable games">
        {games.map((game) => (
          <button
            className="game-card"
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            type="button"
          >
            <span className={`game-card-art ${game.tone}`} aria-hidden="true">
              <span className="card-art-mark">{game.mark}</span>
              <span className="card-art-number">{game.number}</span>
              <span className="art-orbit orbit-one" />
              <span className="art-orbit orbit-two" />
            </span>
            <span className="game-card-copy">
              <span className="game-card-category">{game.category}</span>
              <span className="game-card-title">{game.title}</span>
              <span className="game-card-description">{game.description}</span>
              <span className="game-card-action">PLAY GAME <span aria-hidden="true">↗</span></span>
            </span>
          </button>
        ))}
      </section>

      <section className="arcade-next" aria-label="More games are being made">
        <span className="next-mark" aria-hidden="true">+</span>
        <div><strong>More trails are being made.</strong><span>This collection is growing one fully playable game at a time.</span></div>
        <span className="next-index">{games.length.toString().padStart(2, '0')} / 100</span>
      </section>

      <footer className="game-footer">
        <span>MADE FOR THE JOY OF PLAY</span>
        <span>TEN GAMES. ALL YOURS.</span>
      </footer>
    </main>
  )
}
