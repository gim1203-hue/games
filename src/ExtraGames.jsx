import { useEffect, useRef, useState } from 'react'
import './ExtraGames.css'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const word = 'FOREST'
const pads = ['Moss', 'Sun', 'Berry', 'Lake']
const padColors = ['moss', 'sun', 'berry', 'lake']
const rpsMoves = ['Rock', 'Paper', 'Scissors']
const groveMoves = [2, 0, 1, 0, 2]
const simonMelody = [2, 0, 3, 1, 2, 3, 0, 1]
const lightsScramble = [0, 4, 8, 1, 7, 2]

function GameFrame({ title, accent, category, number, onExit, children }) {
  return (
    <main className="game-page mini-game-page">
      <header className="game-header">
        <a className="brand" href="#arcade" aria-label="Fieldnotes Arcade home" onClick={(event) => { event.preventDefault(); onExit() }}>
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>fieldnotes<span className="brand-dot">.</span></span>
        </a>
        <button className="back-link" type="button" onClick={onExit}><span aria-hidden="true">←</span> ARCADE</button>
      </header>
      <section className="mini-intro">
        <p className="eyebrow"><span className="live-dot" /> {category} <span className="eyebrow-divider">/</span> {number}</p>
        <h1>{title} <span>{accent}</span></h1>
      </section>
      {children}
      <footer className="game-footer"><span>FIELDNOTES ARCADE</span><span>GAME {number} / 010</span></footer>
    </main>
  )
}

function Result({ title, message, action, onAction }) {
  return (
    <div className="mini-result" role="status">
      <p className="overlay-kicker">ROUND COMPLETE</p>
      <h2>{title}</h2>
      <p>{message}</p>
      <button className="play-button" type="button" onClick={onAction}><span aria-hidden="true">↻</span> {action}</button>
    </div>
  )
}

export function RockPaperScissors({ onExit }) {
  const [score, setScore] = useState({ you: 0, grove: 0, draws: 0 })
  const [rounds, setRounds] = useState(0)
  const [message, setMessage] = useState('Choose your move to begin.')
  const finished = rounds === 5
  const winner = score.you > score.grove ? 'You win the match.' : score.you < score.grove ? 'The grove wins this time.' : 'A perfectly even match.'

  function choose(player) {
    if (finished) return
    const grove = groveMoves[rounds]
    const outcome = player === grove ? 'draws' : (player - grove + 3) % 3 === 1 ? 'you' : 'grove'
    setScore((current) => ({ ...current, [outcome]: current[outcome] + 1 }))
    setMessage(player === grove ? `Both chose ${rpsMoves[player]}. Draw!` : `You chose ${rpsMoves[player]}; the grove chose ${rpsMoves[grove]}. ${outcome === 'you' ? 'Point to you!' : 'Point to the grove!'}`)
    setRounds((current) => current + 1)
  }

  function restart() {
    setScore({ you: 0, grove: 0, draws: 0 })
    setRounds(0)
    setMessage('Choose your move to begin.')
  }

  return (
    <GameFrame title="Rock, Paper," accent="Scissors" category="BEST OF FIVE" number="004" onExit={onExit}>
      <section className="mini-game-shell extra-shell">
        <div className="mini-game-toolbar score-toolbar">
          <div className="mini-stat"><span>YOU</span><strong className="score-x">{score.you}</strong></div>
          <div className="mini-stat"><span>DRAWS</span><strong>{score.draws}</strong></div>
          <div className="mini-stat"><span>THE GROVE</span><strong className="score-o">{score.grove}</strong></div>
        </div>
        <div className="extra-message" role="status"><strong>Round {Math.min(rounds + 1, 5)} of 5</strong><span>{message}</span></div>
        <div className="rps-choices">
          {rpsMoves.map((move, index) => <button key={move} className={`rps-choice rps-${move.toLowerCase()}`} type="button" onClick={() => choose(index)} disabled={finished}><span aria-hidden="true">{move[0]}</span>{move}</button>)}
        </div>
        {finished && <Result title={winner} message={`Final score: ${score.you} to ${score.grove}, with ${score.draws} draw${score.draws === 1 ? '' : 's'}.`} action="Play again" onAction={restart} />}
      </section>
    </GameFrame>
  )
}

export function ForestWord({ onExit }) {
  const [guesses, setGuesses] = useState([])
  const wrong = guesses.filter((letter) => !word.includes(letter)).length
  const won = word.split('').every((letter) => guesses.includes(letter))
  const lost = wrong >= 6
  const finished = won || lost

  function guess(letter) {
    if (!finished && !guesses.includes(letter)) setGuesses((current) => [...current, letter])
  }

  function restart() {
    setGuesses([])
  }

  return (
    <GameFrame title="Forest" accent="Word" category="WORD GUESS" number="005" onExit={onExit}>
      <section className="mini-game-shell extra-shell">
        <div className="mini-game-toolbar">
          <div className="mini-stat"><span>MISTAKES</span><strong>{wrong}<small> / 6</small></strong></div>
          <div className="mini-stat"><span>LETTERS</span><strong>{guesses.length}<small> / 26</small></strong></div>
          <button className="text-action" type="button" onClick={restart}>New word <span aria-hidden="true">↻</span></button>
        </div>
        <div className="word-message"><span>Guess the hidden woodland word.</span><strong aria-label="Word puzzle">{word.split('').map((letter, index) => <i key={`${letter}-${index}`}>{guesses.includes(letter) || lost ? letter : '_'}</i>)}</strong></div>
        <div className="letter-board" aria-label="Choose a letter">
          {alphabet.map((letter) => <button key={letter} type="button" className={`letter-key ${guesses.includes(letter) ? word.includes(letter) ? 'letter-correct' : 'letter-wrong' : ''}`} onClick={() => guess(letter)} disabled={guesses.includes(letter) || finished} aria-label={`Guess ${letter}`}>{letter}</button>)}
        </div>
        {finished && <Result title={won ? 'You found the word!' : 'The trail went quiet.'} message={won ? 'FOREST was the hidden word. Nice guessing.' : 'The word was FOREST. Give the grove another try.'} action="Play again" onAction={restart} />}
      </section>
    </GameFrame>
  )
}

export function WhackStump({ onExit }) {
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [active, setActive] = useState(4)
  const won = hits >= 12
  const lost = misses >= 5
  const finished = won || lost

  function tap(index) {
    if (finished) return
    if (index === active) setHits((current) => current + 1)
    else setMisses((current) => current + 1)
    setActive((current) => (current + 4) % 9)
  }

  function restart() {
    setHits(0)
    setMisses(0)
    setActive(4)
  }

  return (
    <GameFrame title="Whack-a-" accent="Stump" category="QUICK REFLEXES" number="006" onExit={onExit}>
      <section className="mini-game-shell extra-shell">
        <div className="mini-game-toolbar">
          <div className="mini-stat"><span>HITS</span><strong>{hits}<small> / 12</small></strong></div>
          <div className="mini-stat"><span>MISSES</span><strong>{misses}<small> / 5</small></strong></div>
          <span className="whack-instruction">Tap the little visitor.</span>
        </div>
        <div className="whack-board" aria-label="Nine forest stumps">
          {Array.from({ length: 9 }, (_, index) => <button key={index} className={`stump-hole ${active === index ? 'stump-active' : ''}`} type="button" onClick={() => tap(index)} disabled={finished} aria-label={active === index ? 'Hit the visitor' : 'Empty stump'}><span className="stump-log" aria-hidden="true">{active === index ? '●' : ''}</span></button>)}
        </div>
        {finished && <Result title={won ? 'Stump champion!' : 'The visitor got away.'} message={won ? 'Twelve good taps. Quick paws!' : `You scored ${hits} hits. Try keeping your eyes on the stump.`} action="Play again" onAction={restart} />}
      </section>
    </GameFrame>
  )
}

export function SimonTrail({ onExit }) {
  const [sequence, setSequence] = useState([])
  const [phase, setPhase] = useState('ready')
  const [step, setStep] = useState(0)
  const [lit, setLit] = useState(-1)
  const [round, setRound] = useState(0)
  const timers = useRef([])
  const finished = phase === 'over'

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  function play(nextSequence) {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    setSequence(nextSequence)
    setStep(0)
    setPhase('watch')
    nextSequence.forEach((pad, index) => {
      timers.current.push(window.setTimeout(() => setLit(pad), 420 + index * 620))
      timers.current.push(window.setTimeout(() => setLit(-1), 760 + index * 620))
    })
    timers.current.push(window.setTimeout(() => setPhase('input'), 500 + nextSequence.length * 620))
  }

  function start() {
    setRound(1)
    setLit(-1)
    play([simonMelody[0]])
  }

  function press(index) {
    if (phase !== 'input') return
    if (sequence[step] !== index) {
      timers.current.forEach((timer) => window.clearTimeout(timer))
      setLit(-1)
      setPhase('over')
      return
    }
    if (step === sequence.length - 1) {
      const next = [...sequence, simonMelody[sequence.length % simonMelody.length]]
      setRound(next.length)
      play(next)
    } else setStep((current) => current + 1)
  }

  return (
    <GameFrame title="Simon’s" accent="Trail" category="SEQUENCE MEMORY" number="007" onExit={onExit}>
      <section className="mini-game-shell extra-shell">
        <div className="mini-game-toolbar"><div className="mini-stat"><span>TRAIL LENGTH</span><strong>{round}</strong></div><span className="whack-instruction">{phase === 'watch' ? 'Watch the lights.' : phase === 'input' ? 'Repeat the trail.' : finished ? 'Trail complete.' : 'Start a new trail.'}</span></div>
        <div className="simon-board">
          {pads.map((name, index) => <button key={name} type="button" className={`simon-pad simon-${padColors[index]} ${lit === index ? 'simon-lit' : ''}`} onClick={() => press(index)} disabled={phase !== 'input'} aria-label={`${name} pad`}>{name}</button>)}
        </div>
        {(phase === 'ready' || finished) && <div className="simon-start-row">{finished && <p>You reached trail length <strong>{round}</strong>.</p>}<button className="play-button" type="button" onClick={start}><span aria-hidden="true">▶</span> {finished ? 'Try again' : 'Start trail'}</button></div>}
      </section>
    </GameFrame>
  )
}

export function GuessNumber({ onExit }) {
  const [secret, setSecret] = useState(13)
  const [value, setValue] = useState('')
  const [guesses, setGuesses] = useState(0)
  const [message, setMessage] = useState('Pick a number from 1 to 20.')
  const won = message === 'That’s it! You found the number.'
  const lost = guesses >= 6 && !won
  const finished = won || lost

  function submit(event) {
    event.preventDefault()
    const guess = Number(value)
    if (finished || !Number.isInteger(guess) || guess < 1 || guess > 20) return
    setGuesses((current) => current + 1)
    setMessage(guess === secret ? 'That’s it! You found the number.' : guess < secret ? 'Go higher.' : 'Go lower.')
    setValue('')
  }

  function restart() {
    setSecret((current) => (current * 7 + 3) % 20 + 1)
    setValue('')
    setGuesses(0)
    setMessage('Pick a number from 1 to 20.')
  }

  return (
    <GameFrame title="Guess the" accent="Number" category="NUMBER PUZZLE" number="008" onExit={onExit}>
      <section className="mini-game-shell extra-shell number-shell">
        <div className="mini-game-toolbar"><div className="mini-stat"><span>GUESSES</span><strong>{guesses}<small> / 6</small></strong></div><span className="whack-instruction">One number, six tries.</span></div>
        <form className="number-form" onSubmit={submit}>
          <p className="number-message" role="status">{message}</p>
          <label htmlFor="number-guess">Your guess</label>
          <div className="number-input-row"><input id="number-guess" type="number" min="1" max="20" value={value} onChange={(event) => setValue(event.target.value)} disabled={finished} required /><button className="play-button" type="submit" disabled={finished || !value}>Guess <span aria-hidden="true">↗</span></button></div>
        </form>
        {finished && <Result title={won ? 'Number found!' : 'Out of guesses.'} message={won ? `You found ${secret} in ${guesses} tries.` : `The number was ${secret}. Reset for another round.`} action="Play again" onAction={restart} />}
      </section>
    </GameFrame>
  )
}

export function ReactionGrove({ onExit }) {
  const [phase, setPhase] = useState('ready')
  const [round, setRound] = useState(0)
  const [times, setTimes] = useState([])
  const [startedAt, setStartedAt] = useState(0)
  const [falseStart, setFalseStart] = useState(false)
  const [lastTime, setLastTime] = useState(null)
  const timer = useRef(null)
  const finished = phase === 'complete'

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function beginRound() {
    window.clearTimeout(timer.current)
    setFalseStart(false)
    setLastTime(null)
    setPhase('waiting')
    timer.current = window.setTimeout(() => {
      setStartedAt(performance.now())
      setPhase('go')
    }, 1100 + Math.random() * 1000)
  }

  function clickSignal() {
    if (phase === 'waiting') {
      window.clearTimeout(timer.current)
      setFalseStart(true)
      setPhase('ready')
      return
    }
    if (phase === 'go') {
      const elapsed = Math.round(performance.now() - startedAt)
      const next = [...times, elapsed]
      setTimes(next)
      setLastTime(elapsed)
      if (next.length === 5) setPhase('complete')
      else {
        setRound(next.length)
        setPhase('ready')
      }
    }
  }

  function restart() {
    window.clearTimeout(timer.current)
    setPhase('ready')
    setRound(0)
    setTimes([])
    setFalseStart(false)
    setLastTime(null)
  }

  const average = times.length ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0
  return (
    <GameFrame title="Reaction" accent="Grove" category="REACTION TEST" number="009" onExit={onExit}>
      <section className="mini-game-shell extra-shell reaction-shell">
        <div className="mini-game-toolbar"><div className="mini-stat"><span>ROUND</span><strong>{finished ? '05' : round + 1}<small> / 5</small></strong></div>{lastTime !== null && <div className="mini-stat"><span>LAST</span><strong>{lastTime}<small> ms</small></strong></div>}{finished && <div className="mini-stat"><span>AVERAGE</span><strong>{average}<small> ms</small></strong></div>}</div>
        <div className={`reaction-zone reaction-${phase}`}>
          {phase === 'ready' && <><p>{falseStart ? 'Too soon. Wait for the clearing to glow.' : 'Wait for the clearing to glow, then tap.'}</p><button className="reaction-button" data-phase="ready" type="button" onClick={beginRound}>Get ready</button></>}
          {phase === 'waiting' && <><p>Keep your eyes on the clearing…</p><button className="reaction-button" data-phase="waiting" type="button" onClick={clickSignal}>Wait…</button></>}
          {phase === 'go' && <><p>Now! Tap as fast as you can.</p><button className="reaction-button" data-phase="go" type="button" onClick={clickSignal}>TAP</button></>}
          {finished && <><p>Five quick reactions. Your average:</p><strong className="reaction-average">{average}<small> ms</small></strong><button className="play-button" type="button" onClick={restart}><span aria-hidden="true">↻</span> Run again</button></>}
        </div>
      </section>
    </GameFrame>
  )
}

function toggleLights(board, index) {
  const next = [...board]
  const row = Math.floor(index / 3)
  const column = index % 3
  ;[[row, column], [row - 1, column], [row + 1, column], [row, column - 1], [row, column + 1]].forEach(([nextRow, nextColumn]) => {
    if (nextRow >= 0 && nextRow < 3 && nextColumn >= 0 && nextColumn < 3) {
      const cell = nextRow * 3 + nextColumn
      next[cell] = !next[cell]
    }
  })
  return next
}

function createLights(level) {
  let board = Array(9).fill(false)
  lightsScramble.slice(0, Math.min(level + 3, lightsScramble.length)).forEach((index) => { board = toggleLights(board, index) })
  return board
}

export function LightsOut({ onExit }) {
  const [level, setLevel] = useState(1)
  const [board, setBoard] = useState(() => createLights(1))
  const [movesMade, setMovesMade] = useState(0)
  const solved = board.every((light) => !light)

  function press(index) {
    if (solved) return
    setBoard((current) => toggleLights(current, index))
    setMovesMade((current) => current + 1)
  }

  function nextPuzzle() {
    setLevel((current) => current + 1)
    setBoard(createLights(level + 1))
    setMovesMade(0)
  }

  return (
    <GameFrame title="Lights" accent="Out" category="LIGHT PUZZLE" number="010" onExit={onExit}>
      <section className="mini-game-shell extra-shell lights-shell">
        <div className="mini-game-toolbar"><div className="mini-stat"><span>PUZZLE</span><strong>{level.toString().padStart(2, '0')}</strong></div><div className="mini-stat"><span>MOVES</span><strong>{movesMade}</strong></div><span className="whack-instruction">Turn off every light.</span></div>
        <div className="lights-board" role="grid" aria-label="Lights Out puzzle">
          {board.map((light, index) => <button key={index} role="gridcell" type="button" className={`light-cell ${light ? 'light-on' : ''}`} onClick={() => press(index)} disabled={solved} aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}, ${light ? 'on' : 'off'}`} />)}
        </div>
        {solved && <Result title="Clearing is dark." message={`Puzzle ${level} solved in ${movesMade} moves. The forest is quiet.`} action="Next puzzle" onAction={nextPuzzle} />}
      </section>
    </GameFrame>
  )
}

export default function ExtraGames({ gameId, onExit }) {
  const games = { rps: RockPaperScissors, word: ForestWord, whack: WhackStump, simon: SimonTrail, guess: GuessNumber, reaction: ReactionGrove, lights: LightsOut }
  const Game = games[gameId]
  return Game ? <Game onExit={onExit} /> : null
}
