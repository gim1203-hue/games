import { useEffect, useState } from 'react'
import './MiniGames.css'

const pairs = [
  { name: 'Fern', mark: 'F' },
  { name: 'Acorn', mark: 'A' },
  { name: 'Owl', mark: 'O' },
  { name: 'Pine', mark: 'P' },
  { name: 'Mushroom', mark: 'M' },
  { name: 'Berry', mark: 'B' },
]

function createDeck() {
  return [...pairs, ...pairs]
    .map((card, index) => ({ ...card, id: index, pairId: card.name }))
    .sort(() => Math.random() - 0.5)
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

export default function MemoryMatch({ onExit }) {
  const [cards, setCards] = useState(createDeck)
  const [openCards, setOpenCards] = useState([])
  const [matchedCards, setMatchedCards] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [locked, setLocked] = useState(false)
  const complete = matchedCards.length === pairs.length * 2

  useEffect(() => {
    if (complete) return undefined
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000)
    return () => window.clearInterval(timer)
  }, [complete])

  function restart() {
    setCards(createDeck())
    setOpenCards([])
    setMatchedCards([])
    setMoves(0)
    setSeconds(0)
    setLocked(false)
  }

  function reveal(card) {
    if (locked || openCards.includes(card.id) || matchedCards.includes(card.id)) return

    const nextOpen = [...openCards, card.id]
    setOpenCards(nextOpen)
    if (nextOpen.length !== 2) return

    setMoves((current) => current + 1)
    const firstCard = cards.find((item) => item.id === nextOpen[0])
    if (firstCard.pairId === card.pairId) {
      setMatchedCards((current) => [...current, ...nextOpen])
      setOpenCards([])
      return
    }

    setLocked(true)
    window.setTimeout(() => {
      setOpenCards([])
      setLocked(false)
    }, 720)
  }

  return (
    <main className="game-page mini-game-page">
      <header className="game-header">
        <a className="brand" href="#memory" aria-label="Fieldnotes Arcade home" onClick={(event) => { event.preventDefault(); onExit() }}>
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>fieldnotes<span className="brand-dot">.</span></span>
        </a>
        <button className="back-link" type="button" onClick={onExit}><span aria-hidden="true">←</span> ARCADE</button>
      </header>

      <section className="mini-intro" id="memory">
        <p className="eyebrow"><span className="live-dot" /> MATCHING PUZZLE <span className="eyebrow-divider">/</span> 002</p>
        <h1>Memory <span>Meadow</span></h1>
        <p className="intro-copy">Find the woodland pairs. Fewer turns make a prettier score.</p>
      </section>

      <section className="mini-game-shell" aria-label="Memory Meadow game">
        <div className="mini-game-toolbar">
          <div className="mini-stat"><span>MOVES</span><strong>{moves.toString().padStart(2, '0')}</strong></div>
          <div className="mini-stat"><span>PAIRS</span><strong>{matchedCards.length / 2}<small> / 6</small></strong></div>
          <div className="mini-stat"><span>TIME</span><strong>{formatTime(seconds)}</strong></div>
          <button className="text-action" type="button" onClick={restart}>Start over <span aria-hidden="true">↻</span></button>
        </div>

        <div className="memory-board" aria-label="Six pairs of woodland cards">
          {cards.map((card) => {
            const isRevealed = openCards.includes(card.id) || matchedCards.includes(card.id)
            const isMatched = matchedCards.includes(card.id)
            return (
              <button
                className={`memory-card ${isRevealed ? 'revealed' : ''} ${isMatched ? 'matched' : ''}`}
                key={card.id}
                type="button"
                onClick={() => reveal(card)}
                disabled={isMatched || locked}
                aria-label={isRevealed ? `${card.name}${isMatched ? ', matched' : ', revealed'}` : 'Hidden woodland card'}
              >
                <span className="memory-card-back" aria-hidden="true">✳</span>
                {isRevealed && <span className="memory-card-face"><b>{card.mark}</b><small>{card.name}</small></span>}
              </button>
            )
          })}
        </div>

        {complete && (
          <div className="mini-result" role="status">
            <p className="overlay-kicker">MEADOW COMPLETE</p>
            <h2>Every pair found.</h2>
            <p>You matched all six pairs in <strong>{moves}</strong> turns and <strong>{formatTime(seconds)}</strong>.</p>
            <button className="play-button" type="button" onClick={restart}><span aria-hidden="true">↻</span> Play again</button>
          </div>
        )}
      </section>

      <footer className="game-footer"><span>TAKE A LITTLE LOOK AROUND</span><span>MEMORY MEADOW / 002</span></footer>
    </main>
  )
}
