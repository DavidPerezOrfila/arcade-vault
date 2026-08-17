// 05-arcade-vault/lib/games/bloque-buster/game.esm.js
// ES module wrapper del Arkanoid vanilla (resources/started-games/04-arkanoid).
// Exporta initGame(canvas, { skin }), destroy() y setOnGameOver(cb).
// Loop por setTimeout encadenado (independiente de RAF: RAF se estrangula
// en headless WebKit/CI); dt real por frame con clamp 0.05s (tab en segundo
// plano); destroy() cancela el timer y desconecta listeners.

'use strict';

import { PALETTES, DEFAULT_SKIN, isSkinId } from '@/lib/games/skins';

let canvas = null;
let ctx = null;
let timerId = null;
let lastTime = null;
let destroyed = false;
let palette = PALETTES[DEFAULT_SKIN];
let onGameOverCallback = null;
let gameOverFired = false;

const W = 800;
const H = 600;

const PADDLE_SPEED = 400;
const BLOCK_COLS = 10;
const BLOCK_ROWS = 6;
const BLOCK_W = 64;
const BLOCK_H = 24;
const BLOCKS_ORIGIN_X = (W - BLOCK_COLS * BLOCK_W) / 2;
const BLOCKS_ORIGIN_Y = 80;
const BASE_BALL_VX = 200;
const BASE_BALL_VY = -300;

const paddle = { x: 0, y: 560, w: 81, h: 14 };
const ball = { x: 0, y: 0, w: 16, h: 16, vx: 0, vy: 0 };

// Sonidos: guard para entornos sin Audio (headless/CI). Clonar el nodo deja
// rebotes rápidos solaparse sin cortar el anterior.
const hasAudio = typeof Audio !== 'undefined';
const bounceSound = hasAudio
  ? new Audio('/arkanoid-assets/sounds/ball-bounce.mp3')
  : null;
const breakSound = hasAudio
  ? new Audio('/arkanoid-assets/sounds/break-sound.mp3')
  : null;

function playSound(sound) {
  if (!sound) return;
  try {
    sound.currentTime = 0;
  } catch {
    /* reanudar desde el inicio falla silenciosamente */
  }
  sound.play().catch(() => {});
}

// ── Niveles (port de levels.js) ───────────────────────────────────────────────
const LEVELS = (() => {
  const rowColors1 = ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green'];
  const rowColors2 = ['gray', 'cyan', 'hotpink', 'yellow', 'magenta', 'green'];
  const rowColors4 = ['cyan', 'magenta', 'green', 'yellow', 'hotpink', 'red'];

  const l1 = [];
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < BLOCK_COLS; col++) {
      l1.push({ col, row, color: rowColors1[row] });
    }
  }

  const pyStart = [4, 3, 2, 1, 0, 0];
  const pyEnd = [5, 6, 7, 8, 9, 9];
  const l2 = [];
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = pyStart[row]; col <= pyEnd[row]; col++) {
      l2.push({ col, row, color: rowColors2[row] });
    }
  }

  const l3 = [];
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < BLOCK_COLS; col++) {
      if ((col + row) % 2 === 0) {
        l3.push({ col, row, color: row < 3 ? 'yellow' : 'magenta' });
      }
    }
  }

  const gaps4 = [
    [2, 5, 8],
    [0, 4, 7, 9],
    [1, 3, 6],
    [2, 5, 8, 9],
    [0, 4, 7],
    [1, 3, 6, 9],
  ];
  const l4 = [];
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < BLOCK_COLS; col++) {
      if (!gaps4[row].includes(col)) {
        l4.push({ col, row, color: rowColors4[row] });
      }
    }
  }

  const l5 = [];
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < BLOCK_COLS; col++) {
      const isFrame = col === 0 || col === 9 || row === 0 || row === 5;
      const isCross = col === 4 || row === 2;
      if (isFrame || isCross) {
        l5.push({ col, row, color: isCross && !isFrame ? 'hotpink' : 'cyan' });
      }
    }
  }

  return [
    { speed: 1.0, blocks: l1 },
    { speed: 1.1, blocks: l2 },
    { speed: 1.21, blocks: l3 },
    { speed: 1.33, blocks: l4 },
    { speed: 1.46, blocks: l5 },
  ];
})();

// ── Spritesheet (port de assets/spritesheet.js) ──────────────────────────────
const EXPLOSION_FRAMES = {
  red: [
    { sx: 256, sy: 176, sw: 32, sh: 16 },
    { sx: 288, sy: 176, sw: 32, sh: 16 },
    { sx: 320, sy: 176, sw: 32, sh: 16 },
    { sx: 352, sy: 176, sw: 32, sh: 16 },
  ],
  cyan: [
    { sx: 256, sy: 192, sw: 32, sh: 16 },
    { sx: 288, sy: 192, sw: 32, sh: 16 },
    { sx: 320, sy: 192, sw: 32, sh: 16 },
    { sx: 352, sy: 192, sw: 32, sh: 16 },
  ],
  green: [
    { sx: 256, sy: 208, sw: 32, sh: 16 },
    { sx: 288, sy: 208, sw: 32, sh: 16 },
    { sx: 320, sy: 208, sw: 32, sh: 16 },
    { sx: 352, sy: 208, sw: 32, sh: 16 },
  ],
  magenta: [
    { sx: 256, sy: 224, sw: 32, sh: 16 },
    { sx: 288, sy: 224, sw: 32, sh: 16 },
    { sx: 320, sy: 224, sw: 32, sh: 16 },
    { sx: 352, sy: 224, sw: 32, sh: 16 },
  ],
  yellow: [
    { sx: 256, sy: 240, sw: 32, sh: 16 },
    { sx: 288, sy: 240, sw: 32, sh: 16 },
    { sx: 320, sy: 240, sw: 32, sh: 16 },
    { sx: 352, sy: 240, sw: 32, sh: 16 },
  ],
  hotpink: [
    { sx: 256, sy: 256, sw: 32, sh: 16 },
    { sx: 288, sy: 256, sw: 32, sh: 16 },
    { sx: 320, sy: 256, sw: 32, sh: 16 },
    { sx: 352, sy: 256, sw: 32, sh: 16 },
  ],
  gray: [
    { sx: 256, sy: 176, sw: 32, sh: 16 },
    { sx: 288, sy: 176, sw: 32, sh: 16 },
    { sx: 320, sy: 176, sw: 32, sh: 16 },
    { sx: 352, sy: 176, sw: 32, sh: 16 },
  ],
};

const EXPLOSION_DURATION = 150;

const SPRITES = {
  paddle: { sx: 32, sy: 112, sw: 162, sh: 14 },
  ball: { sx: 32, sy: 32, sw: 16, sh: 16 },
  blocks: {
    gray: { sx: 32, sy: 288, sw: 32, sh: 16 },
    red: { sx: 32, sy: 176, sw: 32, sh: 16 },
    yellow: { sx: 32, sy: 240, sw: 32, sh: 16 },
    cyan: { sx: 32, sy: 192, sw: 32, sh: 16 },
    magenta: { sx: 32, sy: 224, sw: 32, sh: 16 },
    hotpink: { sx: 32, sy: 256, sw: 32, sh: 16 },
    green: { sx: 32, sy: 208, sw: 32, sh: 16 },
  },
};

let ssImg = null;
let ssLoaded = false;

// Carga asíncrona; drawSprite/drawFrame se saltan hasta que ssLoaded. Así el
// loop arranca de inmediato y los sprites aparecen en cuanto carga la hoja.
function loadSpritesheet() {
  if (ssLoaded) return;
  const rawImg = new Image();
  rawImg.onload = () => {
    const oc = document.createElement('canvas');
    oc.width = rawImg.width;
    oc.height = rawImg.height;
    oc.getContext('2d').drawImage(rawImg, 0, 0);
    ssImg = oc;
    ssLoaded = true;
  };
  rawImg.onerror = () => {
    /* sin hoja: fondos planos, el juego sigue */
  };
  rawImg.src = '/arkanoid-assets/spritesheet-breakout.png';
}

function drawFrame(frame, x, y, w, h) {
  if (!ssLoaded) return;
  ctx.drawImage(ssImg, frame.sx, frame.sy, frame.sw, frame.sh, x, y, w, h);
}

function drawSprite(name, x, y, w, h) {
  if (!ssLoaded) return;
  let sp;
  if (name.startsWith('block_')) {
    sp = SPRITES.blocks[name.slice(6)];
  } else {
    sp = SPRITES[name];
  }
  if (!sp) return;
  ctx.drawImage(ssImg, sp.sx, sp.sy, sp.sw, sp.sh, x, y, w, h);
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let blocks = [];
let explosions = [];
let lives = 3;
let score = 0;
let gameState = 'playing';
let currentLevel = 1;
let isPaused = false;

const keys = { ArrowLeft: false, ArrowRight: false };

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function initPaddle() {
  paddle.x = (W - paddle.w) / 2;
}

function restartBall(speed) {
  ball.x = paddle.x + (paddle.w - ball.w) / 2;
  ball.y = paddle.y - ball.h;
  ball.vx = BASE_BALL_VX * speed;
  ball.vy = BASE_BALL_VY * speed;
}

function loadLevel(n) {
  currentLevel = n;
  const level = LEVELS[n - 1];
  blocks = level.blocks.map((b) => ({
    x: BLOCKS_ORIGIN_X + b.col * BLOCK_W,
    y: BLOCKS_ORIGIN_Y + b.row * BLOCK_H,
    w: BLOCK_W,
    h: BLOCK_H,
    color: b.color,
    alive: true,
  }));
  explosions = [];
  restartBall(level.speed);
}

function resetGame() {
  lives = 3;
  score = 0;
  gameState = 'playing';
  isPaused = false;
  gameOverFired = false;
  initPaddle();
  loadLevel(1);
}

// onGameOverCallback se dispara una sola vez por partida (gameover o win).
function endGame(finalScore) {
  if (gameOverFired) return;
  gameOverFired = true;
  if (onGameOverCallback) onGameOverCallback(finalScore);
}

function restart() {
  resetGame();
}

// ── Input ─────────────────────────────────────────────────────────────────────
function handleKeyDown(e) {
  if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') keys[e.key] = true;
  if (
    (e.key === 'p' || e.key === 'P' || e.key === 'Escape') &&
    gameState === 'playing'
  ) {
    isPaused = !isPaused;
  }
  if (
    (gameState === 'gameover' || gameState === 'win') &&
    ['Space', 'Enter', 'KeyR'].includes(e.code)
  ) {
    restart();
  }
}

function handleKeyUp(e) {
  if (e.key in keys) keys[e.key] = false;
}

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const mouseX = (e.clientX - rect.left) * scaleX;
  paddle.x = clamp(mouseX - paddle.w / 2, 0, W - paddle.w);
}

function attachInput() {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  canvas.addEventListener('mousemove', handleMouseMove);
}

function detachInput() {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  canvas.removeEventListener('mousemove', handleMouseMove);
}

// ── Update ────────────────────────────────────────────────────────────────────
function collideAABB(block) {
  return (
    ball.x < block.x + block.w &&
    ball.x + ball.w > block.x &&
    ball.y < block.y + block.h &&
    ball.y + ball.h > block.y
  );
}

function update(dt) {
  if (gameState !== 'playing') return;

  if (keys.ArrowLeft) {
    paddle.x = clamp(paddle.x - PADDLE_SPEED * dt, 0, W - paddle.w);
  }
  if (keys.ArrowRight) {
    paddle.x = clamp(paddle.x + PADDLE_SPEED * dt, 0, W - paddle.w);
  }

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x <= 0) {
    ball.x = 0;
    ball.vx = Math.abs(ball.vx);
    playSound(bounceSound);
  }
  if (ball.x + ball.w >= W) {
    ball.x = W - ball.w;
    ball.vx = -Math.abs(ball.vx);
    playSound(bounceSound);
  }
  if (ball.y <= 0) {
    ball.y = 0;
    ball.vy = Math.abs(ball.vy);
    playSound(bounceSound);
  }

  if (
    ball.vy > 0 &&
    ball.x + ball.w > paddle.x &&
    ball.x < paddle.x + paddle.w &&
    ball.y + ball.h >= paddle.y &&
    ball.y + ball.h <= paddle.y + paddle.h + 8
  ) {
    ball.y = paddle.y - ball.h;
    ball.vy = -Math.abs(ball.vy);
    playSound(bounceSound);
  }

  for (const block of blocks) {
    if (!block.alive) continue;
    if (collideAABB(block)) {
      block.alive = false;
      explosions.push({
        x: block.x,
        y: block.y,
        w: block.w,
        h: block.h,
        color: block.color,
        elapsed: 0,
      });
      score += 10;
      ball.vy = -ball.vy;
      playSound(breakSound);
      if (blocks.every((b) => !b.alive)) {
        if (currentLevel < LEVELS.length) {
          loadLevel(currentLevel + 1);
        } else {
          gameState = 'win';
          endGame(score);
        }
      }
      break; // un bloque por frame
    }
  }

  for (const exp of explosions) exp.elapsed += dt * 1000;
  explosions = explosions.filter((exp) => exp.elapsed < EXPLOSION_DURATION);

  if (ball.y > H) {
    lives--;
    if (lives <= 0) {
      lives = 0;
      gameState = 'gameover';
      endGame(score);
    } else {
      restartBall(LEVELS[currentLevel - 1].speed);
    }
  }
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawHUD() {
  ctx.fillStyle = palette.hudText;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Score: ' + score, 10, 10);
  ctx.textAlign = 'center';
  ctx.fillText('Nivel: ' + currentLevel, W / 2, 10);
  const ballSize = 16;
  const ballSpacing = 4;
  for (let i = 0; i < lives; i++) {
    const bx = W - 10 - (lives - i) * (ballSize + ballSpacing);
    drawSprite('ball', bx, 10, ballSize, ballSize);
  }
}

function drawOverlay(message, sub) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = palette.hudText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 64px monospace';
  ctx.fillText(message, W / 2, H / 2 - 20);
  if (sub) {
    ctx.font = 'bold 18px monospace';
    ctx.fillText(sub, W / 2, H / 2 + 30);
  }
}

function drawPauseOverlay() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = palette.hudText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 56px monospace';
  ctx.fillText('PAUSA', W / 2, H / 2 - 10);
  ctx.font = 'bold 16px monospace';
  ctx.fillText('P para continuar', W / 2, H / 2 + 30);
}

function draw() {
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, W, H);

  for (const block of blocks) {
    if (block.alive) {
      drawSprite('block_' + block.color, block.x, block.y, block.w, block.h);
    }
  }

  for (const exp of explosions) {
    const frameIndex = Math.min(
      Math.floor((exp.elapsed / EXPLOSION_DURATION) * 4),
      3
    );
    drawFrame(
      EXPLOSION_FRAMES[exp.color][frameIndex],
      exp.x,
      exp.y,
      exp.w,
      exp.h
    );
  }

  drawSprite('paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite('ball', ball.x, ball.y, ball.w, ball.h);

  if (gameState === 'playing') drawHUD();

  if (gameState === 'gameover') {
    drawOverlay('GAME OVER', 'PUNTAJE: ' + score + ' — ESPACIO PARA REINICIAR');
  }
  if (gameState === 'win') {
    drawOverlay(
      '¡Completaste el juego!',
      'PUNTAJE: ' + score + ' — ESPACIO PARA REINICIAR'
    );
  }
  if (isPaused) drawPauseOverlay();
}

// ── Main Loop (setTimeout encadenado) ─────────────────────────────────────────
function scheduleTick() {
  timerId = setTimeout(() => loop(performance.now()), 1000 / 60);
}

function loop(ts) {
  if (destroyed) return;
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  if (!isPaused) update(dt);
  draw();
  scheduleTick();
}

// ── Public API ────────────────────────────────────────────────────────────────
export function initGame(targetCanvas, options = {}) {
  canvas = targetCanvas;
  ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  palette = PALETTES[isSkinId(options.skin) ? options.skin : DEFAULT_SKIN];
  onGameOverCallback = options.onGameOver || null;
  destroyed = false;
  resetGame();
  attachInput();
  lastTime = null;
  clearTimeout(timerId);
  scheduleTick();
  loadSpritesheet();
}

export function destroy() {
  destroyed = true;
  if (timerId) clearTimeout(timerId);
  timerId = null;
  detachInput();
  canvas = null;
  ctx = null;
  blocks = [];
  explosions = [];
  onGameOverCallback = null;
}

export function setOnGameOver(callback) {
  onGameOverCallback = callback;
}
