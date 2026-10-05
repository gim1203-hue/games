import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import './CanopyQuest.css'

const VIEW_WIDTH = 960
const VIEW_HEIGHT = 540
const STAGES = [
  {
    name: 'Fernwood Bend',
    note: 'Find the old footpaths through the fern valley.',
    width: 2700,
    grounds: [[0, 590, 464], [740, 600, 440], [1480, 500, 464], [2120, 580, 444]],
    ledges: [[600, 355, 128], [1350, 340, 120], [1960, 350, 130]],
    vines: [[660, 188], [1410, 170], [2035, 185]],
    fruit: [250, 410, 510, 300, 880, 380, 1170, 320, 1530, 410, 1810, 360, 2290, 385, 2480, 385],
    thorns: [930, 370, 1740, 390, 2340, 365],
    checkpoint: 1500,
  },
  {
    name: 'Rainstone Gap',
    note: 'Swing across the river cuts and keep your footing.',
    width: 2920,
    grounds: [[0, 460, 458], [650, 560, 438], [1400, 520, 458], [2100, 820, 430]],
    ledges: [[460, 330, 110], [1190, 345, 118], [1930, 325, 125]],
    vines: [[555, 165], [1320, 145], [2020, 170]],
    fruit: [220, 405, 420, 300, 760, 365, 1020, 380, 1240, 285, 1510, 400, 1780, 350, 1990, 290, 2280, 360, 2500, 380, 2730, 380],
    thorns: [815, 370, 1590, 390, 2420, 365, 2630, 365],
    checkpoint: 1650,
  },
  {
    name: 'Sunleaf Canopy',
    note: 'Climb the high branches and gather the scattered seed pods.',
    width: 3100,
    grounds: [[0, 530, 464], [720, 520, 426], [1450, 520, 450], [2200, 900, 420]],
    ledges: [[520, 350, 128], [1260, 300, 112], [1980, 330, 140]],
    vines: [[635, 160], [1380, 145], [2130, 155]],
    fruit: [240, 408, 440, 300, 790, 360, 1040, 300, 1280, 245, 1510, 380, 1760, 320, 2010, 270, 2260, 355, 2500, 315, 2760, 360, 2960, 360],
    thorns: [865, 360, 1590, 370, 2440, 355, 2660, 355, 2850, 355],
    checkpoint: 1800,
  },
  {
    name: 'Moonlit Sanctuary',
    note: 'Reach the sanctuary and return the seed to the forest.',
    width: 3300,
    grounds: [[0, 480, 462], [660, 520, 438], [1390, 520, 460], [2120, 500, 430], [2830, 470, 448]],
    ledges: [[470, 340, 120], [1175, 330, 112], [1900, 300, 122], [2620, 340, 135]],
    vines: [[565, 155], [1340, 145], [2050, 160], [2760, 150]],
    fruit: [180, 405, 390, 300, 735, 365, 950, 330, 1190, 285, 1460, 400, 1680, 340, 1920, 265, 2180, 370, 2390, 300, 2630, 365, 2900, 385, 3140, 385],
    thorns: [820, 370, 1510, 380, 2260, 355, 2990, 370],
    checkpoint: 2320,
  },
]

class CanopyScene extends Phaser.Scene {
  constructor() {
    super('CanopyQuestScene')
    this.levelIndex = 0
    this.score = 0
    this.fruitCount = 0
    this.stageFruitCount = 0
    this.lives = 3
    this.status = 'ready'
    this.swing = null
    this.jumpBufferUntil = 0
    this.coyoteUntil = 0
    this.invulnerableUntil = 0
    this.checkpointX = 80
    this.lastPublished = ''
    this.hudAccumulator = 0
    this.touchInput = { left: false, right: false }
    this.displayObjects = []
    this.colliders = []
  }

  create() {
    this.createTextures()
    this.loadStage(0, 0, 0, 3, false)
    this.status = 'ready'
    this.publish()
    this.game.events.emit('engine-ready')
  }

  createTextures() {
    const drawTexture = (key, width, height, draw) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false })
      draw(graphics)
      graphics.generateTexture(key, width, height)
      graphics.destroy()
    }

    drawTexture('canopy-hero', 48, 62, (g) => {
      g.fillStyle(0x273f33).fillRoundedRect(12, 22, 25, 31, 10)
      g.fillStyle(0xe4b363).fillCircle(25, 16, 13)
      g.fillStyle(0x32493a).fillRoundedRect(9, 4, 31, 8, 4)
      g.fillStyle(0xead8b3).fillCircle(30, 16, 2)
      g.fillStyle(0xd87854).fillRoundedRect(10, 34, 29, 7, 3)
      g.fillStyle(0x8d6243).fillRoundedRect(14, 51, 7, 10, 2)
      g.fillStyle(0x8d6243).fillRoundedRect(29, 51, 7, 10, 2)
      g.fillStyle(0xb78b4e).fillRoundedRect(33, 28, 9, 14, 3)
    })

    drawTexture('canopy-ground', 128, 64, (g) => {
      g.fillStyle(0x52785a).fillRect(0, 0, 128, 12)
      g.fillStyle(0x7f6347).fillRect(0, 12, 128, 52)
      g.fillStyle(0x9a7954).fillRect(0, 12, 128, 5)
      g.fillStyle(0x47674c).fillRect(10, 2, 24, 5)
      g.fillStyle(0x63815c).fillRect(76, 4, 35, 4)
      g.fillStyle(0x654b39).fillRect(22, 31, 18, 3)
      g.fillStyle(0x654b39).fillRect(89, 47, 25, 3)
    })

    drawTexture('canopy-ledge', 128, 24, (g) => {
      g.fillStyle(0x52785a).fillRoundedRect(0, 0, 128, 9, 4)
      g.fillStyle(0x8e7150).fillRoundedRect(0, 7, 128, 17, 3)
      g.fillStyle(0x66825f).fillRect(19, 2, 31, 3)
      g.fillStyle(0x47674c).fillRect(82, 1, 23, 4)
    })

    drawTexture('canopy-fruit', 26, 34, (g) => {
      g.fillStyle(0xe0a845).fillCircle(13, 19, 11)
      g.fillStyle(0x66885a).fillEllipse(18, 6, 12, 6)
      g.lineStyle(2, 0x617747).lineBetween(13, 7, 13, 11)
    })

    drawTexture('canopy-thorn', 46, 42, (g) => {
      g.fillStyle(0xb96753)
      g.fillTriangle(2, 33, 9, 4, 17, 33)
      g.fillTriangle(13, 35, 23, 0, 33, 35)
      g.fillTriangle(27, 34, 37, 5, 45, 34)
      g.fillStyle(0x81563f).fillRoundedRect(3, 31, 40, 10, 5)
    })

    drawTexture('canopy-gate', 58, 92, (g) => {
      g.fillStyle(0x6f875d).fillRoundedRect(4, 12, 50, 78, 16)
      g.fillStyle(0xd8b45d).fillRoundedRect(13, 22, 32, 68, 12)
      g.fillStyle(0x425d43).fillRoundedRect(20, 38, 18, 52, 9)
      g.fillStyle(0xf0d88d).fillCircle(38, 56, 3)
      g.fillStyle(0x5d794f).fillTriangle(0, 17, 29, 0, 58, 17)
    })

    drawTexture('canopy-vine-leaf', 28, 18, (g) => {
      g.fillStyle(0x719162).fillEllipse(13, 9, 26, 13)
      g.lineStyle(2, 0x476b4b).lineBetween(2, 9, 24, 9)
    })
  }

  publish() {
    const stage = STAGES[this.levelIndex]
    const view = {
      status: this.status,
      stage: this.levelIndex,
      stageName: stage.name,
      stageNote: stage.note,
      score: this.score,
      fruit: this.fruitCount,
      stageFruitCount: this.stageFruitCount,
      stageFruitTotal: stage.fruit.length / 2,
      lives: this.lives,
      progress: this.player ? Math.min(100, Math.floor(this.player.x / (STAGES[this.levelIndex].width - 100) * 100)) : 0,
      totalStages: STAGES.length,
    }
    const key = JSON.stringify(view)
    if (key !== this.lastPublished) {
      this.lastPublished = key
      this.game.events.emit('hud', view)
    }
  }

  clearStage() {
    this.colliders.forEach((collider) => collider.destroy())
    this.colliders = []
    this.displayObjects.forEach((object) => object.destroy())
    this.displayObjects = []
    this.platforms?.clear(true, true)
    this.fruits?.clear(true, true)
    this.thorns?.clear(true, true)
    this.checkpoints?.clear(true, true)
    this.goals?.clear(true, true)
    this.player?.destroy()
    this.parallax?.destroy()
    this.swing = null
  }

  loadStage(index, score = this.score, fruitCount = this.fruitCount, lives = this.lives, running = true) {
    this.clearStage()
    this.levelIndex = index
    this.score = score
    this.fruitCount = fruitCount
    this.stageFruitCount = 0
    this.lives = lives
    this.status = running ? 'running' : 'ready'
    this.invulnerableUntil = 0
    this.jumpBufferUntil = 0
    this.coyoteUntil = 0
    this.touchInput.left = false
    this.touchInput.right = false
    this.hudAccumulator = 0

    const stage = STAGES[index]
    this.physics.world.setBounds(0, 0, stage.width, VIEW_HEIGHT)
    this.cameras.main.setBounds(0, 0, stage.width, VIEW_HEIGHT)
    this.drawBackground(stage)

    this.platforms = this.physics.add.staticGroup()
    stage.grounds.forEach(([x, width, y]) => {
      this.platforms.create(x + width / 2, y + 32, 'canopy-ground')
        .setDisplaySize(width, 64)
        .refreshBody()
    })
    stage.ledges.forEach(([x, y, width]) => {
      this.platforms.create(x + width / 2, y + 12, 'canopy-ledge')
        .setDisplaySize(width, 24)
        .refreshBody()
    })

    this.vines = stage.vines.map(([x, y]) => ({ x, y, length: 155 }))
    this.vines.forEach((vine) => this.drawVine(vine))

    this.fruits = this.physics.add.staticGroup()
    for (let offset = 0; offset < stage.fruit.length; offset += 2) {
      const fruit = this.fruits.create(stage.fruit[offset], stage.fruit[offset + 1], 'canopy-fruit')
      fruit.refreshBody()
      fruit.body.setCircle(12, 1, 4)
    }

    this.thorns = this.physics.add.staticGroup()
    for (let offset = 0; offset < stage.thorns.length; offset += 2) {
      const thorn = this.thorns.create(stage.thorns[offset], stage.thorns[offset + 1], 'canopy-thorn')
      thorn.refreshBody()
      thorn.body.setSize(36, 20).setOffset(5, 19)
    }

    this.checkpoints = this.physics.add.staticGroup()
    this.checkpointX = 80
    const checkpointGround = this.groundAt(stage.checkpoint)
    const checkpoint = this.checkpoints.create(stage.checkpoint, checkpointGround - 25, 'canopy-vine-leaf')
      .setDisplaySize(30, 20)
    checkpoint.refreshBody()

    this.goals = this.physics.add.staticGroup()
    const goalX = stage.width - 104
    const goalGround = this.groundAt(goalX)
    const goal = this.goals.create(goalX, goalGround - 46, 'canopy-gate')
    goal.refreshBody()
    goal.body.setSize(40, 84).setOffset(9, 8)

    const startGround = this.groundAt(80)
    this.player = this.physics.add.sprite(80, startGround - 36, 'canopy-hero')
      .setDepth(5)
      .setCollideWorldBounds(false)
    this.player.body.setSize(27, 53).setOffset(10, 6)
    this.player.setMaxVelocity(340, 900)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.06)
    this.cameras.main.setDeadzone(250, 135)

    this.colliders.push(this.physics.add.collider(this.player, this.platforms))
    this.colliders.push(this.physics.add.overlap(this.player, this.fruits, this.collectFruit, undefined, this))
    this.colliders.push(this.physics.add.overlap(this.player, this.thorns, this.hitThorn, undefined, this))
    this.colliders.push(this.physics.add.overlap(this.player, this.checkpoints, this.reachCheckpoint, undefined, this))
    this.colliders.push(this.physics.add.overlap(this.player, this.goals, this.finishStage, undefined, this))

    this.publish()
  }

  groundAt(x) {
    const stage = STAGES[this.levelIndex]
    const segment = stage.grounds.find(([start, width]) => x >= start && x <= start + width)
    return segment ? segment[2] : 455
  }

  drawBackground(stage) {
    this.parallax = this.add.graphics().setScrollFactor(0.12).setDepth(-20)
    this.parallax.fillStyle(0xafd0ba).fillRect(-100, 0, stage.width + 400, VIEW_HEIGHT)
    this.parallax.fillStyle(0xeee2b4).fillCircle(760, 92, 40)
    this.parallax.fillStyle(0x9bbd9c)
    for (let x = -120; x < stage.width + 200; x += 360) {
      this.parallax.fillEllipse(x + 150, 320, 520, 205)
    }
    this.parallax.fillStyle(0x769a78)
    for (let x = -160; x < stage.width + 200; x += 300) {
      this.parallax.fillEllipse(x + 130, 375, 450, 175)
    }

    const trees = this.add.graphics().setScrollFactor(0.43).setDepth(-10)
    for (let x = -70; x < stage.width + 100; x += 148) {
      const variation = Math.abs(Math.floor(x / 148) % 3)
      const height = 115 + variation * 27
      trees.fillStyle(0x557c5c).fillRect(x + 24, 380 - height * 0.34, 18, height * 0.58)
      trees.fillStyle(variation === 1 ? 0x668d67 : 0x5e875f)
      trees.fillTriangle(x + 32, 380 - height, x - 9, 380 - height * 0.34, x + 73, 380 - height * 0.34)
      trees.fillTriangle(x + 32, 380 - height * 0.72, x - 2, 380 - height * 0.1, x + 68, 380 - height * 0.1)
    }
    this.displayObjects.push(trees)
  }

  drawVine(vine) {
    const rope = this.add.graphics().setDepth(2)
    rope.lineStyle(4, 0x5d7749, 0.9)
    rope.lineBetween(vine.x, 0, vine.x, vine.y)
    rope.fillStyle(0x7a955f).fillCircle(vine.x, vine.y, 7)
    rope.fillStyle(0x7a955f).fillEllipse(vine.x - 12, vine.y + 12, 22, 11)
    rope.fillStyle(0x7a955f).fillEllipse(vine.x + 12, vine.y + 22, 22, 11)
    this.displayObjects.push(rope)
  }

  startCampaign() {
    this.score = 0
    this.fruitCount = 0
    this.lives = 3
    this.loadStage(0, 0, 0, 3, true)
  }

  restartCampaign() {
    this.startCampaign()
  }

  setTouchInput(direction, isDown) {
    this.touchInput[direction] = isDown
  }

  touchJump() {
    if (this.status !== 'running' || !this.player?.body) return
    this.jumpBufferUntil = this.time.now + 360
    if (this.player.body.blocked.down || this.player.body.touching.down || this.time.now < this.coyoteUntil) {
      this.player.setVelocityY(-660)
      this.jumpBufferUntil = 0
      this.coyoteUntil = 0
    }
  }

  touchSwing() {
    if (this.status !== 'running' || !this.player?.body) return
    if (this.swing) {
      const swing = this.swing
      this.swing = null
      this.player.body.setAllowGravity(true)
      this.player.setVelocity(
        Math.cos(swing.angle) * swing.angularVelocity * swing.length,
        -Math.sin(swing.angle) * swing.angularVelocity * swing.length,
      )
      return
    }
    const vine = this.nearestVine()
    if (vine) this.attachVine(vine)
  }

  nextStage() {
    const next = this.levelIndex + 1
    if (next < STAGES.length) this.loadStage(next, this.score, this.fruitCount, this.lives, true)
  }

  collectFruit(player, fruit) {
    if (!fruit.active) return
    fruit.destroy()
    this.score += 100
    this.fruitCount += 1
    this.stageFruitCount += 1
    this.publish()
  }

  reachCheckpoint(player, marker) {
    if (!marker.active) return
    marker.destroy()
    this.checkpointX = player.x
    this.score += 250
    this.cameras.main.flash(180, 242, 219, 142)
    this.publish()
  }

  hitThorn() {
    this.takeHit()
  }

  takeHit() {
    if (this.status !== 'running' || this.time.now < this.invulnerableUntil) return
    this.invulnerableUntil = this.time.now + 1200
    this.lives -= 1
    this.swing = null
    this.player.body.setAllowGravity(true)
    this.player.setVelocity(0, 0)
    if (this.lives <= 0) {
      this.status = 'game-over'
      this.player.body.enable = false
    } else {
      const ground = this.groundAt(this.checkpointX)
      this.player.body.reset(this.checkpointX, ground - 62)
      this.player.setVelocity(0, -130)
      this.cameras.main.shake(110, 0.003)
    }
    this.publish()
  }

  finishStage() {
    if (this.status !== 'running') return
    this.status = this.levelIndex === STAGES.length - 1 ? 'campaign-clear' : 'stage-clear'
    this.swing = null
    this.player.setVelocity(0, 0)
    this.player.body.enable = false
    this.score += 500
    this.publish()
  }

  nearestVine() {
    let best = null
    let bestDistance = 150
    this.vines.forEach((vine) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, vine.x, vine.y)
      if (distance < bestDistance) {
        best = vine
        bestDistance = distance
      }
    })
    return best
  }

  attachVine(vine) {
    const dx = this.player.x - vine.x
    const dy = this.player.y - vine.y
    const distance = Phaser.Math.Clamp(Math.hypot(dx, dy), 92, vine.length)
    const angle = Math.atan2(dx, dy)
    const velocity = this.player.body.velocity
    const angularVelocity = (velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle)) / distance
    this.swing = { vine, angle, angularVelocity, length: distance }
    this.player.body.setAllowGravity(false)
    this.player.setVelocity(0, 0)
  }

  updateSwing(delta) {
    const swing = this.swing
    const direction = (this.touchInput.right ? 1 : 0) - (this.touchInput.left ? 1 : 0)
    swing.angularVelocity += (-1050 / swing.length * Math.sin(swing.angle) + direction * 1.35) * delta
    swing.angularVelocity *= 0.998
    swing.angle += swing.angularVelocity * delta
    const x = swing.vine.x + Math.sin(swing.angle) * swing.length
    const y = swing.vine.y + Math.cos(swing.angle) * swing.length
    const tangentX = Math.cos(swing.angle) * swing.angularVelocity * swing.length
    const tangentY = -Math.sin(swing.angle) * swing.angularVelocity * swing.length
    this.player.body.reset(x, y)
    this.player.setVelocity(tangentX, tangentY)
    if (this.player.y > VIEW_HEIGHT + 60) this.takeHit()
  }

  update(time, deltaMs) {
    if (this.status !== 'running' || !this.player?.active) return
    const delta = Math.min(deltaMs / 1000, 0.035)
    this.hudAccumulator += deltaMs
    const left = this.touchInput.left
    const right = this.touchInput.right
    const horizontal = (right ? 1 : 0) - (left ? 1 : 0)

    if (this.swing) {
      this.updateSwing(delta)
    } else {
      this.player.setVelocityX(horizontal * 250)
      const grounded = this.player.body.blocked.down || this.player.body.touching.down
      if (grounded) this.coyoteUntil = this.time.now + 170
      if (grounded && this.time.now < this.jumpBufferUntil) {
        this.player.setVelocityY(-660)
        this.jumpBufferUntil = 0
        this.coyoteUntil = 0
      }
    }

    if (this.player.y > VIEW_HEIGHT + 90) this.takeHit()
    if (this.time.now > this.invulnerableUntil) this.player.setAlpha(1)
    else this.player.setAlpha(Math.floor(this.time.now / 100) % 2 ? 0.45 : 1)
    if (this.hudAccumulator >= 180) {
      this.hudAccumulator %= 180
      this.publish()
    }
  }
}

export default function CanopyQuest({ onExit }) {
  const mountRef = useRef(null)
  const gameRef = useRef(null)
  const [engineReady, setEngineReady] = useState(false)
  const [hud, setHud] = useState({ status: 'ready', stage: 0, stageName: STAGES[0].name, stageNote: STAGES[0].note, score: 0, fruit: 0, stageFruitCount: 0, stageFruitTotal: STAGES[0].fruit.length / 2, lives: 3, totalStages: STAGES.length })

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    mount.replaceChildren()
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: VIEW_WIDTH,
      height: VIEW_HEIGHT,
      parent: mountRef.current,
      backgroundColor: '#b5d0b8',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade', arcade: { gravity: { y: 980 }, debug: false } },
      scene: CanopyScene,
      render: { antialias: true, pixelArt: false },
    })
    gameRef.current = game
    const onHud = (state) => setHud(state)
    const onReady = () => setEngineReady(true)
    const getScene = () => game.scene.getScene('CanopyQuestScene')
    const onKeyDown = (event) => {
      const scene = getScene()
      if (!scene || scene.status !== 'running') return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(event.code)) event.preventDefault()
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') scene.setTouchInput('left', true)
      if (event.code === 'ArrowRight' || event.code === 'KeyD') scene.setTouchInput('right', true)
      if (!event.repeat && ['ArrowUp', 'Space', 'KeyW'].includes(event.code)) scene.touchJump()
      if (!event.repeat && ['KeyE', 'ShiftLeft', 'ShiftRight'].includes(event.code)) scene.touchSwing()
    }
    const onKeyUp = (event) => {
      const scene = getScene()
      if (!scene) return
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') scene.setTouchInput('left', false)
      if (event.code === 'ArrowRight' || event.code === 'KeyD') scene.setTouchInput('right', false)
    }
    game.events.on('hud', onHud)
    game.events.once('engine-ready', onReady)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      game.events.off('hud', onHud)
      game.events.off('engine-ready', onReady)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      game.destroy(true)
      mount.replaceChildren()
      gameRef.current = null
    }
  }, [])

  function command(method, ...args) {
    const scene = gameRef.current?.scene.getScene('CanopyQuestScene')
    if (scene && typeof scene[method] === 'function') scene[method](...args)
  }

  return (
    <main className="game-page canopy-page">
      <header className="game-header">
        <a className="brand" href="#canopy" aria-label="Fieldnotes Arcade home" onClick={(event) => { event.preventDefault(); onExit() }}>
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>fieldnotes<span className="brand-dot">.</span></span>
        </a>
        <button className="back-link" type="button" onClick={onExit}><span aria-hidden="true">←</span> ARCADE</button>
      </header>

      <section className="canopy-intro" id="canopy">
        <p className="eyebrow"><span className="live-dot" /> ORIGINAL JUNGLE PLATFORMER <span className="eyebrow-divider">/</span> CAMPAIGN
        </p>
        <h1>Canopy <span>Quest</span></h1>
        <p className="intro-copy">Guide Kai through four wild stages to return a lost seed to the Moonlit Sanctuary.</p>
      </section>

      <section className="canopy-shell" aria-label="Canopy Quest game">
        <div className="canopy-toolbar">
          <div className="canopy-stage-label"><span>STAGE {String(hud.stage + 1).padStart(2, '0')} / {String(hud.totalStages).padStart(2, '0')}</span><strong>{hud.stageName}</strong></div>
          <div className="canopy-stat"><span>SEED PODS</span><strong>{hud.stageFruitCount}<small> / {hud.stageFruitTotal}</small></strong></div>
          <div className="canopy-stat"><span>VITALITY</span><strong>{'●'.repeat(hud.lives)}<i>{'●'.repeat(3 - hud.lives)}</i></strong></div>
          <div className="canopy-stat"><span>TRAIL SCORE</span><strong>{hud.score.toString().padStart(5, '0')}</strong></div>
        </div>

        <div className="canopy-stage">
          <div className="phaser-mount" ref={mountRef} />
          <div className="canopy-progress" role="progressbar" aria-label="Stage progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={hud.progress || 0}><span style={{ width: `${hud.progress || 0}%` }} /></div>
          {hud.status !== 'running' && (
            <div className="canopy-overlay">
              {hud.status === 'ready' && <>
                <p className="overlay-kicker">A FOUR-STAGE CANOPY EXPEDITION</p>
                <h2>Ready, Kai?</h2>
                <p>{hud.stageNote} Run, jump, swing from hanging vines, gather seed pods, and reach the sanctuary gate.</p>
                <button className="play-button" type="button" disabled={!engineReady} onClick={() => command('startCampaign')}><span aria-hidden="true">▶</span> {engineReady ? 'Start expedition' : 'Loading trail…'}</button>
              </>}
              {hud.status === 'stage-clear' && <>
                <p className="overlay-kicker">STAGE {hud.stage + 1} COMPLETE</p>
                <h2>{hud.stageName} crossed.</h2>
                <p>{hud.stageNote} Your score carries into the next stage.</p>
                <button className="play-button" type="button" onClick={() => command('nextStage')}><span aria-hidden="true">→</span> Next stage</button>
              </>}
              {hud.status === 'campaign-clear' && <>
                <p className="overlay-kicker">EXPEDITION COMPLETE</p>
                <h2>The seed is home.</h2>
                <p>Kai reached the Moonlit Sanctuary with {hud.fruit} seed pods and a trail score of {hud.score}.</p>
                <button className="play-button" type="button" onClick={() => command('restartCampaign')}><span aria-hidden="true">↻</span> Play campaign again</button>
              </>}
              {hud.status === 'game-over' && <>
                <p className="overlay-kicker">THE TRAIL CAN WAIT</p>
                <h2>Take another path.</h2>
                <p>You reached {hud.stageName}. Your collected seed pods stay in the score.</p>
                <button className="play-button" type="button" onClick={() => command('restartCampaign')}><span aria-hidden="true">↻</span> Restart expedition</button>
              </>}
            </div>
          )}
        </div>

        <div className="canopy-controls">
          <p><kbd>←</kbd><kbd>→</kbd> move <span>·</span> <kbd>SPACE</kbd> jump <span>·</span> <kbd>E</kbd> grab / release vine</p>
          <div className="canopy-touch-controls">
            <button type="button" aria-label="Move left" onPointerDown={() => command('setTouchInput', 'left', true)} onPointerUp={() => command('setTouchInput', 'left', false)} onPointerLeave={() => command('setTouchInput', 'left', false)}>←</button>
            <button type="button" aria-label="Jump" onPointerDown={() => command('touchJump')}>↑</button>
            <button type="button" aria-label="Grab or release vine" onClick={() => command('touchSwing')}>E</button>
            <button type="button" aria-label="Move right" onPointerDown={() => command('setTouchInput', 'right', true)} onPointerUp={() => command('setTouchInput', 'right', false)} onPointerLeave={() => command('setTouchInput', 'right', false)}>→</button>
          </div>
        </div>
      </section>
      <footer className="game-footer"><span>CANOPY QUEST / AN ORIGINAL CAMPAIGN</span><span>FOUR STAGES. ONE BIG JOURNEY.</span></footer>
    </main>
  )
}
