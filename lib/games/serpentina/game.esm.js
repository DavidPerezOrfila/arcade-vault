// SERPENTINA (Snake): engine vanilla escrito desde cero, envuelto como ES module.
// Sigue el patrón probado de caida/asteroids:
//  - initGame(refs, { onGameOver }) recibe los elementos ya montados (sin document.getElementById top-level)
//  - keydown attach/detach pareados; RAF module-scoped, destroy() lo cancela
//  - dt clamp 0.05s; resolución interna fija 600×600, CSS escala
//  - onGameOver fire una vez (guard gameOverFired)

const COLS = 24;
const ROWS = 24;
const CELL = 25; // canvas 600×600

const TICK_START = 130;
const TICK_STEP = 6;
const TICK_MIN = 60;

const IMG_URL = '/snake-assets/fruits.png';

// Atlas de 22 frutas — coordenadas copiadas 1:1 de
// resources/started-games/06-snake/sprites.js (single source of truth).
const FRUIT_ATLAS = {
  banana: { x: 34, y: 136, w: 110, h: 160 },
  orange: { x: 186, y: 136, w: 150, h: 160 },
  grape: { x: 378, y: 136, w: 110, h: 160 },
  garlic: { x: 540, y: 136, w: 130, h: 160 },
  eggplant: { x: 712, y: 136, w: 130, h: 160 },
  strawberry: { x: 894, y: 136, w: 110, h: 160 },
  cherry: { x: 1066, y: 136, w: 110, h: 160 },
  carrot: { x: 1228, y: 136, w: 130, h: 160 },
  mushroom: { x: 1400, y: 136, w: 130, h: 160 },
  broccoli: { x: 1582, y: 136, w: 110, h: 160 },
  watermelon: { x: 1734, y: 136, w: 150, h: 160 },
  pepper: { x: 1906, y: 136, w: 150, h: 160 },
  kiwi: { x: 2068, y: 136, w: 170, h: 160 },
  lemon: { x: 2250, y: 136, w: 140, h: 160 },
  peach: { x: 2432, y: 136, w: 130, h: 160 },
  peanut: { x: 2604, y: 136, w: 130, h: 160 },
  apple: { x: 2786, y: 136, w: 110, h: 160 },
  tomato: { x: 2948, y: 136, w: 130, h: 160 },
  berries: { x: 3110, y: 136, w: 150, h: 160 },
  grapes2: { x: 3302, y: 136, w: 110, h: 160 },
  pineapple: { x: 3454, y: 136, w: 150, h: 160 },
  melon: { x: 3637, y: 136, w: 130, h: 160 },
};
const FRUIT_NAMES = Object.keys(FRUIT_ATLAS);

// ── Module-scoped state ───────────────────────────────────────────────────────
let refs = null;
let canvas = null;
let ctx = null;

let snake, dir, nextDir, food, fruitIndex, score;
let gameOver, gameOverFired;
let tickAccum, tickInterval;
let animId, lastTime;
let onGameOverCallback = null;
let img = null;
let imgReady = false;

// Comida en celda vacía (fuera del cuerpo). Si la grilla se llena, terminal.
function spawnFood() {
  const empty = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!snake.some((s) => s.x === x && s.y === y)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) {
    endGame();
    return;
  }
  food = empty[Math.floor(Math.random() * empty.length)];
  fruitIndex = Math.floor(Math.random() * FRUIT_NAMES.length);
}

function reset() {
  snake = [
    { x: 11, y: 12 },
    { x: 10, y: 12 },
    { x: 9, y: 12 },
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  gameOverFired = false;
  tickInterval = TICK_START;
  tickAccum = 0;
  spawnFood();
  updateHUD();
}

function updateHUD() {
  refs.scoreEl.textContent = score.toLocaleString();
}

function step() {
  dir = nextDir;
  const head = snake[0];
  const nx = head.x + dir.x;
  const ny = head.y + dir.y;

  // Pared = game over (chocar borde = terminal).
  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
    endGame();
    return;
  }

  // Morderse la cola = game over. Si NO comemos, la celda de la cola se
  // libera en este mismo tick, así que solo colisiona cuando crecemos.
  const grows = nx === food.x && ny === food.y;
  const body = grows ? snake : snake.slice(0, -1);
  if (body.some((s) => s.x === nx && s.y === ny)) {
    endGame();
    return;
  }

  snake.unshift({ x: nx, y: ny });

  if (grows) {
    score += 10;
    tickInterval = Math.max(TICK_MIN, tickInterval - TICK_STEP);
    updateHUD();
    spawnFood(); // no pop → la serpiente crece
  } else {
    snake.pop();
  }
}

function draw() {
  // Guard: la imagen puede resolverse tras destroy() (ctx null) — no dibujar.
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Grid sutil para lectura de la grilla 24×24.
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL, 0);
    ctx.lineTo(c * CELL, ROWS * CELL);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL);
    ctx.lineTo(COLS * CELL, r * CELL);
    ctx.stroke();
  }

  // Comida como sprite de fruits.png (fallback fillRect si no cargó).
  if (imgReady) {
    const f = FRUIT_ATLAS[FRUIT_NAMES[fruitIndex]];
    ctx.drawImage(
      img,
      f.x,
      f.y,
      f.w,
      f.h,
      food.x * CELL,
      food.y * CELL,
      CELL,
      CELL
    );
  } else {
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
  }

  // Cuerpo geométrico verde con highlight; cabeza más brillante.
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#4ade80' : '#16a34a';
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, 4);
  });
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  if (!gameOverFired) {
    gameOverFired = true;
    if (onGameOverCallback) onGameOverCallback(score);
  }
  refs.overlayTitle.textContent = 'GAME OVER';
  refs.overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;
  refs.overlay.classList.remove('hidden');
}

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min(ts - lastTime, 50); // 0.05s clamp (tab-blur guard)
  lastTime = ts;
  tickAccum += dt;
  if (tickAccum >= tickInterval) {
    tickAccum = 0;
    step();
  }
  if (gameOver) return;
  draw();
  animId = requestAnimationFrame(loop);
}

function onKeyDown(e) {
  // Flechas + WASD con anti-reverse vía buffer nextDir (validado contra dir actual).
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      e.preventDefault();
      if (dir.y !== 1) nextDir = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
    case 'KeyS':
      e.preventDefault();
      if (dir.y !== -1) nextDir = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
    case 'KeyA':
      e.preventDefault();
      if (dir.x !== 1) nextDir = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
    case 'KeyD':
      e.preventDefault();
      if (dir.x !== -1) nextDir = { x: 1, y: 0 };
      break;
  }
}

function attachInput() {
  window.removeEventListener('keydown', onKeyDown);
  window.addEventListener('keydown', onKeyDown);
}

function detachInput() {
  window.removeEventListener('keydown', onKeyDown);
}

// ── Public API ────────────────────────────────────────────────────────────────
export function initGame(gameRefs, options = {}) {
  refs = gameRefs;
  canvas = refs.board;
  ctx = canvas.getContext('2d');
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;

  onGameOverCallback = options.onGameOver || null;

  // Imagen de frutas (cacheable por el navegador). Solo drawImage si cargó;
  // re-draw al cargar.
  if (!img) {
    img = new Image();
    img.onload = () => {
      imgReady = true;
      draw();
    };
    img.src = IMG_URL;
  }

  reset();
  attachInput();
  refs.overlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  lastTime = performance.now();
  animId = requestAnimationFrame(loop);
}

export function destroy() {
  if (animId) cancelAnimationFrame(animId);
  animId = null;
  detachInput();
  canvas = null;
  ctx = null;
  refs = null;
  snake = null;
  food = null;
  onGameOverCallback = null;
}

export function setOnGameOver(callback) {
  onGameOverCallback = callback;
}
