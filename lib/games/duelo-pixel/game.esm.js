// Motor de DUELO PIXEL — Pong VERSUS para Arcade Vault.
// Browser-only ES module. Sin globals en module scope; refs inyectadas por React.
// Loop por setTimeout encadenado (RAF se estrangula en WebKit headless/CI).
// onGameOver(score) fire UNA vez (guard gameOverFired).
//
// Modos (initGame options.mode):
//   cpu-endurance    — solitario vs CPU, puntuado. Rondas (primera a 5):
//                      ganar suma +1 a duelsWon y sube tier (dificultad CPU);
//                      perder resta 1 vida (3). Vidas 0 => onGameOver(duelsWon).
//   local-exhibition — 2 jugadores locales al mejor de 7 (primero a 4). Sin
//                      onGameOver (no es puntuado). Overlay de vencedor en-canvas.

import { PALETTES, DEFAULT_SKIN, isSkinId } from '@/lib/games/skins';

const W = 800;
const H = 600;
const PADDLE_W = 14;
const PADDLE_H = 96;
const BALL_SIZE = 14;
const PLAYER_PADDLE_SPEED = 420;
const BASE_BALL_SPEED = 300;
const MAX_BALL_SPEED = 560;
const STARTING_LIVES = 3;
const BEST_OF = 7;
const SERVE_DELAY = 1.2; // en segundos
const PADDLE_X_LEFT = 24;
const PADDLE_X_RIGHT = W - 24 - PADDLE_W;
const BALL_SPEED_STEP = 8;
const CPU_MAX_SPEED_CAP = 520;
const CPU_MIN_ERROR = 10;
const TICK = 1000 / 60;

let ctx = null;
let canvas = null;
let timerId = null;
let onGameOverCb = () => {};

let mode = 'cpu-endurance';
let palette = PALETTES[isSkinId(DEFAULT_SKIN) ? DEFAULT_SKIN : DEFAULT_SKIN];

let gameState = 'serve'; // 'serve' | 'playing' | 'paused' | 'gameover' | 'setOver'
let serveTimer = Infinity;
let gameOverFired = false;

const player = {
  x: PADDLE_X_LEFT,
  y: H / 2 - PADDLE_H / 2,
  w: PADDLE_W,
  h: PADDLE_H,
};
const enemy = {
  x: PADDLE_X_RIGHT,
  y: H / 2 - PADDLE_H / 2,
  w: PADDLE_W,
  h: PADDLE_H,
};
const ball = {
  x: W / 2,
  y: H / 2,
  size: BALL_SIZE,
  vx: 0,
  vy: 0,
  speed: BASE_BALL_SPEED,
};

// cpu-endurance
let lives = STARTING_LIVES;
let duelsWon = 0;
let tier = 0;
let cpu = { targetY: H / 2, maxSpeed: 240, error: 90 };

// local-exhibition
let setScore1 = 0;
let setScore2 = 0;
let setWinner = null; // 1 | 2 | null

const DASH = [8, 8];

function resetBallVelocity(dir) {
  const angle = (Math.random() - 0.5) * (Math.PI / 3);
  ball.vx = Math.cos(angle) * ball.speed * dir;
  ball.vy = Math.sin(angle) * ball.speed;
}

function prepareServe(dir) {
  gameState = 'serve';
  ball.x = W / 2;
  ball.y = H / 2;
  ball.vx = 0;
  ball.vy = 0;
  ball.speed = Math.min(BASE_BALL_SPEED + tier * 10, 420);
  serveTimer = performance.now() + SERVE_DELAY * 1000;
  resetBallVelocity(dir);
}

function endDuel() {
  // Saca la CPU (dir 1 => hacia la derecha, la paleta del jugador).
  prepareServe(1);
}

function handleCpuDuelWin() {
  if (mode !== 'cpu-endurance') return;
  lives -= 1;
  if (lives <= 0) {
    gameOver();
    return;
  }
  endDuel();
}

function handlePlayerDuelWin() {
  if (mode !== 'cpu-endurance') return;
  duelsWon += 1;
  tier = duelsWon;
  cpu = {
    targetY: H / 2,
    maxSpeed: Math.min(240 + tier * 18, CPU_MAX_SPEED_CAP),
    error: Math.max(90 - tier * 8, CPU_MIN_ERROR),
  };
  endDuel();
}

function handleExhibitionPoint(scoredBy) {
  // scoredBy: 1 => marcó la paleta izquierda (J1), 2 => la derecha (J2).
  if (scoredBy === 1) setScore1 += 1;
  else setScore2 += 1;

  const roundsToWin = Math.ceil(BEST_OF / 2); // 4
  if (setScore1 === roundsToWin || setScore2 === roundsToWin) {
    setWinner = setScore1 === roundsToWin ? 1 : 2;
    gameState = 'setOver';
    return;
  }
  // Nueva ronda.
  setScore1 = 0;
  setScore2 = 0;
  prepareServe(scoredBy === 1 ? -1 : 1);
}

function gameOver() {
  if (gameOverFired) return;
  gameOverFired = true;
  gameState = 'gameover';
  onGameOverCb(duelsWon);
}

function reflectPaddle(p) {
  // Rebotar pelota en paleta p. Zona alta => vy fuerte arriba, media => suave,
  // baja => fuerte abajo. Velocidad conservada (+8 por toque con tope).
  const rel = (ball.y - (p.y + p.h / 2)) / (p.h / 2); // -1..1
  let angle;
  if (rel < -0.34) angle = -Math.PI / 3 + (Math.random() - 0.5) * 0.2;
  else if (rel > 0.34) angle = Math.PI / 3 + (Math.random() - 0.5) * 0.2;
  else angle = (Math.random() - 0.5) * (Math.PI / 6);
  const dir = ball.vx > 0 ? -1 : 1;
  ball.vx = Math.cos(angle) * ball.speed * dir;
  ball.vy = Math.sin(angle) * ball.speed;
  ball.speed = Math.min(ball.speed + BALL_SPEED_STEP, MAX_BALL_SPEED);
}

function clampY(entity) {
  entity.y = Math.max(0, Math.min(H - entity.h, entity.y));
}

function updateCpu(dt) {
  if (mode !== 'cpu-endurance') return;
  // La CPU solo persigue cuando la pelota viaja hacía su lado (vx > 0).
  if (ball.vx <= 0) return;
  const target = ball.y - cpu.error / 2 - enemy.h / 2;
  const dy = target - enemy.y;
  const step = cpu.maxSpeed * dt;
  if (Math.abs(dy) <= step) enemy.y = target;
  else enemy.y += Math.sign(dy) * step;
  clampY(enemy);
}

function updatePlayer(dt, keyset) {
  const step = PLAYER_PADDLE_SPEED * dt;
  if (keyset.up) player.y -= step;
  if (keyset.down) player.y += step;
  clampY(player);
}

function update(dt) {
  if (gameState === 'serve') {
    if (performance.now() >= serveTimer) gameState = 'playing';
    return;
  }
  if (gameState !== 'playing') return;

  if (mode === 'cpu-endurance') {updatePlayer(dt, { up: keys.upJ1, down: keys.downJ1 });} else {
    updatePlayer(dt, { up: keys.upJ1, down: keys.downJ1 });
    updatePlayer(dt, { up: keys.upJ2, down: keys.downJ2 });
  }
  updateCpu(dt);

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Paredes superior/inferior.
  if (ball.y < 0) {
    ball.y = 0;
    ball.vy = Math.abs(ball.vy);
  } else if (ball.y + ball.size > H) {
    ball.y = H - ball.size;
    ball.vy = -Math.abs(ball.vy);
  }

  // Paleta izquierda (J1).
  if (
    ball.vx < 0 &&
    ball.x <= player.x + player.w &&
    ball.x + ball.size >= player.x
  ) {
    if (ball.y + ball.size >= player.y && ball.y <= player.y + player.h) {
      ball.x = player.x + player.w;
      ball.vx = Math.abs(ball.vx);
      reflectPaddle(player);
    }
  }

  // Paleta derecha (CPU en cpu-endurance, J2 en local-exhibition).
  if (
    ball.vx > 0 &&
    ball.x + ball.size >= enemy.x &&
    ball.x <= enemy.x + enemy.w
  ) {
    if (ball.y + ball.size >= enemy.y && ball.y <= enemy.y + enemy.h) {
      ball.x = enemy.x - ball.size;
      ball.vx = -Math.abs(ball.vx);
      reflectPaddle(enemy);
    }
  }

  // Gol — fuera por la izquierda (marcó derecha) o derecha (marcó izquierda).
  if (ball.x < -ball.size) {
    if (mode === 'cpu-endurance') handleCpuDuelWin();
    else handleExhibitionPoint(2);
  } else if (ball.x > W + ball.size) {
    if (mode === 'cpu-endurance') handlePlayerDuelWin();
    else handleExhibitionPoint(1);
  }
}

function drawRoundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawHudNumber(text, x, y) {
  ctx.save();
  ctx.fillStyle = palette.hudText;
  ctx.font = "700 18px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawOverlay(title, sub) {
  ctx.save();
  ctx.fillStyle = 'rgba(6, 8, 12, 0.72)';
  ctx.fillRect(0, H / 2 - 72, W, 144);
  if (title) {
    ctx.fillStyle = palette.hudText;
    ctx.font = "700 22px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, W / 2, H / 2 - 14);
  }
  if (sub) {
    ctx.fillStyle = palette.hudText;
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.75;
    ctx.fillText(sub, W / 2, H / 2 + 18);
  }
  ctx.restore();
}

function draw() {
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, W, H);

  // Línea central.
  ctx.save();
  ctx.strokeStyle = palette.accent;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 2;
  ctx.setLineDash(DASH);
  ctx.beginPath();
  ctx.moveTo(W / 2, 8);
  ctx.lineTo(W / 2, H - 8);
  ctx.stroke();
  ctx.restore();

  // Paletas.
  ctx.fillStyle = palette.player;
  drawRoundRect(player.x, player.y, player.w, player.h, 4);
  ctx.fillStyle = palette.enemy;
  drawRoundRect(enemy.x, enemy.y, enemy.w, enemy.h, 4);

  // Pelota.
  ctx.fillStyle = palette.bullet;
  drawRoundRect(ball.x, ball.y, ball.size, ball.size, 3);

  // Marcador central: RONDAS/VIDAS (cpu) o J1/J2 (exhibition).
  if (mode === 'cpu-endurance') {
    drawHudNumber(String(duelsWon), W / 2 - 44, 16);
    drawHudNumber(String(lives), W / 2 + 44, 16);
    ctx.save();
    ctx.fillStyle = palette.hudText;
    ctx.globalAlpha = 0.65;
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`TIER ${tier + 1}`, 16, 20);
    ctx.restore();
  } else {
    drawHudNumber(String(setScore1), W / 2 - 44, 16);
    drawHudNumber(String(setScore2), W / 2 + 44, 16);
  }

  if (gameState === 'serve') {
    drawOverlay(
      'ESPACIO PARA SERVIR',
      mode === 'cpu-endurance' ? 'P / ESC PARA PAUSAR' : 'P / ESC PARA PAUSAR'
    );
  } else if (gameState === 'paused') {
    drawOverlay('PAUSA', 'P / ESC PARA CONTINUAR');
  } else if (gameState === 'gameover') {
    drawOverlay(`GAME OVER — ${duelsWon} RONDAS`, 'R / ESPACIO PARA REVANCHA');
  } else if (gameState === 'setOver' && setWinner) {
    const who = setWinner === 1 ? 'JUGADOR 1' : 'JUGADOR 2';
    drawOverlay(`${who} GANA LA PARTIDA`, 'R / ESPACIO PARA REVANCHA');
  }
}

function loop() {
  if (!ctx || gameState === 'gameover') return;
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  update(dt);
  draw();
  // En setOver seguimos dibujando (overlay) pero frenamos el loop de física.
  timerId = setTimeout(loop, TICK);
}

let lastTime = 0;

const keys = { upJ1: false, downJ1: false, upJ2: false, downJ2: false };

function onKeyDown(e) {
  const code = e.code;
  // J1: W/S. Flechas: J1 en cpu-endurance, J2 en local-exhibition.
  if (code === 'KeyW') keys.upJ1 = true;
  if (code === 'KeyS') keys.downJ1 = true;
  if (code === 'ArrowUp' || code === 'ArrowDown') {
    if (mode === 'local-exhibition') {
      if (code === 'ArrowUp') keys.upJ2 = true;
      else keys.downJ2 = true;
    } else if (code === 'ArrowUp') keys.upJ1 = true;
      else keys.downJ1 = true;
  }
  if (code === 'KeyP' || code === 'Escape') {
    if (gameState === 'playing') gameState = 'paused';
    else if (gameState === 'paused') gameState = 'playing';
  }
  if (code === 'Space' || code === 'KeyR') {
    if (gameState === 'serve') {
      gameState = 'playing';
      return;
    }
    if (gameState === 'paused') {
      gameState = 'playing';
      return;
    }
    if (gameState === 'gameover') {
      initGame({ canvas }, { skin: mode, mode, onGameOver: onGameOverCb });
      return;
    }
    if (gameState === 'setOver') {
      initGame({ canvas }, { skin: mode, mode, onGameOver: onGameOverCb });
      return;
    }
  }
  if (e.target === document.body) e.preventDefault();
}

function onKeyUp(e) {
  const code = e.code;
  if (code === 'KeyW') keys.upJ1 = false;
  if (code === 'KeyS') keys.downJ1 = false;
  if (code === 'ArrowUp' || code === 'ArrowDown') {
    if (mode === 'local-exhibition') {
      if (code === 'ArrowUp') keys.upJ2 = false;
      else keys.downJ2 = false;
    } else if (code === 'ArrowUp') keys.upJ1 = false;
      else keys.downJ1 = false;
  }
}

function attachInput() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

function detachInput() {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
}

function resetRun(nextMode) {
  mode = nextMode;
  gameOverFired = false;
  gameState = 'serve';
  serveTimer = Infinity;
  lastTime = performance.now();
  ball.x = W / 2;
  ball.y = H / 2;
  ball.vx = 0;
  ball.vy = 0;
  ball.speed = BASE_BALL_SPEED;
  player.x = PADDLE_X_LEFT;
  player.y = H / 2 - PADDLE_H / 2;
  enemy.x = PADDLE_X_RIGHT;
  enemy.y = H / 2 - PADDLE_H / 2;
  lives = STARTING_LIVES;
  duelsWon = 0;
  tier = 0;
  cpu = { targetY: H / 2, maxSpeed: 240, error: 90 };
  setScore1 = 0;
  setScore2 = 0;
  setWinner = null;
  keys.upJ1 = false;
  keys.downJ1 = false;
  keys.upJ2 = false;
  keys.downJ2 = false;
  prepareServe(nextMode === 'local-exhibition' ? -1 : 1);
}

export function setOnGameOver(cb) {
  onGameOverCb = cb;
}

export function initGame(refs, options = {}) {
  const { skin, mode, onGameOver } = options;
  canvas = refs.canvas || refs;
  ctx = canvas.getContext ? canvas.getContext('2d') : null;
  if (onGameOver) onGameOverCb = onGameOver;
  palette = PALETTES[isSkinId(skin) ? skin : DEFAULT_SKIN];
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  detachInput();
  resetRun(mode || 'cpu-endurance');
  attachInput();
  timerId = setTimeout(loop, TICK);
}

export function destroy() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  detachInput();
  ctx = null;
  canvas = null;
}

const DueloPixel = { initGame, destroy, setOnGameOver };
export default DueloPixel;
