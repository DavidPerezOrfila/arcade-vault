// CAÍDA (Tetris): engine vanilla envuelto como ES module.
// Adaptación mínima de resources/started-games/03-tetris/game.js:
//  - initGame(refs, { onGameOver, skin }) recibe los elementos ya montados (sin document.getElementById top-level)
//  - sin theme-toggle / localStorage (la plataforma ownse el theming)
//  - keydown attach/detach pareados; loop por setTimeout encadenado
//  (independiente de RAF: RAF se estrangula en headless WebKit/CI)
//  - dt clamp 0.05s; resolución interna fija (board 300×600, next 120×120), CSS escala

import { PALETTES, DEFAULT_SKIN, isSkinId } from '@/lib/games/skins';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

// Colores de pieza en PALETTES.blocks (índice 1..8: I, O, T, S, Z, J, L, N).

const PIECES = [
  null,
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ], // I
  [
    [2, 2],
    [2, 2]
  ], // O
  [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0]
  ], // T
  [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0]
  ], // S
  [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0]
  ], // Z
  [
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0]
  ], // J
  [
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0]
  ], // L
  [
    [8, 8, 8],
    [8, 0, 8],
    [8, 8, 8]
  ] // N (tuerca)
];

const LINE_SCORES = [0, 100, 300, 500, 800];

// Color de las líneas del grid: derivado del skin (hudText a baja opacidad).
function hexToRgba(hex, alpha) {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
}

// ── Module-scoped state ───────────────────────────────────────────────────────
let refs = null;
let canvas = null;
let ctx = null;
let nextCanvas = null;
let nextCtx = null;

let board,
  current,
  next,
  score,
  lines,
  level,
  paused,
  gameOver,
  lastTime,
  dropAccum,
  dropInterval,
  timerId;
let onGameOverCallback = null;
let gameOverFired = false;
let palette = PALETTES[DEFAULT_SKIN];
let gridLineColor = hexToRgba(palette.hudText, 0.18);

// P1 cache: avoid redundant HUD DOM writes on unchanged values
let lastScore = -1;
let lastLines = -1;
let lastLevel = -1;

// P3 hoist: canvas state constant reused every frame
const HIGHLIGHT_COLOR = 'rgba(255,255,255,0.12)';

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * 8) + 1;
  const shape = PIECES[type].map((row) => [...row]);
  return {
    type,
    shape,
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: 0
  };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length,
    cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = shape[r][c];
    }
  }
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++) {
    for (let c = 0; c < current.shape[r].length; c++) {
      if (current.shape[r][c]) {
        board[current.y + r][current.x + c] = current.shape[r][c];
      }
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every((v) => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    lines += cleared;
    score += (LINE_SCORES[cleared] || 0) * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    updateHUD();
  }
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  clearLines();
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  // P1: only write DOM when the displayed value actually changes
  if (score !== lastScore) {
    lastScore = score;
    refs.scoreEl.textContent = score.toLocaleString();
  }
  if (lines !== lastLines) {
    lastLines = lines;
    refs.linesEl.textContent = lines;
  }
  if (level !== lastLevel) {
    lastLevel = level;
    refs.levelEl.textContent = level;
  }
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  context.globalAlpha = alpha ?? 1;
  context.fillStyle = palette.blocks[colorIndex];
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  context.fillStyle = HIGHLIGHT_COLOR;
  context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
  context.globalAlpha = 1;
}

function drawGrid() {
  ctx.beginPath();
  for (let c = 1; c < COLS; c++) {
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
  }
  ctx.stroke();
}

function draw() {
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      drawBlock(ctx, c, r, board[r][c], BLOCK);
    }
  }

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++) {
    for (let c = 0; c < current.shape[r].length; c++) {
      if (current.shape[r][c]) {
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);
      }
    }
  }

  // current piece
  for (let r = 0; r < current.shape.length; r++) {
    for (let c = 0; c < current.shape[r].length; c++) {
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
    }
  }
}

function drawNext() {
  const NB = 30;
  nextCtx.fillStyle = palette.background;
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
    }
  }
}

function endGame() {
  gameOver = true;
  clearTimeout(timerId);
  if (!gameOverFired) {
    gameOverFired = true;
    if (onGameOverCallback) onGameOverCallback(score);
  }
  refs.overlayTitle.textContent = 'GAME OVER';
  refs.overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;
  refs.overlay.classList.remove('hidden');
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    lastTime = performance.now();
    scheduleTick();
  } else {
    clearTimeout(timerId);
    refs.overlayTitle.textContent = 'PAUSA';
    refs.overlayScore.textContent = '';
    refs.overlay.classList.remove('hidden');
  }
}

function scheduleTick() {
  timerId = setTimeout(() => loop(performance.now()), 1000 / 60);
}

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min(ts - lastTime, 50); // 0.05s clamp (tab-blur guard)
  lastTime = ts;
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  if (gameOver) return;
  draw();
  scheduleTick();
}

function onKeyDown(e) {
  // Evita el scroll de página con las flechas/espacio mientras se juega
  if (
    [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Space',
      'KeyX',
      'KeyP'
    ].includes(e.code)
  ) {
    e.preventDefault();
  }
  if (e.code === 'KeyP') {
    togglePause();
    return;
  }
  if (paused || gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
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
  canvas.width = COLS * BLOCK;
  canvas.height = ROWS * BLOCK;
  nextCanvas = refs.nextCanvas;
  nextCtx = nextCanvas.getContext('2d');
  nextCanvas.width = 4 * BLOCK;
  nextCanvas.height = 4 * BLOCK;

  onGameOverCallback = options.onGameOver || null;
  gameOverFired = false;

  palette = PALETTES[isSkinId(options.skin) ? options.skin : DEFAULT_SKIN];
  gridLineColor = hexToRgba(palette.hudText, 0.18);

  // P3: set grid canvas state once (hoisted from drawGrid)
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth = 0.5;

  attachInput();

  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  lastScore = 0;
  lastLines = 0;
  lastLevel = 1;
  paused = false;
  gameOver = false;
  dropInterval = 1000;
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  refs.overlay.classList.add('hidden');
  clearTimeout(timerId);
  draw();
  scheduleTick();
}

export function destroy() {
  if (timerId) clearTimeout(timerId);
  timerId = null;
  detachInput();
  canvas = null;
  ctx = null;
  nextCanvas = null;
  nextCtx = null;
  refs = null;
  board = null;
  current = null;
  next = null;
  onGameOverCallback = null;
}

export function setOnGameOver(callback) {
  onGameOverCallback = callback;
}
