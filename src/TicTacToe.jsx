import { useState } from 'react'
import './MiniGames.css'

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function findWinner(board) {
  return winningLines.find(([first, second, third]) => (
    board[first] && board[first] === board[second] && board[first] === board[third]
  ))
}

export default function TicTacToe({ onExit }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState('X')
  const [winnerLine, setWinnerLine] = useState(null)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const winner = winnerLine ? board[winnerLine[0]] : null
  const isDraw = !winner && board.every(Boolean)
  const finished = Boolean(winner || isDraw)

  function playCell(index) {
    if (board[index] || finished) return
    const nextBoard = [...board]
    nextBoard[index] = turn
    const line = findWinner(nextBoard)
    setBoard(nextBoard)

    if (line) {
      setWinnerLine(line)
      setScores((current) => ({ ...current, [turn]: current[turn] + 1 }))
    } else if (nextBoard.every(Boolean)) {
      setScores((current) => ({ ...current, draws: current.draws + 1 }))
    } else {
      setTurn((current) => current === 'X' ? 'O' : 'X')
    }
  }

  function newRound() {
    setBoard(Array(9).fill(null))
    setWinnerLine(null)
    setTurn('X')
  }

  return (
    <main className="game-page mini-game-page">
      <header className="game-header">
        <a className="brand" href="#acorn-oak" aria-label="Fieldnotes Arcade home" onClick={(event) => { event.preventDefault(); onExit() }}>
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>fieldnotes<span className="brand-dot">.</span></span>
        </a>
        <button className="back-link" type="button" onClick={onExit}><span aria-hidden="true">←</span> ARCADE</button>
      </header>

      <section className="mini-intro" id="acorn-oak">
        <p className="eyebrow"><span className="live-dot" /> TWO-PLAYER <span className="eyebrow-divider">/</span> 003</p>
        <h1>Acorn <span>&amp; Oak</span></h1>
        <p className="intro-copy">Take turns on one screen. Three in a row owns the clearing.</p>
      </section>

      <section className="mini-game-shell tictactoe-shell" aria-label="Acorn and Oak game">
        <div className="mini-game-toolbar score-toolbar">
          <div className="mini-stat"><span>ACORN / X</span><strong className="score-x">{scores.X}</strong></div>
          <div className="mini-stat"><span>DRAWN</span><strong>{scores.draws}</strong></div>
          <div className="mini-stat"><span>OAK / O</span><strong className="score-o">{scores.O}</strong></div>
        </div>

        <div className="tic-status" role="status">
          {winner ? <><strong>{winner === 'X' ? 'Acorn' : 'Oak'} takes the round.</strong><span>Good game. Set up another?</span></>
            : isDraw ? <><strong>A friendly draw.</strong><span>The clearing belongs to both of you.</span></>
              : <><strong>{turn === 'X' ? 'Acorn' : 'Oak'}’s turn</strong><span>{turn === 'X' ? 'Place an X' : 'Place an O'} in an open square.</span></>}
        </div>

        <div className="tic-board" role="grid" aria-label="Tic tac toe board">
          {board.map((mark, index) => (
            <button
              aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}${mark ? `, ${mark}` : ', empty'}`}
              aria-pressed={Boolean(mark)}
              className={`tic-cell ${mark ? `mark-${mark.toLowerCase()}` : ''} ${winnerLine?.includes(index) ? 'winning-cell' : ''}`}
              disabled={Boolean(mark) || finished}
              key={index}
              onClick={() => playCell(index)}
              role="gridcell"
              type="button"
            >
              {mark && <span>{mark}</span>}
            </button>
          ))}
        </div>

        <div className="mini-actions">
          <p><span className="legend-x">X</span> Acorn <span className="legend-o">O</span> Oak</p>
          <button className="play-button" type="button" onClick={newRound}><span aria-hidden="true">↻</span> {finished ? 'Play again' : 'New round'}</button>
        </div>
      </section>

      <footer className="game-footer"><span>PASS THE SCREEN, KEEP THE PEACE</span><span>ACORN &amp; OAK / 003</span></footer>
    </main>
  )
}
