---
state: Approved
date: 2026-07-13
dependencies: Ninguna
---

# MVP — Arcade Vault

**Objetivo:** Convertir el prototipo visual de Arcade Vault en `resources/templates/` en una aplicación Next.js 16 funcional con todas las pantallas, navegación real vía App Router, datos mock tipados, filtros y búsqueda funcionales, simulación básica de partida, y persistencia en localStorage — sin implementar los juegos reales.

---

## Scope

### Incluye

1. **Navbar** — Logo, enlaces navegables (Biblioteca, Salón), contador de créditos, botón de auth (Iniciar Sesión / nombre de usuario con sign out), menú hamburguesa responsive con panel lateral.
2. **Footer** — Texto estático con branding y versión.
3. **Biblioteca (`/`)** — Hero con título animado, buscador funcional (filtra por nombre), chips de categoría funcionales (TODOS, ARCADE, PUZZLE, SHOOTER, VERSUS), grid de tarjetas con efecto tilt y cover art CSS, enlace a detalle.
4. **Detalle (`/detalle/[id]`)** — Cover grande, tags, descripción, stats (partidas, mejor global, dificultad), botón "JUGAR AHORA" con efecto pulse, leaderboard lateral con datos mock, enlace volver.
5. **Player (`/player/[id]`)** — HUD con nombre, puntuación, vidas, nivel; monitor CRT con arena decorativa animada; botones pausa/fin/salir; modal de fin con input de iniciales y guardado a localStorage; simulación básica de puntuación incremental.
6. **Auth (`/auth`)** — Tarjeta con tabs (Iniciar Sesión / Crear Cuenta), formularios con inputs, botón "Entrar al Vault" / "Crear y Jugar", botón "Jugar como Invitado", divisores sociales (solo UI), registro de usuario en localStorage.
7. **Salón de la Fama (`/salon`)** — Podium (oro/plata/bronce), tabs por juego, tabla de puntuaciones con animación, fila de "tu mejor marca" si hay usuario logueado.
8. **Datos mock** — Archivo TypeScript estático con los 8 juegos, categorías, lista de jugadores, y función `seededScores`.
9. **Persistencia** — Usuario y puntuaciones en localStorage.
10. **Tema retro** — Fondo con grid perspectiva + scanlines + noise SVG, tipografía pixel/mono, colores neón.

### No incluye

- Implementación real de los juegos (la lógica de juego, físicas, colisiones, etc.)
- Autenticación real contra backend (el login es mock, guarda el nombre en localStorage)
- Multiplayer o conexión en tiempo real
- Backend o API server
- Tests (se añadirán en spec posterior)
- Paginación en la biblioteca (todos los juegos caben en una página)
- Sidebar o layout distinto al del prototipo

---

## Data model

```typescript
// === Tipos compartidos ===

interface Game {
  id: string
  title: string
  short: string
  long: string
  cat: 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS'
  cover: string
  color: 'cyan' | 'magenta' | 'yellow' | 'green'
  best: number
  plays: string
}

interface ScoreEntry {
  game: string
  score: number
  name: string
  at: number
}

interface User {
  name: string
}
```

**Archivos en `app/data/`:**

- `types.ts` — Interfaces `Game`, `ScoreEntry`, `User`.
- `games.ts` — `GAMES: Game[]` (8 juegos), `CATS` (categorías).
- `players.ts` — `PLAYERS: string[]`, función `seededScores()`.
- `storage.ts` — Helpers de persistencia: `getUser()`, `setUser(u)`, `getScores()`, `saveScore(entry)`, `clearUser()`.

**Persistencia (localStorage):**

- Clave `av_user` → `JSON.stringify(User | null)`
- Clave `av_scores` → `JSON.stringify(ScoreEntry[])`

---

## Implementation plan

1. **Configurar tema global** — Reemplazar `app/globals.css` con el sistema de diseño completo (variables CSS, tipografías, fondos, componentes). Migrar el CSS del prototipo adaptándolo a Tailwind v4 con `@theme inline`.
2. **Crear layout base (`app/layout.tsx`)** — Establecer las fuentes (Press Start 2P, JetBrains Mono), el fondo con grid + scanlines + noise, el Nav y Footer globales, y las rutas hijas.
3. **Crear `app/data/`** — Archivos `types.ts`, `games.ts`, `players.ts`, `storage.ts` con datos mock y helpers de localStorage.
4. **Implementar Nav (`components/nav.tsx`)** — Navbar sticky con logo, enlaces, contador de créditos, botón auth, hamburger menu responsive.
5. **Implementar Biblioteca (`app/page.tsx`)** — Hero, buscador, chips de categoría, grid de `GameCard` con tilt effect. Usa `"use client"` para interactividad.
6. **Implementar Detalle (`app/detalle/[id]/page.tsx`)** — Cover, tags, descripción, stats, leaderboard lateral. Server Component con interfaz de datos estáticos; botones cliente.
7. **Implementar Player (`app/player/[id]/page.tsx`)** — HUD, monitor CRT, arena decorativa, controles (pausa/fin/salir), modal game over, simulación de puntuación. Cliente puro.
8. **Implementar Auth (`app/auth/page.tsx`)** — Formulario con tabs, validación básica, guardado en localStorage, navegación post-login. Cliente.
9. **Implementar Salón de la Fama (`app/salon/page.tsx`)** — Podium, tabs por juego, tabla con `seededScores`, fila de usuario logueado. Cliente.
10. **Ajustar layout y responsive** — Revisar media queries, padding, espaciado en todas las pantallas.
11. **Verificación final** — `npm run build` sin errores, todas las rutas funcionan, interacciones básicas operativas.

---

## Acceptance criteria

- [x] `npm run build` produce build exitoso sin errores ni warnings
- [x] Pantalla de Biblioteca (`/`) carga con hero, buscador, chips y grid de 8 juegos
- [x] Buscador filtra juegos por nombre en tiempo real
- [x] Chips de categoría filtran juegos; "TODOS" muestra todos
- [x] Cada tarjeta de juego tiene efecto tilt al hacer hover
- [x] Click en tarjeta navega a `/detalle/[id]`
- [x] Pantalla Detalle muestra cover, tags, descripción, stats y leaderboard
- [x] Botón "JUGAR AHORA" navega a `/player/[id]`
- [x] Pantalla Player muestra HUD (nombre, puntuación, vidas, nivel)
- [x] Monitor CRT se renderiza con arena decorativa animada
- [x] Botón Pausa muestra/oculta overlay "EN PAUSA"
- [x] Botón Fin muestra modal "FIN DEL JUEGO" con input de iniciales y botón guardar
- [x] Guardar puntuación persiste en localStorage y muestra toast "PUNTUACIÓN GUARDADA"
- [x] Pantalla Auth tiene tabs "INICIAR SESIÓN" / "CREAR CUENTA"
- [x] Auth: submit guarda usuario en localStorage y redirige a Biblioteca
- [x] Auth: "JUGAR COMO INVITADO" funciona sin datos
- [x] Nav muestra nombre de usuario cuando logueado, botón "Iniciar Sesión" cuando no
- [x] Nav: sign out limpia usuario de localStorage
- [x] Nav es responsive: menú hamburguesa en mobile, enlaces en desktop
- [x] Salón de la Fama (`/salon`) muestra podium, tabs por juego y tabla de puntuaciones
- [x] Cambiar tab en Salón actualiza puntuaciones simuladas
- [x] Si hay usuario logueado, aparece fila "TU MEJOR MARCA" en Salón
- [x] Footer se renderiza en todas las páginas
- [x] Fondo con grid, scanlines y noise visible en toda la app
- [x] Todas las páginas son responsive (mobile y desktop)

---

## Decisions taken and discarded

| Decisión            | Elegida                                                       | Descartada                             | Justificación                                                                |
| ------------------- | ------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| Routing             | Next.js App Router (`/detalle/[id]`, etc.)                    | Hash-based SPA                         | Aprovecha Server Components, URLs semánticas, mejor DX                       |
| Estilos             | Tailwind CSS v4 con `@theme inline` + CSS clásico donde toque | Solo CSS plano o solo Tailwind         | Tailwind da consistencia; el CSS de efectos visuales se mantiene legible     |
| Estado de auth      | localStorage                                                  | Sin persistencia / Context sin storage | Coincide con el prototipo; simple para MVP                                   |
| Simulación de juego | `setInterval` con incremento de score                         | Sin simulación                         | El prototipo ya lo incluye; da sensación de funcionalidad                    |
| Datos mock          | Archivos TypeScript estáticos en `app/data/`                  | JSON externo / inline en componentes   | Tipado estricto, fácil de reemplazar por DB después                          |
| Componentes         | Funciones con `"use client"` donde haya interactividad        | Clases / bibliotecas de estado         | Sigue la arquitectura de Next.js App Router                                  |
| CSS de covers       | Mantener CSS puro del prototipo                               | Imágenes SVG/PNG                       | El prototipo ya tiene cover art en CSS; traslado fiel sin assets adicionales |

---

## Identified risks

- **Next.js 16 breaking changes:** Según `CLAUDE.md`, "Next.js 16 tiene cambios de ruptura". Verificar cada API contra la documentación real de Next.js 16.
- **Tailwind CSS v4:** Usa configuración vía CSS (`@import "tailwindcss"` y `@theme inline`) en lugar de `tailwind.config.js`. No existe archivo de configuración tradicional.
- **Efecto tilt en tarjetas:** El prototipo usa `onMouseMove` para transformar la tarjeta. Confirmar que no genera problemas de rendimiento en mobile.
- **Simulación de puntuación en Player:** El `setInterval` del prototipo corre aunque no haya juego real. Es intencional para el MVP, pero verificar que se limpia correctamente al desmontar.
