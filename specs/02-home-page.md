---
state: Implemented
date: 2026-07-14
implemented: 2026-07-16
dependencies:
  - 01-mvp-arcade-vault
objective: Implementar la página de inicio (Home) como landing page de Arcade Vault,
  reemplazando la ruta `/` y moviendo la Biblioteca a `/games`.
---

## Scope

### Incluye

- Home page como landing page en la ruta `/` con 7 secciones:
  1. **Hero** — siluetas flotantes, título, subtítulo, CTAs (Explorar juegos, Crear cuenta), indicador scroll
  2. **Why** — "// 01", 4 tarjetas de características con iconos SVG pixel (Gamepad, Free, Trophy, Rocket)
  3. **Games Preview** — "// 02", carrusel mini de 6 tarjetas con portadas, enlace "VER TODOS LOS JUEGOS →"
  4. **Stats** — 3 bloques: 12+ JUEGOS, MILES DE PARTIDAS, GLOBAL RANKING
  5. **Activity** — "// 03", grid de 2 columnas: ticker de puntuaciones recientes + top 5 jugadores del día
  6. **Pricing** — "// 04", tarjeta del plan FREE con sello, FAQ de 3 items
  7. **Final CTA** — "¿LISTO PARA JUGAR?", botón "INSERTAR MONEDA →"
- Componente `useReveal` para animaciones vía IntersectionObserver
- SVG decorativos inline (`FloatingSilhouettes`, `FeatureIcon`)
- Home como Client Component (`"use client"`)
- Datos mock estáticos para actividad, stats y juegos
- Estilos integrados en `app/globals.css`

### No incluye

- Página Acerca de (fuera de scope)
- Backend real, API o persistencia remota
- Datos dinámicos desde localStorage (reservado para futura iteración)
- Página de detalle de juego, reproductor, auth, salón — ya existen o son specs separadas

## Data model

No se introducen nuevas estructuras de datos. La Home page consume:

- **`Game[]`** — tipo existente en `app/data/games.ts`, usado en la sección Games Preview (6 tarjetas)
- **Datos mock inline** — activity (partidas recientes, top jugadores) y stats son arrays estáticos
  definidos directamente en el componente Home, sin tipos adicionales por ahora

## Implementation plan

1. **Crear ruta `/games`**
   - Crear `app/games/` directorio
   - Mover `app/page.tsx` → `app/games/page.tsx` (sin cambios de contenido)
   - Deja `app/page.tsx` libre para el Home

2. **Actualizar Nav (`components/nav.tsx`)**
   - Añadir "INICIO" → `/`
   - Cambiar "BIBLIOTECA" → `/games`
   - `isActive("/")` solo activo en `/` exacto
   - `isActive("/games")` hereda el match de `/detalle/*` y `/player/*`
   - Reflejar cambios en menú móvil

3. **Agregar estilos Home a `app/globals.css`**
   - Integrar reglas CSS del template home-about (hero, why, games-preview, stats, activity, pricing, final)

4. **Implementar Home page (`app/page.tsx`)**
   - Client Component (`"use client"`)
   - Componentes internos (mismo archivo):
     `useReveal`, `FloatingSilhouettes`, `FeatureIcon`, `MiniCard`
   - 7 secciones: Hero, Why, Games Preview, Stats, Activity, Pricing, Final CTA
   - Navegación con `Link` y `useRouter` de Next.js

5. **Build y verificación**
   - `npm run build` sin errores
   - `/` → Home, `/games` → Biblioteca
   - Navegación correcta entre rutas

## Acceptance criteria

[ ] Ruta `/` muestra la página de inicio (Home) con 7 secciones visibles
[ ] Ruta `/games` muestra la Biblioteca de juegos (antes en `/`)
[ ] Nav incluye enlace "INICIO" → `/` y "BIBLIOTECA" → `/games`
[ ] Navegación móvil muestra y oculta panel correctamente
[ ] Siluetas flotantes SVG se renderizan en sección Hero
[ ] Botones "EXPLORAR JUEGOS" y "CREAR CUENTA" enlazan a `/games` y `/auth`
[ ] Sección Why muestra 4 tarjetas con iconos SVG pixel (GAMEPAD, FREE, TROPHY, ROCKET)
[ ] Games Preview muestra 6 MiniCards con portadas y enlace "VER TODOS LOS JUEGOS →"
[ ] Stats section muestra 3 bloques: "12+ JUEGOS", "MILES DE PARTIDAS", "GLOBAL RANKING"
[ ] Activity section muestra grid 2-col: ticker de puntuaciones y top 5 jugadores
[ ] Pricing section muestra tarjeta FREE con sello y FAQ de 3 ítems
[ ] Final CTA muestra "¿LISTO PARA JUGAR?" y botón "INSERTAR MONEDA →" → `/games`
[ ] useReveal anima sección al entrar en viewport (IntersectionObserver)
[ ] Estilos del Home integrados en `app/globals.css` sin conflictos
[ ] `npm run build` completa sin errores
[ ] Responsive: layout se adapta en móviles (columnas se apilan)
[ ] Consola libre de errores y warnings en desarrollo

## Decisions taken and discarded

| Decisión                                           | Justificación                                                                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Home como Client Component**                     | Necesita `useState`, `useEffect`, `useRef`, `useRouter`, IntersectionObserver, y eventos de mouse (tilt hover). Server Component no permite hooks ni browser APIs. |
| **Ruta `/` para Home, `/games` para Biblioteca**   | Semántica de landing page. `/games` deja la puerta abierta a futuras rutas como `/games/[id]` sin colisión.                                                        |
| **Datos mock inline en Home**                      | Coherente con MVP actual (juegos en `app/data/games.ts`, auth/storage en localStorage). Sin backend, no hay fuente real para actividad/stats.                      |
| **Estilos en `globals.css` único**                 | Tailwind v4 configura tema via `@theme inline` en CSS. Fragmentar en módulos añade complejidad sin beneficio aquí.                                                 |
| **Componentes decorativos inline**                 | `FloatingSilhouettes`, `FeatureIcon`, `MiniCard`, `useReveal` son específicos de Home y no se reutilizan. Menos archivos, menos coupling.                          |
| **Nav actualizado in-place**                       | El Nav vive en `components/nav.tsx` y se usa en layout global. Modificar uno solo es más mantenible que duplicar.                                                  |
| **Descartado: página `/about`**                    | Fuera de scope según sección Scope. Se puede añadir en spec futura.                                                                                                |
| **Descartado: datos dinámicos desde localStorage** | MVP usa mock estático. Conexión real queda para iteración posterior cuando haya API o persistencia server-side.                                                    |

## Identified risks

| Riesgo                                                                  | Impacto | Mitigación                                                                                                                                                                                                         |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Next.js 16 breaking changes**                                         | Alto    | Verificar docs en `node_modules/next/dist/docs/`. Testear `npm run dev` y revisar warnings de deprecation tras cada cambio.                                                                                        |
| **Tailwind CSS v4 con `@theme inline`**                                 | Medio   | Confirmar que todas las clases custom (`.av-grid`, `.pixel`, `.neon-cyan`, etc.) existan en globals.css antes de usarlas. Ejecutar `npm run build` para catchar clases faltantes.                                  |
| **Rendimiento del efecto tilt (`mousemove` + transform)**               | Medio   | El `GameCard` usa `requestAnimationFrame` implícito via style mutación. Si FPS baja en móvil, añadir `throttle` (ej. `lodash.throttle` o `requestAnimationFrame` manual) o desactivar en `prefers-reduced-motion`. |
| **Memory leaks en `useReveal` (IntersectionObserver)**                  | Alto    | Cleanup obligatorio en `useEffect` return: `observer.disconnect()`. Verificar en React DevTools que no queden observers huérfanos al navegar entre rutas.                                                          |
| **Duplicación/conflictos CSS al integrar `styles.css` → `globals.css`** | Medio   | Revisar selectors duplicados (`.card`, `.btn`, `.chip`, `.pixel`). Usar prefijos `.av-` o namespacing para secciones Home. Ejecutar build y comparar visual.                                                       |
| **Breakpoints responsive del grid 6-cols → 1-col**                      | Bajo    | Probar `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6` en devtools (320, 375, 768, 1024, 1440). Ajustar si cartas se ven muy pequeñas en tablet.                                                        |
| **TypeScript errors por `use client` + imports server-only**            | Bajo    | `components/nav.tsx` importa `getUser`/`clearUser` (client-safe). Home usará `GAMES` de `app/data/games.ts` (export const, sin side effects server). Verificar `npm run build`.                                    |
| **Acceso a `localStorage` en SSR**                                      | Medio   | Nav usa `getUser()` en `useEffect` (client-only). Home no accede a storage directamente. Mantener pattern.                                                                                                         |