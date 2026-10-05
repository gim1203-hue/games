import { useEffect, useRef, useState } from 'react'
import './App.css'

const WIDTH = 960
const HEIGHT = 420
const GROUND = 330
const RUNNER_X = 158
const STORAGE_KEY = 'forest-dash-best'

function makeGame() {
  return {
    player: { y: GROUND, velocity: 0 },
    obstacles: [],
    berries: [],
    distance: 0,
    elapsed: 0,
    spawnIn: 1.1,
    berryIn: 1.8,
    scenery: 0,
    berryCount: 0,
    lastFrame: 0,
  }
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fill()
}

function drawTree(context, x, ground, scale, color) {
  context.fillStyle = color
  context.fillRect(x - 5 * scale, ground - 72 * scale, 10 * scale, 72 * scale)
  context.beginPath()
  context.moveTo(x, ground - 138 * scale)
  context.lineTo(x - 42 * scale, ground - 56 * scale)
  context.lineTo(x + 42 * scale, ground - 56 * scale)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(x, ground - 108 * scale)
  context.lineTo(x - 34 * scale, ground - 34 * scale)
  context.lineTo(x + 34 * scale, ground - 34 * scale)
  context.closePath()
  context.fill()
}

function drawRunner(context, y, elapsed) {
  const x = RUNNER_X
  const top = y - 54
  const stride = Math.sin(elapsed * 17) * 5

  context.save()
  context.translate(x, top)
  context.fillStyle = 'rgba(24, 49, 35, 0.18)'
  context.beginPath()
  context.ellipse(24, GROUND - top + 2, 30, 6, 0, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = '#293b31'
  context.lineWidth = 7
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(17, 42)
  context.lineTo(12 + stride, 53)
  context.lineTo(7 + stride, 58)
  context.moveTo(34, 42)
  context.lineTo(39 - stride, 53)
  context.lineTo(45 - stride, 58)
  context.stroke()

  context.fillStyle = '#e87954'
  roundedRect(context, 9, 17, 35, 31, 12)
  context.fillStyle = '#f3bd55'
  context.beginPath()
  context.arc(29, 13, 15, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#fff4d7'
  context.beginPath()
  context.arc(35, 12, 5, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#24392d'
  context.beginPath()
  context.arc(37, 12, 2.3, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#e87954'
  context.beginPath()
  context.moveTo(17, 3)
  context.lineTo(13, -8)
  context.lineTo(25, 1)
  context.fill()
  context.beginPath()
  context.moveTo(31, 0)
  context.lineTo(39, -8)
  context.lineTo(39, 5)
  context.fill()
  context.fillStyle = '#f5d382'
  context.beginPath()
  context.ellipse(11, 27, 9, 4, -0.4, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawObstacle(context, obstacle) {
  if (obstacle.type === 'log') {
    context.fillStyle = '#85563c'
    roundedRect(context, obstacle.x, GROUND - 28, obstacle.width, 28, 9)
    context.fillStyle = '#bd8154'
    context.beginPath()
    context.ellipse(obstacle.x + obstacle.width - 4, GROUND - 14, 7, 11, 0, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#e2b77a'
    context.beginPath()
    context.ellipse(obstacle.x + obstacle.width - 4, GROUND - 14, 3, 6, 0, 0, Math.PI * 2)
    context.fill()
  } else if (obstacle.type === 'mushroom') {
    context.fillStyle = '#f2dfbd'
    roundedRect(context, obstacle.x + 11, GROUND - 34, 16, 34, 7)
    context.fillStyle = '#df6852'
    context.beginPath()
    context.ellipse(obstacle.x + 19, GROUND - 33, 23, 15, 0, Math.PI, Math.PI * 2)
    context.fill()
    context.fillStyle = '#fff0ce'
    context.beginPath()
    context.arc(obstacle.x + 10, GROUND - 39, 3, 0, Math.PI * 2)
    context.arc(obstacle.x + 25, GROUND - 43, 3, 0, Math.PI * 2)
    context.fill()
  } else {
    context.fillStyle = '#768575'
    context.beginPath()
    context.moveTo(obstacle.x, GROUND)
    context.lineTo(obstacle.x + 8, GROUND - 27)
    context.lineTo(obstacle.x + 24, GROUND - 38)
    context.lineTo(obstacle.x + obstacle.width, GROUND - 30)
    context.lineTo(obstacle.x + obstacle.width + 5, GROUND)
    context.closePath()
    context.fill()
    context.fillStyle = '#aab59d'
    context.beginPath()
    context.ellipse(obstacle.x + 24, GROUND - 29, 8, 3, -0.35, 0, Math.PI * 2)
    context.fill()
  }
}

function drawBerry(context, berry, elapsed) {
  const bob = Math.sin(elapsed * 5 + berry.x) * 4
  context.fillStyle = '#f0be56'
  context.beginPath()
  context.arc(berry.x, berry.y + bob, 15, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#bd4f55'
  context.beginPath()
  context.arc(berry.x, berry.y + bob, 8, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#4f8a5f'
  context.beginPath()
  context.ellipse(berry.x + 4, berry.y + bob - 10, 5, 2.5, -0.6, 0, Math.PI * 2)
  context.fill()
}

function drawScene(context, game, status) {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, '#b7d8c3')
  sky.addColorStop(0.7, '#e7e5bd')
  sky.addColorStop(1, '#f4d695')
  context.fillStyle = sky
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.fillStyle = 'rgba(255, 247, 205, 0.68)'
  context.beginPath()
  context.arc(758, 82, 38, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = 'rgba(255, 255, 255, 0.48)'
  for (let index = 0; index < 3; index += 1) {
    const cloudX = ((index * 350 + 160 - game.scenery * 0.12) % 1120 + 1120) % 1120 - 80
    const cloudY = 62 + (index % 2) * 42
    context.beginPath()
    context.ellipse(cloudX, cloudY, 43, 10, 0, 0, Math.PI * 2)
    context.ellipse(cloudX + 22, cloudY - 7, 23, 15, 0, 0, Math.PI * 2)
    context.ellipse(cloudX + 47, cloudY, 34, 9, 0, 0, Math.PI * 2)
    context.fill()
  }

  context.fillStyle = '#a3c4a5'
  context.beginPath()
  context.moveTo(0, 260)
  context.quadraticCurveTo(185, 165, 350, 246)
  context.quadraticCurveTo(560, 147, 745, 248)
  context.quadraticCurveTo(858, 192, 960, 232)
  context.lineTo(960, 340)
  context.lineTo(0, 340)
  context.fill()

  context.fillStyle = '#709779'
  context.beginPath()
  context.moveTo(0, 286)
  context.quadraticCurveTo(210, 210, 398, 282)
  context.quadraticCurveTo(610, 194, 790, 282)
  context.quadraticCurveTo(884, 236, 960, 269)
  context.lineTo(960, 344)
  context.lineTo(0, 344)
  context.fill()

  for (let index = 0; index < 11; index += 1) {
    const x = ((index * 123 - game.scenery * 0.35) % 1100 + 1100) % 1100 - 70
    drawTree(context, x, 318, 0.42 + (index % 3) * 0.1, index % 2 ? '#557d60' : '#638c68')
  }

  context.fillStyle = '#668b60'
  context.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND)
  context.fillStyle = '#82a36b'
  context.fillRect(0, GROUND, WIDTH, 8)
  context.fillStyle = '#476b4d'
  for (let index = 0; index < 23; index += 1) {
    const x = ((index * 58 - game.scenery) % 1040 + 1040) % 1040 - 40
    context.fillRect(x, GROUND + 30 + (index % 3) * 18, 19, 3)
  }

  game.obstacles.forEach((obstacle) => drawObstacle(context, obstacle))
  game.berries.forEach((berry) => drawBerry(context, berry, game.elapsed))
  drawRunner(context, game.player.y, game.elapsed)

  if (status === 'ready') {
    context.fillStyle = 'rgba(35, 61, 45, 0.08)'
    context.fillRect(0, 0, WIDTH, HEIGHT)
  }
}

function formatScore(score) {
  return Math.floor(score).toString().padStart(5, '0')
}

export default function ForestDash({ onExit }) {
  const canvasRef = useRef(null)
  const gameRef = useRef(makeGame())
  const screenRef = useRef('ready')
  const jumpRef = useRef(() => {})
  const startRef = useRef(() => {})
  const [screen, setScreen] = useState('ready')
  const [hud, setHud] = useState({ score: 0, berries: 0, speed: 1 })
  const [bestScore, setBestScore] = useState(() => {
    try {
      return Number(window.localStorage.getItem(STORAGE_KEY)) || 0
    } catch {
      return 0
    }
  })
  const bestScoreRef = useRef(bestScore)

  function changeScreen(nextScreen) {
    screenRef.current = nextScreen
    setScreen(nextScreen)
  }

  function startGame() {
    gameRef.current = makeGame()
    setHud({ score: 0, berries: 0, speed: 1 })
    changeScreen('running')
  }

  function jump() {
    const game = gameRef.current
    if (screenRef.current !== 'running' || game.player.y < GROUND - 1) return
    game.player.velocity = -680
  }

  useEffect(() => {
    startRef.current = startGame
    jumpRef.current = jump
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let animationFrame
    let lastHudUpdate = 0

    function finishGame() {
      const game = gameRef.current
      const finalScore = Math.floor(game.distance / 10) + game.berryCount * 25
      setHud({
        score: finalScore,
        berries: game.berryCount,
        speed: (1 + Math.min(game.distance * 0.035 / 310, 250 / 310)).toFixed(1),
      })
      if (finalScore > bestScoreRef.current) {
        bestScoreRef.current = finalScore
        setBestScore(finalScore)
        try {
          window.localStorage.setItem(STORAGE_KEY, String(finalScore))
        } catch {
          // The game remains playable if browser storage is unavailable.
        }
      }
      changeScreen('over')
    }

    function handleKeyDown(event) {
      if (['Space', 'ArrowUp'].includes(event.code)) event.preventDefault()
      if (event.code === 'Escape' || event.code === 'KeyP') {
        if (screenRef.current === 'running') changeScreen('paused')
        else if (screenRef.current === 'paused') changeScreen('running')
        return
      }
      if (event.code === 'Enter' && screenRef.current !== 'running' && screenRef.current !== 'paused') {
        startRef.current()
        return
      }
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        if (screenRef.current === 'ready' || screenRef.current === 'over') startRef.current()
        else if (screenRef.current === 'running') jumpRef.current()
      }
    }

    function resizeCanvas() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = WIDTH * pixelRatio
      canvas.height = HEIGHT * pixelRatio
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    function frame(timestamp) {
      const game = gameRef.current
      const delta = game.lastFrame ? Math.min((timestamp - game.lastFrame) / 1000, 0.035) : 0
      game.lastFrame = timestamp

      if (screenRef.current === 'running') {
        game.elapsed += delta
        game.distance += delta * (260 + Math.min(game.distance * 0.025, 230))
        const speed = 310 + Math.min(game.distance * 0.035, 250)
        game.scenery += speed * delta
        game.player.velocity += 1750 * delta
        game.player.y += game.player.velocity * delta
        if (game.player.y > GROUND) {
          game.player.y = GROUND
          game.player.velocity = 0
        }

        game.spawnIn -= delta
        if (game.spawnIn <= 0) {
          const obstacleTypes = ['log', 'mushroom', 'rock']
          const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
          game.obstacles.push({ x: WIDTH + 20, type, width: type === 'log' ? 62 : 46 })
          game.spawnIn = Math.max(0.82, 1.45 - game.distance / 9000) + Math.random() * 0.68
        }

        game.berryIn -= delta
        if (game.berryIn <= 0) {
          game.berries.push({ x: WIDTH + 20, y: GROUND - 78 - Math.random() * 34 })
          game.berryIn = 1.4 + Math.random() * 1.3
        }

        game.obstacles.forEach((obstacle) => { obstacle.x -= speed * delta })
        game.berries.forEach((berry) => { berry.x -= speed * delta })
        game.obstacles = game.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -10)
        game.berries = game.berries.filter((berry) => berry.x > -20)

        const playerTop = game.player.y - 51
        const hitObstacle = game.obstacles.some((obstacle) => (
          RUNNER_X + 37 > obstacle.x + 7
          && RUNNER_X + 6 < obstacle.x + obstacle.width - 3
          && game.player.y > GROUND - (obstacle.type === 'rock' ? 34 : obstacle.type === 'mushroom' ? 43 : 25)
          && playerTop < GROUND
        ))
        if (hitObstacle) finishGame()

        game.berries = game.berries.filter((berry) => {
          const collected = Math.abs(berry.x - (RUNNER_X + 25)) < 30
            && Math.abs(berry.y - (game.player.y - 37)) < 43
          if (collected) game.berryCount += 1
          return !collected
        })

        if (timestamp - lastHudUpdate > 100) {
          setHud({
            score: Math.floor(game.distance / 10) + game.berryCount * 25,
            berries: game.berryCount,
            speed: (speed / 310).toFixed(1),
          })
          lastHudUpdate = timestamp
        }
      } else {
        game.scenery += delta * 14
      }

      drawScene(context, game, screenRef.current)
      animationFrame = window.requestAnimationFrame(frame)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('keydown', handleKeyDown)
    animationFrame = window.requestAnimationFrame(frame)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const displayedScore = hud.score

  return (
    <main className="game-page">
      <header className="game-header">
        <a className="brand" href="#top" aria-label="Forest Dash home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>fieldnotes<span className="brand-dot">.</span></span>
        </a>
        {onExit && <button className="back-link" type="button" onClick={onExit}><span aria-hidden="true">←</span> ARCADE</button>}
        <div className="header-right">
          <span className="edition-label">A LITTLE ARCADE GAME</span>
          <span className="best-chip"><span aria-hidden="true">★</span> BEST {formatScore(bestScore)}</span>
        </div>
      </header>

      <section className="game-intro" id="top">
        <div>
          <p className="eyebrow"><span className="live-dot" /> WOODLAND RUNNER <span className="eyebrow-divider">/</span> 001</p>
          <h1>Forest <span>Dash</span></h1>
          <p className="intro-copy">The trail keeps moving. How long can you keep up?</p>
        </div>
        <div className="intro-note"><span className="note-spark" aria-hidden="true">✳</span><span>One more run<br />never hurt.</span></div>
      </section>

      <section className="game-shell" aria-label="Forest Dash game">
        <div className="game-topline">
          <span className="game-state"><span className={`state-dot ${screen}`} />{screen === 'running' ? 'ON THE TRAIL' : screen === 'paused' ? 'TRAIL PAUSED' : screen === 'over' ? 'RUN COMPLETE' : 'READY WHEN YOU ARE'}</span>
          <div className="game-stats" aria-live="polite">
            <div><span>DISTANCE</span><strong>{formatScore(displayedScore)}</strong></div>
            <div><span>BERRIES</span><strong className="berry-stat"><i aria-hidden="true" />{hud.berries}</strong></div>
            <div><span>PACE</span><strong>{hud.speed}<small>×</small></strong></div>
          </div>
        </div>

        <div className="game-stage">
          <canvas ref={canvasRef} className="game-canvas" aria-label="A fox runs through a forest. Jump over logs, mushrooms, and rocks; collect berries." />
          {screen !== 'running' && (
            <div className="game-overlay">
              {screen === 'ready' && <>
                <p className="overlay-kicker">A FOREST IS WAITING</p>
                <h2>Ready, little runner?</h2>
                <p>Jump over the trail’s surprises and scoop up berries.</p>
                <button className="play-button" onClick={startGame} type="button"><span aria-hidden="true">▶</span> Start running</button>
              </>}
              {screen === 'paused' && <>
                <p className="overlay-kicker">TAKE YOUR TIME</p>
                <h2>Trail paused</h2>
                <p>Your run is right where you left it.</p>
                <button className="play-button" onClick={() => changeScreen('running')} type="button"><span aria-hidden="true">▶</span> Keep running</button>
              </>}
              {screen === 'over' && <>
                <p className="overlay-kicker">NICE RUN OUT THERE</p>
                <h2>That was a good one.</h2>
                <p>You scored <strong>{formatScore(hud.score)}</strong> and collected <strong>{hud.berries}</strong> berries.</p>
                <button className="play-button" onClick={startGame} type="button"><span aria-hidden="true">↻</span> Run it back</button>
              </>}
            </div>
          )}
        </div>

        <div className="game-controls">
          <p><kbd>SPACE</kbd> or <kbd>↑</kbd> to jump <span className="control-separator">·</span> <kbd>P</kbd> to pause</p>
          <button className="jump-button" type="button" onPointerDown={(event) => { event.preventDefault(); if (screen === 'ready' || screen === 'over') startGame(); else jump() }} aria-label="Jump">
            <span aria-hidden="true">↑</span> JUMP
          </button>
        </div>
      </section>

      <footer className="game-footer">
        <span>BUILT FOR THE JOY OF ONE MORE TRY</span>
        <span>NO DOWNLOAD. JUST RUN.</span>
      </footer>
    </main>
  )
}
