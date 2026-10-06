import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { storyCampaigns } from './storyCampaignData.js'
import './StoryCampaign.css'

const WIDTH = 960
const HEIGHT = 540
const CAMPAIGN_COLORS = {
  moss: { sky: 0xaed0b9, far: 0x91b59a, near: 0x658c6d, ground: 0x795d43, trim: 0x658565, token: 0xe6b94f },
  amber: { sky: 0xd5b879, far: 0xa77f59, near: 0x715744, ground: 0x59483d, trim: 0xd0984e, token: 0xf2d67c },
  coral: { sky: 0xc99582, far: 0xa46760, near: 0x734b50, ground: 0x4e4146, trim: 0xe37d61, token: 0xf1cb68 },
  teal: { sky: 0x91c8c3, far: 0x548f91, near: 0x386d78, ground: 0x35535e, trim: 0x5aa2a3, token: 0xf1cb68 },
  night: { sky: 0x182b48, far: 0x354d6a, near: 0x536b7c, ground: 0x293a50, trim: 0x55d5ce, token: 0xf5d46d },
  violet: { sky: 0x8780ac, far: 0x615f86, near: 0x45566d, ground: 0x384b58, trim: 0xa2c4bc, token: 0xe9c275 },
}

class StoryScene extends Phaser.Scene {
  constructor(campaign) {
    super({ key: 'StoryCampaignScene' })
    this.campaign = campaign
    this.stageIndex = 0
    this.status = 'story'
    this.score = 0
    this.lives = 3
    this.objectiveCount = 0
    this.inputState = { left: false, right: false, up: false, down: false, shoot: false }
    this.eventsToRemove = []
  }

  create() {
    this.createTextures()
    this.beginStage(0, false)
    this.game.events.emit('story-engine-ready')
  }

  createTextures() {
    const colors = CAMPAIGN_COLORS[this.campaign.palette] || CAMPAIGN_COLORS.moss
    const prefix = `story-${this.campaign.id}-`
    const texture = (name, width, height, draw) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false })
      draw(graphics)
      graphics.generateTexture(prefix + name, width, height)
      graphics.destroy()
    }
    this.textureKeys = {
      hero: prefix + 'hero', enemy: prefix + 'enemy', bullet: prefix + 'bullet', token: prefix + 'token',
      ground: prefix + 'ground', ledge: prefix + 'ledge', hazard: prefix + 'hazard', gate: prefix + 'gate',
      wall: prefix + 'wall', rock: prefix + 'rock',
    }

    texture('hero', 42, 50, (g) => {
      g.fillStyle(colors.trim).fillRoundedRect(8, 17, 27, 30, 8)
      g.fillStyle(0xf0c37a).fillCircle(21, 13, 12)
      g.fillStyle(0x263d3a).fillRoundedRect(8, 5, 26, 7, 4)
      g.fillStyle(0xfff2d5).fillCircle(25, 13, 2)
      g.fillStyle(0x604639).fillRoundedRect(9, 44, 9, 6, 2)
      g.fillStyle(0x604639).fillRoundedRect(26, 44, 9, 6, 2)
    })
    texture('enemy', 36, 32, (g) => {
      g.fillStyle(this.campaign.enemyColor || 0xd06c59).fillRoundedRect(3, 5, 30, 24, 8)
      g.fillStyle(0xfff3d3).fillCircle(12, 14, 3)
      g.fillStyle(0xfff3d3).fillCircle(24, 14, 3)
      g.fillStyle(0x263d3a).fillCircle(12, 14, 1.5)
      g.fillStyle(0x263d3a).fillCircle(24, 14, 1.5)
    })
    texture('bullet', 10, 18, (g) => {
      g.fillStyle(colors.token).fillRoundedRect(2, 1, 6, 16, 3)
    })
    texture('token', 25, 30, (g) => {
      g.fillStyle(colors.token).fillCircle(12, 17, 10)
      g.fillStyle(0xfff2bf).fillCircle(9, 13, 3)
      g.fillStyle(colors.trim).fillEllipse(18, 5, 10, 5)
    })
    texture('ground', 128, 64, (g) => {
      g.fillStyle(colors.trim).fillRect(0, 0, 128, 11)
      g.fillStyle(colors.ground).fillRect(0, 11, 128, 53)
      g.fillStyle(0xffffff, 0.14).fillRect(8, 23, 35, 3)
      g.fillStyle(0x172a28, 0.18).fillRect(62, 42, 42, 3)
    })
    texture('ledge', 128, 22, (g) => {
      g.fillStyle(colors.trim).fillRoundedRect(0, 0, 128, 8, 4)
      g.fillStyle(colors.ground).fillRoundedRect(0, 7, 128, 15, 4)
    })
    texture('hazard', 46, 36, (g) => {
      g.fillStyle(this.campaign.enemyColor || 0xc8755d)
      g.fillTriangle(2, 33, 12, 4, 22, 33)
      g.fillTriangle(16, 34, 29, 0, 42, 34)
      g.fillStyle(colors.ground).fillRoundedRect(2, 30, 42, 6, 3)
    })
    texture('gate', 54, 88, (g) => {
      g.fillStyle(colors.trim).fillRoundedRect(4, 10, 46, 74, 13)
      g.fillStyle(colors.token).fillRoundedRect(13, 18, 28, 66, 9)
      g.fillStyle(colors.ground).fillRoundedRect(20, 34, 14, 50, 7)
      g.fillStyle(0xfff1c5).fillCircle(36, 54, 3)
    })
    texture('wall', 52, 52, (g) => {
      g.fillStyle(colors.near).fillRoundedRect(1, 1, 50, 50, 4)
      g.lineStyle(2, 0xffffff, 0.14).strokeRect(5, 5, 42, 42)
    })
    texture('rock', 34, 34, (g) => {
      g.fillStyle(this.campaign.enemyColor || 0x647c86).fillCircle(17, 17, 15)
      g.fillStyle(0xffffff, 0.3).fillCircle(12, 11, 4)
    })
  }

  publish() {
    const stage = this.campaign.stages[this.stageIndex]
    const view = {
      status: this.status,
      stageIndex: this.stageIndex,
      stage,
      title: this.campaign.title,
      story: this.campaign.story,
      score: this.score,
      lives: this.lives,
      count: this.campaign.mode === 'lights' ? this.lights.filter(Boolean).length : this.objectiveCount,
      target: this.campaign.mode === 'lights' ? 25 : this.levelGoal,
      progress: this.progressValue(),
      mode: this.campaign.mode,
    }
    this.game.events.emit('campaign-hud', view)
  }

  progressValue() {
    if (this.campaign.mode === 'lights') return Math.floor((25 - this.lights.filter(Boolean).length) / 25 * 100)
    if (this.campaign.mode === 'platform' || this.campaign.mode === 'runner') {
      const distance = this.player ? Math.floor(this.player.x / (this.worldWidth - 100) * 100) : 0
      const objectives = Math.floor(this.objectiveCount / this.levelGoal * 100)
      return Math.min(distance, objectives)
    }
    return Math.min(100, Math.floor(this.objectiveCount / this.levelGoal * 100))
  }

  clearStageObjects() {
    this.colliders?.forEach((collider) => collider.destroy())
    this.colliders = []
    this.objects?.forEach((object) => object.destroy())
    this.objects = []
    this.groups?.forEach((group) => group.clear(true, true))
    this.groups = []
    this.player?.destroy()
    this.background?.destroy()
    this.platforms = null
    this.tokens = null
    this.hazards = null
    this.enemies = null
    this.bullets = null
    this.mazeWalls = null
    this.goalSprite = null
  }

  beginStage(index, running = false) {
    this.clearStageObjects()
    this.stageIndex = index
    this.currentStage = this.campaign.stages[index]
    this.objectiveCount = 0
    this.status = running ? 'running' : 'story'
    this.elapsed = 0
    this.lastPublishedAt = 0
    this.spawnTimer = 0
    this.shotTimer = 0
    this.lastGridMove = 0
    this.lastJump = -1
    this.jumpBufferUntil = 0
    this.coyoteUntil = 0
    this.mazeCollected = new Set()
    this.levelGoal = this.campaign.mode === 'lights' || (this.campaign.mode === 'shooter' && this.currentStage.boss)
      ? 1
      : this.currentStage.target
    this.worldWidth = this.currentStage.worldWidth || 960
    this.physics.world.setBounds(0, 0, this.worldWidth, HEIGHT)
    this.cameras.main.setBounds(0, 0, this.worldWidth, HEIGHT)
    this.drawBackground()

    const mode = this.campaign.mode
    if (mode === 'shooter') this.createShooterStage()
    else if (mode === 'platform' || mode === 'runner') {
      this.createPlatformStage()
      if (mode === 'runner') this.player.setVelocityX(220)
    }
    else if (mode === 'maze') this.createMazeStage()
    else if (mode === 'lights') this.createLightsStage()
    else this.createFlightStage()
    this.publish()
  }

  startStage() {
    this.status = 'running'
    this.publish()
  }

  requestJump() {
    if (this.status === 'running') this.jumpBufferUntil = this.elapsed + 0.22
  }

  startCampaign() {
    this.score = 0
    this.lives = 3
    this.beginStage(0, true)
  }

  nextStage() {
    if (this.stageIndex >= this.campaign.stages.length - 1) return
    this.beginStage(this.stageIndex + 1, false)
  }

  retryStage() {
    this.lives = 3
    this.beginStage(this.stageIndex, false)
  }

  restartCampaign() {
    this.startCampaign()
  }

  finishStage() {
    if (this.status !== 'running') return
    this.status = this.stageIndex === this.campaign.stages.length - 1 ? 'campaign-clear' : 'stage-clear'
    if (this.player?.body) {
      this.player.setVelocity(0, 0)
      this.player.body.enable = false
    }
    this.publish()
  }

  hurtPlayer() {
    if (this.status !== 'running' || this.time.now < (this.invulnerableUntil || 0)) return
    this.invulnerableUntil = this.time.now + 900
    this.lives -= 1
    if (this.lives <= 0) {
      this.status = 'game-over'
      if (this.player?.body) this.player.body.enable = false
    } else if (this.player?.body) {
      this.player.setPosition(this.spawnX || 90, this.spawnY || 430)
      this.player.setVelocity(0, 0)
    }
    this.publish()
  }

  collectToken(player, token) {
    if (!token.active) return
    token.destroy()
    this.objectiveCount += 1
    this.score += 100
    if (this.objectiveCount >= this.levelGoal && this.campaign.mode !== 'platform' && this.campaign.mode !== 'runner') this.finishStage()
    this.publish()
  }

  hitHazard() {
    this.hurtPlayer()
  }

  drawBackground() {
    const colors = CAMPAIGN_COLORS[this.campaign.palette] || CAMPAIGN_COLORS.moss
    this.background = this.add.graphics().setDepth(-10)
    this.background.fillStyle(colors.sky).fillRect(0, 0, this.worldWidth, HEIGHT)
    this.background.fillStyle(0xffffff, 0.28).fillCircle(this.worldWidth * 0.73, 90, 34)
    this.background.fillStyle(colors.far)
    for (let x = 0; x < this.worldWidth + 180; x += 280) this.background.fillEllipse(x + 90, 380, 390, 180)
    this.background.fillStyle(colors.near)
    for (let x = 0; x < this.worldWidth + 180; x += 245) this.background.fillEllipse(x + 70, 445, 300, 130)
    if (this.campaign.palette === 'night') {
      this.background.fillStyle(0xffffff, 0.75)
      for (let i = 0; i < 64; i++) {
        const x = (i * 167) % this.worldWidth
        const y = 25 + ((i * 71) % 230)
        this.background.fillCircle(x, y, i % 7 === 0 ? 2 : 1)
      }
    }
  }

  createPlayer(x, y, worldBounds = false) {
    this.spawnX = x
    this.spawnY = y
    this.player = this.physics.add.sprite(x, y, `story-${this.campaign.id}-hero`)
    this.player.body.setSize(25, 36).setOffset(9, 9)
    this.player.setCollideWorldBounds(worldBounds)
    this.player.setMaxVelocity(330, 900)
    this.player.body.setGravityY(0)
    return this.player
  }

  createToken(x, y) {
    return this.tokens.create(x, y, `story-${this.campaign.id}-token`)
  }

  createShooterStage() {
    this.worldWidth = WIDTH
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT)
    this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT)
    const hero = this.createPlayer(WIDTH / 2, HEIGHT - 72, true)
    hero.body.setAllowGravity(false)
    hero.body.setSize(30, 35).setOffset(6, 9)
    this.enemies = this.physics.add.group()
    this.bullets = this.physics.add.group({ defaultKey: `story-${this.campaign.id}-bullet`, maxSize: 30 })
    this.enemyBullets = this.physics.add.group({ defaultKey: `story-${this.campaign.id}-rock`, maxSize: 24 })
    this.groups.push(this.enemies, this.bullets, this.enemyBullets)
    this.enemyShotTimer = 0.8
    this.tokens = this.physics.add.staticGroup()
    this.groups.push(this.tokens)

    const amount = this.currentStage.boss ? 1 : this.currentStage.target
    for (let i = 0; i < amount; i++) {
      const col = i % 6
      const row = Math.floor(i / 6)
      const enemy = this.enemies.create(110 + col * 145, 90 + row * 70, `story-${this.campaign.id}-enemy`)
      enemy.body.setAllowGravity(false)
      enemy.setCollideWorldBounds(true).setBounceX(1)
      enemy.setVelocityX((col % 2 ? -1 : 1) * (55 + row * 12))
      enemy.setData('bossHits', this.currentStage.boss ? this.currentStage.bossHits : 1)
    }
    this.colliders.push(this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this))
    this.colliders.push(this.physics.add.overlap(this.enemyBullets, this.player, (bullet) => {
      bullet.destroy()
      this.hurtPlayer()
    }, undefined, this))
    this.publish()
  }

  hitEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return
    bullet.destroy()
    const hits = enemy.getData('bossHits') - 1
    if (hits > 0) {
      enemy.setData('bossHits', hits)
      enemy.setTint(0xffffff)
      this.time.delayedCall(90, () => enemy.clearTint())
      return
    }
    enemy.destroy()
    this.objectiveCount += 1
    this.score += this.currentStage.boss ? 250 : 100
    if (this.objectiveCount >= this.levelGoal) this.finishStage()
    this.publish()
  }

  createPlatformStage() {
    this.worldWidth = this.currentStage.worldWidth || 2250
    this.physics.world.setBounds(0, 0, this.worldWidth, HEIGHT)
    this.cameras.main.setBounds(0, 0, this.worldWidth, HEIGHT)
    this.cameras.main.setDeadzone(245, 135)
    this.platforms = this.physics.add.staticGroup()
    this.hazards = this.physics.add.staticGroup()
    this.tokens = this.physics.add.staticGroup()
    this.goals = this.physics.add.staticGroup()
    this.groups.push(this.platforms, this.hazards, this.tokens, this.goals)

    const gaps = (this.currentStage.gaps || [620, 1260])
      .map((center) => [center - 55, center + 75])
      .sort((first, second) => first[0] - second[0])
    const groundSegments = []
    let groundStart = 0
    gaps.forEach(([gapStart, gapEnd]) => {
      if (gapStart > groundStart) groundSegments.push([groundStart, gapStart])
      groundStart = Math.max(groundStart, gapEnd)
    })
    if (groundStart < this.worldWidth) groundSegments.push([groundStart, this.worldWidth])
    groundSegments.forEach(([start, end]) => {
      const width = end - start
      const ground = this.platforms.create(start + width / 2, 500, `story-${this.campaign.id}-ground`)
      ground.setDisplaySize(width, 60).refreshBody()
    })

    ;[[480, 385, 120], [980, 340, 120], [1490, 360, 125]].forEach(([x, y, width]) => {
      const ledge = this.platforms.create(x + width / 2, y, `story-${this.campaign.id}-ledge`)
      ledge.setDisplaySize(width, 24).refreshBody()
    })

    this.hazardXs = this.currentStage.hazardXs || [840, 1450, 1840]
    this.hazardXs.forEach((x) => this.hazards.create(x, 468, `story-${this.campaign.id}-hazard`).refreshBody())
    const target = this.levelGoal
    const tokenX = this.currentStage.tokenXs || Array.from({ length: target }, (_, i) => 210 + i * ((this.worldWidth - 520) / Math.max(1, target - 1)))
    tokenX.slice(0, target).forEach((x, i) => this.tokens.create(x, [400, 325, 365, 290][i % 4], `story-${this.campaign.id}-token`).refreshBody())
    const gate = this.goals.create(this.worldWidth - 70, 435, `story-${this.campaign.id}-gate`).refreshBody()
    gate.body.setSize(44, 76).setOffset(5, 6)

    const hero = this.createPlayer(70, 420)
    this.cameras.main.startFollow(hero, true, 0.08, 0.06)
    this.cameras.main.setDeadzone(250, 135)
    this.colliders.push(this.physics.add.collider(hero, this.platforms))
    this.colliders.push(this.physics.add.overlap(hero, this.tokens, this.collectToken, undefined, this))
    this.colliders.push(this.physics.add.overlap(hero, this.hazards, this.hitHazard, undefined, this))
    this.colliders.push(this.physics.add.overlap(hero, this.goals, () => {
      if (this.objectiveCount >= target) this.finishStage()
    }))
  }

  createRunnerStage() {
    this.worldWidth = this.currentStage.worldWidth || 4200
    this.currentStage.gaps = []
    this.currentStage.hazardXs = Array.from({ length: 8 }, (_, i) => 450 + i * 470)
    this.createPlatformStage()
    this.player.setVelocityX(205)
    this.player.body.setGravityY(700)
    this.runnerMode = true
  }

  createMazeStage() {
    this.worldWidth = WIDTH
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT)
    this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT)
    this.tokens = this.physics.add.staticGroup()
    this.goals = this.physics.add.staticGroup()
    this.walls = this.add.group()
    this.groups.push(this.tokens, this.goals, this.walls)
    const size = 54
    const cols = 15
    const rows = 8
    const offsetX = (WIDTH - cols * size) / 2
    const offsetY = 54
    const wallCoords = new Set()
    for (let x = 3; x < 12; x += 1) if (x !== 6 + this.stageIndex) wallCoords.add(`${x},2`)
    for (let x = 1; x < 11; x += 1) if (x !== 4 + this.stageIndex) wallCoords.add(`${x},5`)
    for (let y = 2; y < 6; y += 1) if (y !== 4) wallCoords.add(`${8},${y}`)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (row === 0 || col === 0 || row === rows - 1 || col === cols - 1 || wallCoords.has(`${col},${row}`)) {
          const wall = this.add.image(offsetX + col * size + size / 2, offsetY + row * size + size / 2, `story-${this.campaign.id}-wall`)
          wall.setDisplaySize(size - 3, size - 3)
          this.walls.add(wall)
        }
      }
    }
    this.mazeOffset = { x: offsetX, y: offsetY, size, cols, rows }
    this.mazePosition = { col: 1, row: 1 }
    this.spawnX = offsetX + size * 1.5
    this.spawnY = offsetY + size * 1.5
    this.player = this.add.image(this.spawnX, this.spawnY, `story-${this.campaign.id}-hero`).setDisplaySize(32, 38).setDepth(3)
    this.mazeTokenCells = this.currentStage.tokenCells || [[3, 3], [6, 4], [11, 6], [12, 1], [5, 6]]
    this.mazeTokenCells.slice(0, this.currentStage.target).forEach(([col, row]) => {
      this.tokens.create(offsetX + col * size + size / 2, offsetY + row * size + size / 2, `story-${this.campaign.id}-token`).refreshBody()
    })
    this.mazeExitCell = [13, 6]
    this.goalSprite = this.add.image(offsetX + this.mazeExitCell[0] * size + size / 2, offsetY + this.mazeExitCell[1] * size + size / 2, `story-${this.campaign.id}-gate`).setDisplaySize(40, 46).setDepth(2)
    this.status = 'story'
  }

  moveMaze(dx, dy) {
    if (this.status !== 'running' || this.campaign.mode !== 'maze') return
    const now = this.time.now
    if (now - this.lastGridMove < 110) return
    this.lastGridMove = now
    const col = this.mazePosition.col + dx
    const row = this.mazePosition.row + dy
    const { x, y, size, cols, rows } = this.mazeOffset
    if (col <= 0 || col >= cols - 1 || row <= 0 || row >= rows - 1) return
    if (this.walls.getChildren().some((wall) => Math.round((wall.x - x) / size - 0.5) === col && Math.round((wall.y - y) / size - 0.5) === row)) return
    this.mazePosition = { col, row }
    this.player.setPosition(x + col * size + size / 2, y + row * size + size / 2)
    const token = this.tokens.getChildren().find((item) => item.active && Phaser.Math.Distance.Between(item.x, item.y, this.player.x, this.player.y) < size * 0.3)
    if (token) {
      token.destroy()
      this.objectiveCount += 1
      this.score += 100
      this.publish()
    }
    if (col === this.mazeExitCell[0] && row === this.mazeExitCell[1] && this.objectiveCount >= this.levelGoal) this.finishStage()
  }

  createLightsStage() {
    this.worldWidth = WIDTH
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT)
    this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT)
    const size = 72
    const gap = 10
    const startX = (WIDTH - 5 * size - 4 * gap) / 2
    const startY = 60
    this.lightCells = []
    this.lights = Array(25).fill(false)
    ;(this.currentStage.scramble || [0, 6, 12, 18, 24]).forEach((index) => this.toggleLight(index, false))
    for (let index = 0; index < 25; index++) {
      const row = Math.floor(index / 5)
      const col = index % 5
      const cell = this.add.rectangle(startX + col * (size + gap) + size / 2, startY + row * (size + gap) + size / 2, size, size, this.lights[index] ? 0xe9c275 : 0x435c58, 1)
        .setStrokeStyle(2, 0xf3e7c8)
        .setInteractive({ useHandCursor: true })
      cell.on('pointerdown', () => {
        if (this.status !== 'running') return
        this.toggleLight(index, true)
      })
      this.lightCells.push(cell)
    }
    this.player = null
  }

  toggleLight(index, countMove = true) {
    const row = Math.floor(index / 5)
    const col = index % 5
    const neighbors = [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
    neighbors.forEach(([nextRow, nextCol]) => {
      if (nextRow < 0 || nextRow > 4 || nextCol < 0 || nextCol > 4) return
      const cellIndex = nextRow * 5 + nextCol
      this.lights[cellIndex] = !this.lights[cellIndex]
      this.lightCells[cellIndex]?.setFillStyle(this.lights[cellIndex] ? 0xe9c275 : 0x435c58, 1)
    })
    if (countMove) {
      this.objectiveCount += 1
      this.publish()
      if (this.lights.every((light) => !light)) this.finishStage()
    }
  }

  createFlightStage() {
    this.worldWidth = WIDTH
    this.physics.world.setBounds(20, 20, WIDTH - 40, HEIGHT - 40)
    this.cameras.main.setBounds(0, 0, WIDTH, HEIGHT)
    this.player = this.physics.add.sprite(WIDTH / 2, HEIGHT - 80, `story-${this.campaign.id}-hero`).setCollideWorldBounds(true)
    this.player.body.setAllowGravity(false)
    this.player.body.setSize(28, 34).setOffset(7, 8)
    this.hazards = this.physics.add.group()
    this.tokens = this.physics.add.group()
    this.groups.push(this.hazards, this.tokens)
    this.colliders.push(this.physics.add.overlap(this.player, this.hazards, this.hitHazard, undefined, this))
    this.colliders.push(this.physics.add.overlap(this.player, this.tokens, this.collectToken, undefined, this))
    this.spawnTimer = 0
  }

  updateShooter(delta) {
    const speed = 310
    this.player.setVelocity((this.inputState.right - this.inputState.left) * speed, (this.inputState.down - this.inputState.up) * speed)
    this.shotTimer -= delta
    if (this.inputState.shoot && this.shotTimer <= 0) {
      this.shotTimer = 0.22
      const bullet = this.bullets.get(this.player.x, this.player.y - 30)
      if (bullet) {
        bullet.setActive(true).setVisible(true)
        bullet.body.enable = true
        bullet.body.setAllowGravity(false)
        bullet.setVelocity(0, -540)
      }
    }
    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.active && bullet.y < -24) bullet.destroy()
    })
    this.enemyShotTimer -= delta
    if (this.enemyShotTimer <= 0) {
      this.enemyShotTimer = 1.05
      const activeEnemies = this.enemies.getChildren().filter((enemy) => enemy.active)
      if (activeEnemies.length) {
        const enemy = activeEnemies[Phaser.Math.Between(0, activeEnemies.length - 1)]
        const shot = this.enemyBullets.create(enemy.x, enemy.y + 16, `story-${this.campaign.id}-rock`)
        shot.setDisplaySize(13, 13)
        shot.body.setAllowGravity(false)
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y)
        this.physics.velocityFromRotation(angle, 260, shot.body.velocity)
      }
    }
    this.enemyBullets.getChildren().forEach((bullet) => {
      if (bullet.active && bullet.y > HEIGHT + 24) bullet.destroy()
    })
  }

  spawnFlightObjects(delta) {
    this.spawnTimer -= delta
    if (this.spawnTimer > 0) return
    this.spawnTimer = this.campaign.mode === 'lanes' ? 0.7 : 0.55
    const x = Phaser.Math.Between(35, WIDTH - 35)
    const hazard = this.hazards.create(x, -26, `story-${this.campaign.id}-rock`)
    hazard.setVelocity(Phaser.Math.Between(-40, 40), Phaser.Math.Between(180, 300) + this.stageIndex * 30)
    hazard.setCollideWorldBounds(false)
    if (Math.random() > 0.42) {
      const tokenX = Phaser.Math.Between(50, WIDTH - 50)
      const token = this.tokens.create(tokenX, -50, `story-${this.campaign.id}-token`)
      token.setVelocity(0, Phaser.Math.Between(130, 190))
    }
  }

  update(deltaMs) {
    if (this.status !== 'running') return
    const delta = Math.min(deltaMs / 1000, 0.04)
    this.elapsed += delta
    if (this.campaign.mode === 'shooter') {
      this.updateShooter(delta)
    } else if (this.campaign.mode === 'platform' || this.campaign.mode === 'runner') {
      const direction = (this.inputState.right ? 1 : 0) - (this.inputState.left ? 1 : 0)
      this.player.setVelocityX(this.campaign.mode === 'runner' ? 220 : direction * 280)
      const grounded = this.player.body.blocked.down || this.player.body.touching.down
      if (grounded) this.coyoteUntil = this.elapsed + 0.16
      if (this.inputState.jump) {
        this.jumpBufferUntil = this.elapsed + 0.22
        this.inputState.jump = false
      }
      if (this.elapsed < this.jumpBufferUntil && (grounded || this.elapsed < this.coyoteUntil)) {
        this.player.setVelocityY(-650)
        this.jumpBufferUntil = 0
        this.coyoteUntil = 0
      }
      if (this.player.y > HEIGHT + 100) this.hurtPlayer()
      if (this.player.x > this.worldWidth - 100) {
        if (this.objectiveCount >= this.levelGoal) this.finishStage()
      }
    } else if (this.campaign.mode === 'maze') {
      // Movement is tile-based and routed through moveMaze from keyboard/touch input.
    } else if (this.campaign.mode === 'lights') {
      // Cell clicks toggle the light puzzle directly.
    } else {
      const speed = this.campaign.mode === 'lanes' ? 340 : 260
      this.player.setVelocity((this.inputState.right - this.inputState.left) * speed, (this.inputState.down - this.inputState.up) * speed)
      this.spawnFlightObjects(delta)
      this.hazards.getChildren().forEach((item) => { if (item.active && item.y > HEIGHT + 30) item.destroy() })
      this.tokens.getChildren().forEach((item) => { if (item.active && item.y > HEIGHT + 30) item.destroy() })
      if (this.campaign.mode === 'dodge' && this.elapsed >= this.currentStage.duration) this.finishStage()
    }
    if (this.elapsed - this.lastPublishedAt > 0.16) {
      this.lastPublishedAt = this.elapsed
      this.publish()
    }
  }
}

export default function StoryCampaign({ campaignId, onExit }) {
  const campaign = storyCampaigns.find((item) => item.id === campaignId)
  const mountRef = useRef(null)
  const gameRef = useRef(null)
  const [engineReady, setEngineReady] = useState(false)
  const [hud, setHud] = useState(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !campaign) return undefined
    mount.replaceChildren()
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: WIDTH,
      height: HEIGHT,
      parent: mount,
      backgroundColor: CAMPAIGN_COLORS[campaign.palette]?.sky ?? '#9bbd9c',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade', arcade: { gravity: { y: 950 }, debug: false } },
      scene: new StoryScene(campaign),
      render: { antialias: true, pixelArt: false },
    })
    gameRef.current = game
    const onHud = (state) => setHud(state)
    const getScene = () => game.scene.getScene('StoryCampaignScene')
    const onKeyDown = (event) => {
      const scene = getScene()
      if (!scene) return
      if (scene.status === 'story' && ['Space', 'Enter'].includes(event.code)) {
        scene.startStage()
        return
      }
      if (scene.status !== 'running') return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) event.preventDefault()
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') scene.inputState.left = true
      if (event.code === 'ArrowRight' || event.code === 'KeyD') scene.inputState.right = true
      if (event.code === 'ArrowUp' || event.code === 'KeyW') scene.inputState.up = true
      if (event.code === 'ArrowDown' || event.code === 'KeyS') scene.inputState.down = true
      if (['Space', 'ArrowUp', 'KeyW'].includes(event.code) && campaign.mode !== 'shooter' && !event.repeat) scene.requestJump()
      if (event.code === 'Space' && campaign.mode === 'shooter') scene.inputState.shoot = true
      if (!event.repeat && (event.code === 'Space' || event.code === 'Enter') && scene.status === 'story') scene.startStage()
      if (!event.repeat && (event.code === 'ArrowLeft' || event.code === 'KeyA')) scene.moveMaze?.(-1, 0)
      if (!event.repeat && (event.code === 'ArrowRight' || event.code === 'KeyD')) scene.moveMaze?.(1, 0)
      if (!event.repeat && (event.code === 'ArrowUp' || event.code === 'KeyW')) scene.moveMaze?.(0, -1)
      if (!event.repeat && (event.code === 'ArrowDown' || event.code === 'KeyS')) scene.moveMaze?.(0, 1)
    }
    const onKeyUp = (event) => {
      const scene = getScene()
      if (!scene) return
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') scene.inputState.left = false
      if (event.code === 'ArrowRight' || event.code === 'KeyD') scene.inputState.right = false
      if (event.code === 'ArrowUp' || event.code === 'KeyW') scene.inputState.up = false
      if (event.code === 'ArrowDown' || event.code === 'KeyS') scene.inputState.down = false
      if (event.code === 'Space') scene.inputState.shoot = false
    }
    game.events.on('campaign-hud', onHud)
    game.events.once('story-engine-ready', () => setEngineReady(true))
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      game.events.off('campaign-hud', onHud)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      game.destroy(true)
      mount.replaceChildren()
      gameRef.current = null
    }
  }, [campaign])

  if (!campaign) return null
  const stageIndex = hud?.stageIndex ?? 0
  const currentStage = hud?.stage ?? campaign.stages[stageIndex]

  function command(method) {
    const scene = gameRef.current?.scene.getScene('StoryCampaignScene')
    if (scene && typeof scene[method] === 'function') scene[method]()
  }

  const handleMoveDown = (direction) => {
    const scene = gameRef.current?.scene.getScene('StoryCampaignScene')
    if (scene) scene.inputState[direction] = true
  }
  const handleMoveUp = (direction) => {
    const scene = gameRef.current?.scene.getScene('StoryCampaignScene')
    if (scene) scene.inputState[direction] = false
  }
  const handleUpOrJump = () => {
    const scene = gameRef.current?.scene.getScene('StoryCampaignScene')
    if (!scene) return
    if (campaign.mode === 'maze') scene.moveMaze(0, -1)
    else if (campaign.mode === 'platform' || campaign.mode === 'runner') scene.requestJump()
    else handleMoveDown('up')
  }
  const handlePrimaryAction = () => {
    if (campaign.mode === 'shooter') handleMoveDown('shoot')
    else command('startStage')
  }
  const handleDownOrMaze = () => {
    const scene = gameRef.current?.scene.getScene('StoryCampaignScene')
    if (campaign.mode === 'maze') scene?.moveMaze(0, 1)
    else handleMoveDown('down')
  }

  return (
    <main className="game-page story-page">
      <header className="game-header">
        <a className="brand" href="#arcade" aria-label="Fieldnotes Arcade home" onClick={(event) => { event.preventDefault(); onExit() }}>
          <span className="brand-mark" aria-hidden="true">F</span><span>fieldnotes<span className="brand-dot">.</span></span>
        </a>
        <button className="back-link" type="button" onClick={onExit}><span aria-hidden="true">←</span> CAMPAIGNS</button>
      </header>

      <section className="story-intro">
        <p className="eyebrow"><span className="live-dot" /> ORIGINAL STORY CAMPAIGN <span className="eyebrow-divider">/</span> {campaign.category}</p>
        <h1>{campaign.title} <span>{campaign.subtitle}</span></h1>
        <p className="intro-copy">{campaign.story}</p>
      </section>

      <section className="story-shell" aria-label={`${campaign.title} game`}>
        <div className="story-toolbar">
          <div className="story-stage-label"><span>CHAPTER {String(stageIndex + 1).padStart(2, '0')} / 03</span><strong>{currentStage.name}</strong></div>
          <div className="story-stat"><span>{campaign.mode === 'lights' ? 'LAMPS LIT' : 'OBJECTIVE'}</span><strong>{hud?.count ?? 0}<small>{campaign.mode === 'lights' ? ' left' : ` / ${hud?.target ?? currentStage.target}`}</small></strong></div>
          <div className="story-stat"><span>VITALITY</span><strong>{'●'.repeat(hud?.lives ?? 3)}<i>{'●'.repeat(3 - (hud?.lives ?? 3))}</i></strong></div>
          <div className="story-stat"><span>MISSION SCORE</span><strong>{(hud?.score ?? 0).toString().padStart(5, '0')}</strong></div>
        </div>
        <div className={`story-stage mode-${campaign.mode}`}>
          <div className="story-canvas" ref={mountRef} />
          {hud?.status !== 'running' && (
            <div className="story-overlay">
              {(!hud || hud.status === 'story') && <>
                <p className="overlay-kicker">{hud ? `CHAPTER ${stageIndex + 1} / 3` : 'CAMPAIGN LOADING'}</p>
                <h2>{hud ? currentStage.name : campaign.title}</h2>
                <p>{hud ? currentStage.story : campaign.story}</p>
                <p className="story-objective">{hud ? currentStage.objective : 'Preparing your expedition…'}</p>
                {hud && <button className="play-button" type="button" disabled={!engineReady} onClick={() => command('startStage')}><span aria-hidden="true">▶</span> Begin chapter</button>}
              </>}
              {hud?.status === 'stage-clear' && <>
                <p className="overlay-kicker">CHAPTER {stageIndex + 1} COMPLETE</p><h2>{currentStage.name} secured.</h2>
                <p>{campaign.stages[stageIndex + 1].story}</p><p className="story-objective">{campaign.stages[stageIndex + 1].objective}</p>
                <button className="play-button" type="button" onClick={() => command('nextStage')}><span aria-hidden="true">→</span> Next chapter</button>
              </>}
              {hud?.status === 'campaign-clear' && <>
                <p className="overlay-kicker">CAMPAIGN COMPLETE</p><h2>{campaign.subtitle} is saved.</h2>
                <p>{campaign.title} is complete. Final mission score: {hud.score}.</p>
                <button className="play-button" type="button" onClick={() => command('restartCampaign')}><span aria-hidden="true">↻</span> Play campaign again</button>
              </>}
              {hud?.status === 'game-over' && <>
                <p className="overlay-kicker">MISSION FAILED</p><h2>Regroup and try again.</h2>
                <p>You reached {currentStage.name}. Your story continues when you’re ready.</p>
                <button className="play-button" type="button" onClick={() => command('retryStage')}><span aria-hidden="true">↻</span> Retry chapter</button>
              </>}
            </div>
          )}
        </div>
        <div className="story-controls">
          <p><kbd>←</kbd><kbd>→</kbd> move <span>·</span> <kbd>SPACE</kbd> {campaign.mode === 'shooter' ? 'fire' : campaign.mode === 'maze' ? 'begin' : 'jump / fire'} <span>·</span> <kbd>↑</kbd><kbd>↓</kbd> aim / climb</p>
          <div className="story-touch-controls">
            <button type="button" aria-label="Move left" onPointerDown={() => handleMoveDown('left')} onPointerUp={() => handleMoveUp('left')} onPointerLeave={() => handleMoveUp('left')}>←</button>
            <button type="button" aria-label="Move up or jump" onPointerDown={handleUpOrJump} onPointerUp={() => handleMoveUp('up')}>↑</button>
            <button type="button" aria-label={campaign.mode === 'shooter' ? 'Fire' : 'Action'} onPointerDown={handlePrimaryAction} onPointerUp={() => handleMoveUp('shoot')}>●</button>
            <button type="button" aria-label="Move down" onPointerDown={handleDownOrMaze} onPointerUp={() => handleMoveUp('down')}>↓</button>
            <button type="button" aria-label="Move right" onPointerDown={() => handleMoveDown('right')} onPointerUp={() => handleMoveUp('right')} onPointerLeave={() => handleMoveUp('right')}>→</button>
          </div>
        </div>
      </section>
      <footer className="game-footer"><span>{campaign.title.toUpperCase()} / ORIGINAL STORY</span><span>3 CHAPTERS. ONE CAMPAIGN.</span></footer>
    </main>
  )
}
