// RANARIA (Frogger): engine vanilla envuelto como ES module, construido desde
// cero siguiendo specs/game-jam/frogger/01-frogger-core.md con el contrato de
// la plataforma (initGame(refs, { onGameOver, skin }) / destroy / setTimeout).
//
//  - cuadrícula 16×14 de 40 px (640×560); CSS escala el canvas
//  - zonas: bocas (fila 0), río (1-6), meditación (7), carretera (8-12), inicio (13)
//  - rana salta una celda con animación de 120 ms; deriva sobre troncos/tortugas
//  - tortugas con ciclo de inmersión 3 s visible / 1.5 s sumergida
//  - loop por setTimeout encadenado (independiente de RAF: se estrangula en CI)
//  - colores derivados de PALETTES: frog=player, coches=enemy/bullet/blocks,
//    camiones=hudText+enemy, troncos=thrust, tortugas=accent

import { PALETTES, DEFAULT_SKIN, isSkinId } from '@/lib/games/skins';

const COLS = 16;
const ROWS = 14;
const CELL = 40;

const ROW_GOALS = 0;
const ROW_RIVER_TOP = 1;
const ROW_RIVER_BOT = 6;
const ROW_SAFE_MID = 7;
const ROW_ROAD_TOP = 8;
const ROW_ROAD_BOT = 12;
const ROW_START = 13;

const JUMP_MS = 120;
const BASE_ROUND_SECONDS = 15;
const MIN_ROUND_SECONDS = 8;
const TURTLE_CYCLE_S = 4.5; // 3 visible + 1.5 sumergida
const START_LIVES = 3;
const SCORE_STEP = 10; // por celda nueva hacia arriba
const SCORE_GOAL = 50;
const SCORE_ROUND = 200;
const TIME_BONUS_PER_S = 10;
const SPEED_LEVEL_FACTOR = 1.15;
const MAX_SPEED_LEVEL = 6; // techo: nivel 6+ ya no acelera entidades

// Bocas destino: cada una ocupa 2 columnas; las columnas restantes son muros.
const MOUTHS = [
  [1, 2],
  [4, 5],
  [7, 8],
  [10, 11],
  [13, 14],
];

// Lookup columna → índice de boca (-1 = muro). Precomputado: draw() lo
// consulta por columna cada frame.
const MOUTH_AT_COL = Array.from({ length: COLS }, (_, col) =>
  MOUTHS.findIndex((pair) => pair[0] === col || pair[1] === col)
);

function hexToRgba(hex, alpha) {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
}

// ── Module-scoped state ───────────────────────────────────────────────────────
let refs = null;
let canvas = null;
let ctx = null;

let lanes,
  goalsFilled,
  frog,
  score,
  lives,
  level,
  timeLeft,
  bestRow,
  paused,
  gameOver,
  lastTime,
  timerId,
  elapsed,
  lastTimeShown;

let onGameOverCallback = null;
let gameOverFired = false;
let palette = PALETTES[DEFAULT_SKIN];

// Colores derivados del skin (recalculados en initGame).
let colors = null;

function buildColors() {
  colors = {
    water: hexToRgba(palette.accent, 0.18),
    safe: hexToRgba(palette.player, 0.08),
    goalFill: hexToRgba(palette.accent, 0.35),
    bush: hexToRgba(palette.hudText, 0.12),
    frog: palette.player,
    eye: palette.hudText,
    pupil: palette.background,
    carA: palette.enemy,
    carB: palette.bullet,
    carC: palette.blocks[4] || palette.enemy,
    truckBody: palette.hudText,
    truckCab: palette.enemy,
    log: palette.thrust,
    turtle: palette.accent,
    turtleGhost: hexToRgba(palette.accent, 0.3),
    hud: palette.hudText,
  };
}

// ── Carriles ──────────────────────────────────────────────────────────────────
// speed en celdas/segundo a nivel 1; laneConfig escala por nivel.

function makeEntities(count, width) {
  const spacing = COLS / count;
  const entities = [];
  for (let i = 0; i < count; i++) {
    entities.push({ col: i * spacing, width });
  }
  return entities;
}

function laneConfig(level) {
  const f = Math.pow(SPEED_LEVEL_FACTOR, Math.min(level, MAX_SPEED_LEVEL) - 1);
  return [
    // Carretera (filas 8-12)
    { row: 8, dir: -1, speed: 2.2 * f, type: 'car', len: 1, count: 2 },
    { row: 9, dir: 1, speed: 3.6 * f, type: 'car', len: 1, count: 2 },
    { row: 10, dir: -1, speed: 2.0 * f, type: 'truck', len: 2, count: 2 },
    { row: 11, dir: 1, speed: 2.4 * f, type: 'car', len: 1, count: 3 },
    { row: 12, dir: -1, speed: 3.2 * f, type: 'truck', len: 3, count: 2 },
    // Río (filas 1-6), de arriba hacia abajo
    { row: 1, dir: 1, speed: 1.1 * f, type: 'log', len: 4, count: 2 },
    { row: 2, dir: -1, speed: 1.7 * f, type: 'turtle', len: 3, count: 2 },
    { row: 3, dir: -1, speed: 2.1 * f, type: 'log', len: 2, count: 3 },
    { row: 4, dir: 1, speed: 0.9 * f, type: 'log', len: 3, count: 2 },
    { row: 5, dir: 1, speed: 1.5 * f, type: 'turtle', len: 2, count: 3 },
    { row: 6, dir: -1, speed: 1.3 * f, type: 'log', len: 3, count: 2 },
  ].map((cfg) => ({
    ...cfg,
    phase: Math.random() * TURTLE_CYCLE_S,
    entities: makeEntities(cfg.count, cfg.len).map((e) => ({
      ...e,
      col: e.col + Math.random() * 1.5,
    })),
  }));
}

function isRiverRow(row) {
  return row >= ROW_RIVER_TOP && row <= ROW_RIVER_BOT;
}

function isRoadRow(row) {
  return row >= ROW_ROAD_TOP && row <= ROW_ROAD_BOT;
}

// ── Lógica de entidades ───────────────────────────────────────────────────────

function updateEntities(dt) {
  for (const lane of lanes) {
    for (const ent of lane.entities) {
      ent.col += lane.speed * lane.dir * dt;
      if (lane.dir > 0 && ent.col > COLS) ent.col = -ent.width;
      if (lane.dir < 0 && ent.col + ent.width < 0) ent.col = COLS;
    }
  }
}

// Tortuga sumergida: ciclo por grupo con desfase por tortuga dentro del grupo.
function turtleSubmerged(lane, index) {
  const t = (elapsed + lane.phase + index * 1.7) % TURTLE_CYCLE_S;
  return t >= TURTLE_CYCLE_S - 1.5;
}

// Soporte en el río para el centro de la rana; tortuga sumergida no sostiene.
function getSupport() {
  if (!isRiverRow(frog.row)) return null;
  const center = frog.colF + 0.5;
  const lane = lanes.find((l) => l.row === frog.row);
  if (!lane) return null;
  for (let i = 0; i < lane.entities.length; i++) {
    const ent = lane.entities[i];
    if (center < ent.col || center > ent.col + ent.width) continue;
    if (lane.type === 'turtle' && turtleSubmerged(lane, i)) return null;
    return { lane };
  }
  return null;
}

function roadCollision() {
  if (!isRoadRow(frog.row)) return false;
  const center = frog.colF + 0.5;
  const lane = lanes.find((l) => l.row === frog.row);
  if (!lane) return false;
  // Hitbox perdonadora: 0.2 celdas de margen a cada lado del vehículo.
  return lane.entities.some(
    (ent) => center > ent.col + 0.2 && center < ent.col + ent.width - 0.2
  );
}

// ── Rana ──────────────────────────────────────────────────────────────────────

function resetFrog() {
  frog = {
    colF: COLS / 2 - 1,
    row: ROW_START,
    jumping: false,
    jumpT: 0,
    fromCol: 0,
    fromRow: 0,
    toCol: 0,
    toRow: 0,
    pendingDir: null,
  };
}

function tryJump(dir) {
  let toCol = Math.round(frog.colF);
  let toRow = frog.row;
  if (dir === 'up') toRow -= 1;
  else if (dir === 'down') toRow += 1;
  else if (dir === 'left') toCol -= 1;
  else if (dir === 'right') toCol += 1;

  if (toRow > ROW_START || toRow < ROW_GOALS) return;
  if (toCol < 0 || toCol > COLS - 1) return;

  frog.jumping = true;
  frog.jumpT = 0;
  frog.fromCol = frog.colF;
  frog.fromRow = frog.row;
  frog.toCol = toCol;
  frog.toRow = toRow;
}

function landFrog() {
  frog.jumping = false;
  frog.colF = frog.toCol;
  frog.row = frog.toRow;

  if (frog.row === ROW_GOALS) {
    resolveGoal();
    return;
  }

  if (isRiverRow(frog.row) && !getSupport()) {
    killFrog();
    return;
  }

  if (frog.row < bestRow) {
    score += (bestRow - frog.row) * SCORE_STEP;
    bestRow = frog.row;
    updateHUD();
  }
}

function mouthIndexAt(col) {
  return MOUTH_AT_COL[col] ?? -1;
}

function resolveGoal() {
  const mouth = mouthIndexAt(frog.toCol);
  if (mouth === -1 || goalsFilled[mouth]) {
    killFrog();
    return;
  }
  goalsFilled[mouth] = true;
  score += SCORE_GOAL + Math.ceil(timeLeft) * TIME_BONUS_PER_S;
  updateHUD();

  if (goalsFilled.every(Boolean)) {
    completeRound();
  } else {
    resetFrog();
    timeLeft = roundSeconds();
    bestRow = ROW_START;
  }
}

function roundSeconds() {
  return Math.max(MIN_ROUND_SECONDS, BASE_ROUND_SECONDS + 1 - level);
}

function completeRound() {
  score += SCORE_ROUND;
  level += 1;
  lanes = laneConfig(level);
  goalsFilled = MOUTHS.map(() => false);
  resetFrog();
  timeLeft = roundSeconds();
  bestRow = ROW_START;
  updateHUD();
}

function killFrog() {
  lives -= 1;
  updateHUD();
  if (lives <= 0) {
    endGame();
    return;
  }
  resetFrog();
  timeLeft = roundSeconds();
  bestRow = ROW_START;
}

// ── Update / draw ─────────────────────────────────────────────────────────────

function update(dt) {
  elapsed += dt;
  updateEntities(dt);

  if (!frog.jumping) {
    if (frog.pendingDir) {
      const dir = frog.pendingDir;
      frog.pendingDir = null;
      tryJump(dir);
    } else if (isRiverRow(frog.row)) {
      const support = getSupport();
      if (!support) {
        killFrog();
        return;
      }
      frog.colF += support.lane.speed * support.lane.dir * dt;
      const center = frog.colF + 0.5;
      if (center < 0 || center > COLS) {
        killFrog();
        return;
      }
    }
    if (!frog.jumping && isRoadRow(frog.row) && roadCollision()) {
      killFrog();
      return;
    }
  } else {
    frog.jumpT += dt * 1000;
    if (frog.jumpT >= JUMP_MS) {
      landFrog();
      if (gameOver) return;
    }
  }

  timeLeft -= dt;
  if (timeLeft <= 0) {
    timeLeft = 0;
    killFrog();
    return;
  }
  updateTimeHUD();
}

function drawFrog(px, py) {
  const cx = px + CELL / 2;
  const cy = py + CELL / 2;
  ctx.fillStyle = colors.frog;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Patas extendidas durante el salto
  if (frog.jumping) {
    ctx.fillRect(cx - 16, cy - 10, 6, 4);
    ctx.fillRect(cx + 10, cy - 10, 6, 4);
    ctx.fillRect(cx - 16, cy + 6, 6, 4);
    ctx.fillRect(cx + 10, cy + 6, 6, 4);
  }
  // Ojos
  ctx.fillStyle = colors.eye;
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 9, 4, 0, Math.PI * 2);
  ctx.arc(cx + 5, cy - 9, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.pupil;
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 10, 2, 0, Math.PI * 2);
  ctx.arc(cx + 5, cy - 10, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawEntity(ent, lane, py) {
  const x = ent.col * CELL;
  const w = ent.width * CELL;
  if (lane.type === 'car') {
    let bodyColor = colors.carA;
    if (lane.row % 3 === 0) bodyColor = colors.carB;
    else if (lane.row % 2 !== 0) bodyColor = colors.carC;
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x + 3, py + 8, w - 6, CELL - 20);
    ctx.fillStyle = colors.pupil;
    ctx.beginPath();
    ctx.arc(x + w * 0.25, py + CELL - 10, 4, 0, Math.PI * 2);
    ctx.arc(x + w * 0.75, py + CELL - 10, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (lane.type === 'truck') {
    ctx.fillStyle = colors.truckBody;
    ctx.fillRect(x + 2, py + 6, w - 4, CELL - 16);
    const cabX = lane.dir > 0 ? x + w - 14 : x + 2;
    ctx.fillStyle = colors.truckCab;
    ctx.fillRect(cabX, py + 6, 12, CELL - 16);
  } else if (lane.type === 'log') {
    ctx.fillStyle = colors.log;
    ctx.fillRect(x + 2, py + 10, w - 4, CELL - 24);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < ent.width * 2; i++) {
      const lx = x + (i * w) / (ent.width * 2);
      ctx.beginPath();
      ctx.moveTo(lx, py + 12);
      ctx.lineTo(lx, py + CELL - 16);
      ctx.stroke();
    }
  } else if (lane.type === 'turtle') {
    for (let i = 0; i < ent.width; i++) {
      const tx = x + i * CELL + CELL / 2;
      const submerged = turtleSubmerged(lane, i);
      if (submerged) {
        ctx.strokeStyle = colors.turtleGhost;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tx, py + CELL / 2, 12, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = colors.turtle;
        ctx.beginPath();
        ctx.arc(tx, py + CELL / 2, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, py + CELL / 2 - 13);
        ctx.lineTo(tx, py + CELL / 2 + 13);
        ctx.moveTo(tx - 13, py + CELL / 2);
        ctx.lineTo(tx + 13, py + CELL / 2);
        ctx.stroke();
      }
    }
  }
}

function draw() {
  // Zonas
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bocas (fila 0)
  ctx.fillStyle = colors.safe;
  ctx.fillRect(0, 0, canvas.width, CELL);
  for (let c = 0; c < COLS; c++) {
    const mouth = mouthIndexAt(c);
    const gx = c * CELL;
    if (mouth === -1) {
      ctx.fillStyle = colors.bush;
      ctx.fillRect(gx + 1, 1, CELL - 2, CELL - 2);
      continue;
    }
    const filled = goalsFilled[mouth];
    ctx.fillStyle = filled ? colors.goalFill : colors.water;
    ctx.fillRect(gx + 2, 2, CELL - 4, CELL - 4);
    ctx.strokeStyle = colors.log;
    ctx.lineWidth = 2;
    ctx.strokeRect(gx + 2, 2, CELL - 4, CELL - 4);
    if (filled) {
      ctx.fillStyle = colors.frog;
      ctx.beginPath();
      ctx.ellipse(gx + CELL / 2, CELL / 2, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Río
  ctx.fillStyle = colors.water;
  ctx.fillRect(0, ROW_RIVER_TOP * CELL, canvas.width, 6 * CELL);
  // Meditación
  ctx.fillStyle = colors.safe;
  ctx.fillRect(0, ROW_SAFE_MID * CELL, canvas.width, CELL);
  // Inicio
  ctx.fillStyle = colors.safe;
  ctx.fillRect(0, ROW_START * CELL, canvas.width, CELL);

  // Entidades
  for (const lane of lanes) {
    const py = lane.row * CELL;
    for (const ent of lane.entities) {
      drawEntity(ent, lane, py);
    }
  }

  // Rana (posición interpolada durante el salto)
  let fx = frog.colF;
  let fy = frog.row;
  if (frog.jumping) {
    const t = Math.min(frog.jumpT / JUMP_MS, 1);
    fx = frog.fromCol + (frog.toCol - frog.fromCol) * t;
    fy = frog.fromRow + (frog.toRow - frog.fromRow) * t;
  }
  drawFrog(fx * CELL, fy * CELL);

  // Barra de tiempo (franja superior, encima de las bocas)
  const total = roundSeconds();
  const ratio = Math.max(timeLeft / total, 0);
  let barColor = colors.carA;
  if (ratio > 0.25) barColor = colors.log;
  if (ratio > 0.5) barColor = colors.carB;
  ctx.fillStyle = barColor;
  ctx.fillRect(0, 0, canvas.width * ratio, 4);

  // HUD interno
  ctx.fillStyle = colors.hud;
  ctx.textAlign = 'left';
  ctx.fillText(String(score).padStart(6, '0'), 8, 22);
  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, canvas.width / 2, 22);
  // Vidas como iconos de rana top-right
  for (let i = 0; i < lives; i++) {
    const hx = canvas.width - 16 - i * 22;
    ctx.fillStyle = colors.frog;
    ctx.beginPath();
    ctx.arc(hx, 17, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = 'left';
}

function updateHUD() {
  if (!refs) return;
  refs.scoreEl.textContent = score.toLocaleString('es-ES');
  refs.livesEl.textContent = String(Math.max(lives, 0));
  refs.levelEl.textContent = String(level);
}

function updateTimeHUD() {
  if (!refs) return;
  const shown = Math.ceil(timeLeft);
  if (shown === lastTimeShown) return;
  lastTimeShown = shown;
  refs.timeEl.textContent = `${shown}s`;
}

// ── Fin de partida / pausa ────────────────────────────────────────────────────

function endGame() {
  gameOver = true;
  clearTimeout(timerId);
  timerId = null;
  if (!gameOverFired) {
    gameOverFired = true;
    if (onGameOverCallback) onGameOverCallback(score);
  }
  if (!refs) return;
  refs.overlayTitle.textContent = 'GAME OVER';
  refs.overlayScore.textContent = `Puntuación: ${score.toLocaleString('es-ES')}`;
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
    timerId = null;
    refs.overlayTitle.textContent = 'PAUSA';
    refs.overlayScore.textContent = '';
    refs.overlay.classList.remove('hidden');
  }
}

// ── Loop ──────────────────────────────────────────────────────────────────────

function scheduleTick() {
  timerId = setTimeout(() => loop(performance.now()), 1000 / 60);
}

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min(ts - lastTime, 50) / 1000; // clamp 0.05s
  lastTime = ts;
  update(dt);
  if (gameOver) return;
  draw();
  scheduleTick();
}

// ── Input ─────────────────────────────────────────────────────────────────────

const MOVE_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
]);

function onKeyDown(e) {
  if (MOVE_KEYS.has(e.code) || e.code === 'KeyP' || e.code === 'Escape') {
    e.preventDefault();
  }
  if (e.code === 'KeyP' || e.code === 'Escape') {
    togglePause();
    return;
  }
  if (paused || gameOver) return;
  const dirMap = {
    ArrowUp: 'up',
    KeyW: 'up',
    ArrowDown: 'down',
    KeyS: 'down',
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
  };
  const dir = dirMap[e.code];
  if (dir) frog.pendingDir = dir;
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
  ctx.font = "16px 'JetBrains Mono', monospace";

  onGameOverCallback = options.onGameOver || null;
  gameOverFired = false;

  palette = PALETTES[isSkinId(options.skin) ? options.skin : DEFAULT_SKIN];
  buildColors();

  attachInput();

  level = 1;
  score = 0;
  lives = START_LIVES;
  lanes = laneConfig(level);
  goalsFilled = MOUTHS.map(() => false);
  resetFrog();
  timeLeft = roundSeconds();
  bestRow = ROW_START;
  elapsed = 0;
  paused = false;
  gameOver = false;
  lastTime = performance.now();
  lastTimeShown = null;

  updateHUD();
  updateTimeHUD();
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
  refs = null;
  lanes = null;
  frog = null;
  onGameOverCallback = null;
}

export function setOnGameOver(callback) {
  onGameOverCallback = callback;
}
