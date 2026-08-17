## Problema

En CAÍDA (Tetris), el selector de skin no está alineado con la columna que muestra la siguiente pieza a caer. El `<SkinSelect>` se renderiza como una barra alineada a la derecha (`justify-content: flex-end`) en la parte superior del layout completo del juego, mientras que el área de juego (tablero + panel lateral con HUD / SIGUIENTE / leaderboard) está **centrada** como grupo. En pantallas anchas el selector flota en el borde derecho del layout, lejos del borde derecho del panel: selector y columna de la pieza siguiente no comparten columna.

El mismo patrón (barra a la derecha sobre un área de juego centrada) existe en los otros tres juegos:

- **SERPENTINA**: misma estructura tablero + panel; el selector flota a la derecha del panel.
- **ASTEROIDS / BLOQUE BUSTER**: layout en grid (columna de canvas + sidebar de 220px). El selector está alineado a la derecha del ancho completo de la columna del wrapper, mientras el canvas se centra con `max-width: 800px`; el selector flota a la derecha del canvas.

## Solución

Hacer que el selector de skin comparta columna con el elemento visual al que debe alinearse:

- **CAÍDA y SERPENTINA**: mover el `<SkinSelect>` dentro del panel lateral como primer hijo — una barra a ancho completo encima del HUD. La alineación pasa a ser intrínseca: el selector ocupa exactamente la columna del panel (la de la pieza siguiente en CAÍDA).
- **ASTEROIDS y BLOQUE BUSTER**: restringir el shell del juego (`{prefix}-game-shell`) a la misma caja centrada que el canvas (`width: 100%; max-width: 800px; margin: 0 auto;`), de modo que el borde derecho de la barra de skin coincida con el borde derecho del canvas (y los controles táctiles queden centrados con el canvas).

## Commits

Plan en commits pequeños; cada commit deja el código funcionando (lint + build + E2E en verde). El orden por juego es: primero el cambio de layout, después su test de alineación (el test antes del layout fallaría).

1. **CAÍDA — layout**: mover el selector dentro del panel (componente) y convertir la barra en barra de ancho completo de la columna del panel (CSS).
2. **CAÍDA — test**: test E2E de alineación (borde derecho del selector ≈ borde derecho del panel).
3. **SERPENTINA — layout**: mover el selector dentro del panel y convertir la barra en ancho completo (componente + CSS).
4. **SERPENTINA — test**: test E2E de alineación (selector ≈ panel).
5. **ASTEROIDS — layout**: restringir el shell a la caja centrada del canvas (CSS).
6. **ASTEROIDS — test**: test E2E de alineación (selector ≈ canvas).
7. **BLOQUE BUSTER — layout**: restringir el shell a la caja centrada del canvas (CSS).
8. **BLOQUE BUSTER — test**: test E2E de alineación (selector ≈ canvas).

## Documento de decisiones

- **Módulos a modificar**: componentes React y CSS de cada juego (`{slug}Game.tsx` + `{slug}.css`) y los specs E2E. **No** se toca el componente reutilizable `SkinSelect.tsx` ni `lib/games/skins.ts`: la API y la convención `classPrefix` quedan intactas.
- **CAÍDA/SERPENTINA**: `{prefix}-skin-bar` pierde `justify-content: flex-end` y pasa a ser la barra que llena la columna del panel; `{prefix}-skin-select` gana `flex: 1` con `justify-content: space-between` (etiqueta SKIN a la izquierda, `<select>` a la derecha).
- **ASTEROIDS/BLOQUE BUSTER**: `{prefix}-game-shell` gana `max-width: 800px; margin: 0 auto` (misma caja que `{prefix}-game-container`); `{prefix}-skin-bar` conserva `justify-content: flex-end`.
- **Decisiones de arquitectura**: alineación por contenedor (el selector hereda la columna del elemento que lo contiene), no por cálculos de posición manuales.
- **Sin cambios de esquema** ni contratos de API; cambio puramente presentacional.
- **Interacciones específicas**: en móvil (≤640px) CAÍDA/SERPENTINA apilan el panel bajo el tablero, así que el selector aparece bajo el tablero, sobre el HUD; en ASTEROIDS/BLOQUE BUSTER el centrado del shell no altera el reflow móvil.

## Decisiones de testing

- **Qué hace un buen test**: verificar comportamiento externo visible (la posición en pantalla del selector respecto a la columna objetivo), no detalles de implementación (ni reglas CSS ni anidamiento del DOM).
- **Módulos a testear**: un test E2E nuevo por juego en los specs existentes. Con viewport de escritorio, compara vía `boundingBox()` el borde derecho de la barra de skin con el borde derecho del panel (CAÍDA/SERPENTINA) o del canvas (ASTEROIDS/BLOQUE BUSTER), con tolerancia ±2px.
- **Prior art**: los specs E2E ya usan `boundingBox()` (p. ej. «responsive canvas scales correctly» en `caida.spec.ts`) y el patrón `beforeEach` con `?e2e=1` + espera del canvas; los tests nuevos reutilizan ese patrón.
- **Regresión**: correr la suite E2E completa (6 specs) tras cada commit.

## Fuera de alcance

- Cambiar el componente `SkinSelect` o el sistema de skins (provider, paletas, persistencia, ids).
- Añadir skins nuevos ni cambiar la estética de la barra (colores, tipografías) más allá de la alineación.
- Tocar motores de juego, jugabilidad, puntuación, leaderboards o auth.
- Actualizar CLAUDE.md / knowledge graph: no documentan la posición del selector dentro del layout (solo que se renderiza «inside each game's layout», que sigue siendo cierto tras el cambio).

## Notas adicionales

- Ningún test actual referencia el selector de skin (verificado en los 6 specs), así que el refactor es seguro para la suite existente.
- Cambio solo de capa visual; los tests funcionales E2E existentes deben seguir en verde tras cada commit.
