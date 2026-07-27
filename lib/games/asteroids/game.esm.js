// 05-arcade-vault/lib/games/asteroids/game.esm.js
// ES module wrapper for vanilla Asteroids game.js
// Exports: initGame(canvas), destroy(), onGameOver callback

'use strict';

let canvas = null;
let ctx = null;
let animationId = null;
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
  killsSinceSpawn: 0
};
let onGameOverCallback = null;

const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

function handleKeyDown(e) {
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

// ── Constants ─────────────────────────────────────────────────────────────────
const POWERUP_DROP_CHANCE = 0.15;
const POWERUP_DURATION = 5;
const POWERUP_TTL = 12;
const TRIPLE_SPREAD = 0.18;

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
    ctx.fillStyle = '#fff';
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
    return [new Asteroid(this.x, this.y, this.size - 1), new Asteroid(this.x, this.y, this.size - 1)];
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++) ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
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
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    const r = this.radius * pulse;
    ctx.strokeRect(-r, -r, r * 2, r * 2);
    ctx.restore();
    ctx.fillStyle = '#0ff';
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
        new Bullet(ox, oy, this.angle + TRIPLE_SPREAD)
      ];
    }
    return [new Bullet(ox, oy, this.angle)];
  }
  draw() {
    if (this.dead) return;
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#fff';
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
      ctx.strokeStyle = 'rgba(255, 130, 0, 0.85)';
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
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
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
  spawnAsteroids(3 + gameState.level);
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
    gameState.particles.forEach(p => p.update(dt));
    gameState.particles = gameState.particles.filter(p => !p.dead);
    return;
  }

  if (gameState.state === 'dead') {
    gameState.deadTimer -= dt;
    gameState.particles.forEach(p => p.update(dt));
    gameState.particles = gameState.particles.filter(p => !p.dead);
    gameState.asteroids.forEach(a => a.update(dt));
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
  gameState.bullets.forEach(b => b.update(dt));
  gameState.asteroids.forEach(a => a.update(dt));
  gameState.particles.forEach(p => p.update(dt));
  gameState.powerUps.forEach(p => p.update(dt));

  gameState.bullets = gameState.bullets.filter(b => !b.dead);
  gameState.particles = gameState.particles.filter(p => !p.dead);
  gameState.powerUps = gameState.powerUps.filter(p => !p.dead);

  // PowerUp collection
  for (const p of gameState.powerUps) {
    if (!p.dead && dist(gameState.ship, p) < gameState.ship.radius + p.radius) {
      p.dead = true;
      gameState.ship.tripleShot = POWERUP_DURATION;
    }
  }

  // Bullet vs Asteroid
  const newAsteroids = [];
  for (const b of gameState.bullets) {
    for (const a of gameState.asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        gameState.score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
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
  gameState.asteroids = gameState.asteroids.filter(a => !a.dead).concat(newAsteroids);
  gameState.bullets = gameState.bullets.filter(b => !b.dead);

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
  ctx.strokeStyle = '#fff';
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
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${gameState.score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${gameState.level}`, W / 2, 26);

  for (let i = 0; i < gameState.lives; i++) drawLifeIcon(W - 16 - i * 22, 18);

  if (gameState.ship.tripleShot > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0ff';
    ctx.fillText(`3x  ${gameState.ship.tripleShot.toFixed(1)}s`, 14, 46);
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font = '18px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  gameState.particles.forEach(p => p.draw());
  gameState.asteroids.forEach(a => a.draw());
  gameState.powerUps.forEach(p => p.draw());
  gameState.bullets.forEach(b => b.draw());
  gameState.ship.draw();

  drawHUD();

  if (gameState.state === 'gameover') {
    drawOverlay('GAME OVER', `PUNTAJE: ${gameState.score}   —   ESPACIO PARA REINICIAR`);
  }
}

// ── Main Loop ─────────────────────────────────────────────────────────────────
function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  animationId = requestAnimationFrame(loop);
}

// ── Public API ────────────────────────────────────────────────────────────────
export function initGame(targetCanvas, options = {}) {
  canvas = targetCanvas;
  ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  onGameOverCallback = options.onGameOver || null;

  attachInput();
  initGameState();
  lastTime = null;
  animationId = requestAnimationFrame(loop);
}

export function destroy() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
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
    killsSinceSpawn: 0
  };
  onGameOverCallback = null;
}

export function setOnGameOver(callback) {
  onGameOverCallback = callback;
}

export function getGameState() {
  return { ...gameState };
}