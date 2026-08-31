// 05-arcade-vault/lib/games/asteroids/game.esm.js
// ES module wrapper for vanilla Asteroids game.js
// Exports: initGame(canvas), destroy(), onGameOver callback
// Loop por setTimeout encadenado (independiente de RAF: RAF se estrangula
// en headless WebKit/CI); dt real por frame, destroy() cancela el timer.

'use strict';

import { PALETTES, DEFAULT_SKIN, isSkinId } from '@/lib/games/skins';

let canvas = null;
let ctx = null;
let timerId = null;
let lastTime = null;
let gameState = {
  ship: null,
  bullets: [],
  asteroids: [],
  particles: [],
  powerUps: [],
  score: 0,
  lives: 3,
  level: 1,
  state: 'playing',
  deadTimer: 0,
  powerUpSpawned: false,
  killsSinceSpawn: 0,
};
let onGameOverCallback = null;
let palette = PALETTES[DEFAULT_SKIN];

const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

function handleKeyDown(e) {
  // Evita el scroll de página con las flechas/espacio mientras se juega
  if (
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(
      e.code
    )
  ) {
    e.preventDefault();
  }
  if (!keys[e.code]) justPressed[e.code] = true;
  keys[e.code] = true;
}

function handleKeyUp(e) {
  keys[e.code] = false;
}

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// Attach listeners once
function attachInput() {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}

function detachInput() {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap = (v, max) => ((v % max) + max) % max;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const hexToRgb = (hex) => {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255},${(value >> 8) & 255},${value & 255}`;
};

// ── Constants ─────────────────────────────────────────────────────────────────
const POWERUP_DROP_CHANCE = 0.15;
const POWERUP_DURATION = 5;
const POWERUP_TTL = 12;
const TRIPLE_SPREAD = 0.18;
const MAX_ASTEROID_LEVEL = 6;

// ponytail: precomputed rgba strings to avoid per-frame hexToRgb allocations
let _thrustRgba;
let _overlayRgba;

const RADII = [0, 16, 30, 50];
const SPEEDS = [0, 85, 55, 32];
const POINTS = [0, 100, 50, 20];

// ── Classes ───────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl = 1.1;
    this.radius = 2;
    this.dead = false;
  }
  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }
  draw() {
    ctx.fillStyle = palette.bullet;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Asteroid {
  constructor(x, y, size = 3) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;
    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }
  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }
  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }
}

class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(20, 40);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = 12;
    this.ttl = POWERUP_TTL;
    this.dead = false;
  }
  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }
  draw() {
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;
    const pulse = 0.85 + Math.sin(performance.now() / 150) * 0.15;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 2;
    const r = this.radius * pulse;
    ctx.strokeRect(-r, -r, r * 2, r * 2);
    ctx.restore();
    ctx.fillStyle = palette.accent;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3x', this.x, this.y);
  }
}

class Ship {
  constructor() {
    this.tripleShot = 0;
    this.reset();
  }
  reset() {
    this.x = W / 2;
    this.y = H / 2;
    this.angle = -Math.PI / 2;
    this.vx = 0;
    this.vy = 0;
    this.radius = 12;
    this.thrusting = false;
    this.invincible = 3;
    this.shootCooldown = 0;
    this.dead = false;
  }
  update(dt) {
    if (this.dead) return;
    if (this.invincible > 0) this.invincible -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.tripleShot > 0) this.tripleShot -= dt;

    const ROT = 3.5;
    const THRUST = 260;
    const DRAG = 0.987;

    if (keys['ArrowLeft']) this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }
  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    if (this.tripleShot > 0) {
      return [
        new Bullet(ox, oy, this.angle - TRIPLE_SPREAD),
        new Bullet(ox, oy, this.angle),
        new Bullet(ox, oy, this.angle + TRIPLE_SPREAD),
      ];
    }
    return [new Bullet(ox, oy, this.angle)];
  }
  draw() {
    if (this.dead) return;
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = palette.player;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-12, -9);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-12, 9);
    ctx.closePath();
    ctx.stroke();

    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8, 4);
      ctx.strokeStyle = _thrustRgba;
      ctx.stroke();
    }
    ctx.restore();
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl = this.life;
    this.dead = false;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }
  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(${hexToRgb(palette.particle)},${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Game functions ────────────────────────────────────────────────────────────
function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    gameState.asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGameState() {
  gameState.ship = new Ship();
  gameState.bullets = [];
  gameState.asteroids = [];
  gameState.particles = [];
  gameState.powerUps = [];
  gameState.powerUpSpawned = false;
  gameState.killsSinceSpawn = 0;
  gameState.score = 0;
  gameState.lives = 3;
  gameState.level = 1;
  gameState.state = 'playing';
  spawnAsteroids(4);
}

function nextLevel() {
  gameState.level++;
  gameState.bullets = [];
  gameState.particles = [];
  gameState.powerUps = [];
  gameState.powerUpSpawned = false;
  gameState.killsSinceSpawn = 0;
  gameState.ship.reset();
  // ponytail: cap asteroid count to avoid O(n^2) collision at high levels
  spawnAsteroids(3 + Math.min(gameState.level, MAX_ASTEROID_LEVEL));
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) gameState.particles.push(new Particle(x, y));
}

function killShip() {
  explode(gameState.ship.x, gameState.ship.y, 14);
  gameState.ship.dead = true;
  gameState.lives--;
  if (gameState.lives <= 0) {
    gameState.state = 'gameover';
    if (onGameOverCallback) onGameOverCallback(gameState.score);
  } else {
    gameState.state = 'dead';
    gameState.deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (gameState.state === 'gameover') {
    if (pressed('Space')) {
      initGameState();
    }
    gameState.particles.forEach((p) => p.update(dt));
    let wp = 0;
    for (let i = 0; i < gameState.particles.length; i++) {
      if (!gameState.particles[i].dead) {
        gameState.particles[wp++] = gameState.particles[i];
      }
    }
    gameState.particles.length = wp;
    return;
  }

  if (gameState.state === 'dead') {
    gameState.deadTimer -= dt;
    gameState.particles.forEach((p) => p.update(dt));
    let wp = 0;
    for (let i = 0; i < gameState.particles.length; i++) {
      if (!gameState.particles[i].dead) {
        gameState.particles[wp++] = gameState.particles[i];
      }
    }
    gameState.particles.length = wp;
    gameState.asteroids.forEach((a) => a.update(dt));
    if (gameState.deadTimer <= 0) {
      gameState.state = 'playing';
      gameState.ship.reset();
    }
    return;
  }

  // Shoot
  if (pressed('Space')) {
    gameState.bullets.push(...gameState.ship.tryShoot());
  }

  gameState.ship.update(dt);
  gameState.bullets.forEach((b) => b.update(dt));
  gameState.asteroids.forEach((a) => a.update(dt));
  gameState.particles.forEach((p) => p.update(dt));
  gameState.powerUps.forEach((p) => p.update(dt));

  // ponytail: in-place compaction, no per-frame allocations
  let w = 0;
  for (let i = 0; i < gameState.bullets.length; i++) {
    if (!gameState.bullets[i].dead)
      gameState.bullets[w++] = gameState.bullets[i];
  }
  gameState.bullets.length = w;
  w = 0;
  for (let i = 0; i < gameState.particles.length; i++) {
    if (!gameState.particles[i].dead) {
      gameState.particles[w++] = gameState.particles[i];
    }
  }
  gameState.particles.length = w;
  w = 0;
  for (let i = 0; i < gameState.powerUps.length; i++) {
    if (!gameState.powerUps[i].dead) {
      gameState.powerUps[w++] = gameState.powerUps[i];
    }
  }
  gameState.powerUps.length = w;

  // PowerUp collection
  for (const p of gameState.powerUps) {
    if (!p.dead && dist(gameState.ship, p) < gameState.ship.radius + p.radius) {
      p.dead = true;
      gameState.ship.tripleShot = POWERUP_DURATION;
    }
  }

  // Bullet vs Asteroid
  for (const b of gameState.bullets) {
    for (const a of gameState.asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        gameState.score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        // ponytail: push splits directly, no temp array
        for (const sp of a.split()) gameState.asteroids.push(sp);
        if (!gameState.powerUpSpawned) {
          gameState.killsSinceSpawn++;
          const guaranteed = gameState.killsSinceSpawn >= 5;
          if (guaranteed || Math.random() < POWERUP_DROP_CHANCE) {
            gameState.powerUps.push(new PowerUp(a.x, a.y));
            gameState.powerUpSpawned = true;
          }
        }
      }
    }
  }
  // ponytail: compact asteroids in-place (no new array)
  let wa = 0;
  for (let i = 0; i < gameState.asteroids.length; i++) {
    if (!gameState.asteroids[i].dead) {
      gameState.asteroids[wa++] = gameState.asteroids[i];
    }
  }
  gameState.asteroids.length = wa;

  // Ship vs Asteroid
  if (gameState.ship.invincible <= 0) {
    for (const a of gameState.asteroids) {
      if (dist(gameState.ship, a) < gameState.ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Level complete
  if (gameState.asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = palette.player;
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-6, 5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = palette.hudText;
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${gameState.score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${gameState.level}`, W / 2, 26);

  // ponytail: hoist shared canvas state for life-icon loop
  ctx.strokeStyle = palette.player;
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'round';
  for (let i = 0; i < gameState.lives; i++) drawLifeIcon(W - 16 - i * 22, 18);

  if (gameState.ship.tripleShot > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = palette.accent;
    ctx.fillText(`3x  ${gameState.ship.tripleShot.toFixed(1)}s`, 14, 46);
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.hudText;
  ctx.font = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font = '18px monospace';
  ctx.fillStyle = _overlayRgba;
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, W, H);

  gameState.particles.forEach((p) => p.draw());
  // ponytail: hoist shared canvas state for asteroid loop
  ctx.strokeStyle = palette.enemy;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  for (const a of gameState.asteroids) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rot);
    ctx.beginPath();
    ctx.moveTo(a.verts[0][0], a.verts[0][1]);
    for (let i = 1; i < a.verts.length; i++) {
      ctx.lineTo(a.verts[i][0], a.verts[i][1]);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  gameState.powerUps.forEach((p) => p.draw());
  gameState.bullets.forEach((b) => b.draw());
  gameState.ship.draw();

  drawHUD();

  if (gameState.state === 'gameover') {
    drawOverlay(
      'GAME OVER',
      `PUNTAJE: ${gameState.score}   —   ESPACIO PARA REINICIAR`
    );
  }
}

// ── Main Loop ─────────────────────────────────────────────────────────────────
function scheduleTick() {
  timerId = setTimeout(() => loop(performance.now()), 1000 / 60);
}

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  scheduleTick();
}

// ── Public API ────────────────────────────────────────────────────────────────
export function initGame(targetCanvas, options = {}) {
  canvas = targetCanvas;
  ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  onGameOverCallback = options.onGameOver || null;
  palette = PALETTES[isSkinId(options.skin) ? options.skin : DEFAULT_SKIN];

  // ponytail: precompute rgba strings once per skin
  _thrustRgba = `rgba(${hexToRgb(palette.thrust)},0.85)`;
  _overlayRgba = `rgba(${hexToRgb(palette.hudText)},0.65)`;

  attachInput();
  initGameState();
  lastTime = null;
  clearTimeout(timerId);
  scheduleTick();
}

export function destroy() {
  if (timerId) clearTimeout(timerId);
  timerId = null;
  detachInput();
  canvas = null;
  ctx = null;
  gameState = {
    ship: null,
    bullets: [],
    asteroids: [],
    particles: [],
    powerUps: [],
    score: 0,
    lives: 3,
    level: 1,
    state: 'playing',
    deadTimer: 0,
    powerUpSpawned: false,
    killsSinceSpawn: 0,
  };
  onGameOverCallback = null;
}

export function setOnGameOver(callback) {
  onGameOverCallback = callback;
}

export function getGameState() {
  return { ...gameState };
}
