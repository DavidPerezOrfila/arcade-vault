# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: about.spec.ts >> /about >> navigates from nav link
- Location: e2e\about.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - link "ARCADE VAULT" [ref=e4] [cursor=pointer]:
      - /url: /
      - generic [ref=e6]: ARCADE VAULT
    - generic [ref=e7]:
      - link "INICIO" [ref=e8] [cursor=pointer]:
        - /url: /
      - link "BIBLIOTECA" [ref=e9] [cursor=pointer]:
        - /url: /games
      - link "SALÓN" [ref=e10] [cursor=pointer]:
        - /url: /salon
      - link "ACERCA DE" [ref=e11] [cursor=pointer]:
        - /url: /about
    - generic [ref=e14]: CRÉDITOS · 03
    - link "Iniciar Sesión" [ref=e15] [cursor=pointer]:
      - /url: /auth
  - complementary [ref=e16]:
    - generic [ref=e17]: MENÚ
    - link "Inicio" [ref=e18] [cursor=pointer]:
      - /url: /
    - link "Biblioteca" [ref=e19] [cursor=pointer]:
      - /url: /games
    - link "Salón de la Fama" [ref=e20] [cursor=pointer]:
      - /url: /salon
    - link "Acerca de" [ref=e21] [cursor=pointer]:
      - /url: /about
    - link "Iniciar Sesión" [ref=e22] [cursor=pointer]:
      - /url: /auth
    - generic [ref=e24]: CRÉDITOS · 03
  - generic [ref=e25]:
    - generic [ref=e26]:
      - generic:
        - img
        - img
        - img
        - img
        - img
        - img
        - img
        - img
      - generic [ref=e27]:
        - generic [ref=e28]: ▸ INSERTA UNA MONEDA_
        - heading "EL ARCADE CLÁSICO ESTÁ DE VUELTA" [level=1] [ref=e29]:
          - generic [ref=e30]: EL ARCADE
          - generic [ref=e31]: CLÁSICO ESTÁ
          - generic [ref=e32]: DE VUELTA
        - paragraph [ref=e33]:
          - text: Juega los mejores clásicos directamente en tu navegador.
          - text: Sin descargas. Sin costo. Solo diversión.
        - generic [ref=e34]:
          - link "▶ EXPLORAR JUEGOS" [ref=e35] [cursor=pointer]:
            - /url: /games
          - link "✦ CREAR CUENTA" [ref=e36] [cursor=pointer]:
            - /url: /auth
        - generic [ref=e37]:
          - generic [ref=e38]: DESLIZA
          - generic [ref=e39]: ▼
    - generic [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e42]: // 01
        - heading "¿POR QUÉ ARCADE VAULT" [level=2] [ref=e43]
      - generic [ref=e45]:
        - generic [ref=e46]:
          - img [ref=e47]
          - generic [ref=e56]: JUEGOS CLÁSICOS
          - generic [ref=e57]: Arkanoid, Tetris, Snake y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.
        - generic [ref=e58]:
          - img [ref=e59]
          - generic [ref=e66]: 100% GRATIS
          - generic [ref=e67]: Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.
        - generic [ref=e68]:
          - img [ref=e69]
          - generic [ref=e79]: LADDER BOARDS
          - generic [ref=e80]: Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.
        - generic [ref=e81]:
          - img [ref=e82]
          - generic [ref=e92]: SIEMPRE CRECIENDO
          - generic [ref=e93]: Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.
    - generic [ref=e94]:
      - generic [ref=e95]:
        - generic [ref=e96]: // 02
        - heading "JUEGOS DISPONIBLES AHORA" [level=2] [ref=e97]
      - generic [ref=e99]:
        - link "BLOQUE BUSTER ARCADE" [ref=e100] [cursor=pointer]:
          - /url: /detalle/bloque-buster
          - generic [ref=e103]:
            - generic [ref=e104]: BLOQUE BUSTER
            - generic [ref=e105]: ARCADE
        - link "CAÍDA PUZZLE" [ref=e106] [cursor=pointer]:
          - /url: /detalle/caida
          - generic [ref=e109]:
            - generic [ref=e110]: CAÍDA
            - generic [ref=e111]: PUZZLE
        - link "SERPENTINA ARCADE" [ref=e112] [cursor=pointer]:
          - /url: /detalle/serpentina
          - generic [ref=e115]:
            - generic [ref=e116]: SERPENTINA
            - generic [ref=e117]: ARCADE
        - link "••• GLOTÓN ARCADE" [ref=e118] [cursor=pointer]:
          - /url: /detalle/gloton
          - generic [ref=e120]: •••
          - generic [ref=e121]:
            - generic [ref=e122]: GLOTÓN
            - generic [ref=e123]: ARCADE
        - link "INVASORES SHOOTER" [ref=e124] [cursor=pointer]:
          - /url: /detalle/invasores
          - generic [ref=e127]:
            - generic [ref=e128]: INVASORES
            - generic [ref=e129]: SHOOTER
        - link "▲ ROCAS SHOOTER" [ref=e130] [cursor=pointer]:
          - /url: /detalle/rocas
          - generic [ref=e132]: ▲
          - generic [ref=e133]:
            - generic [ref=e134]: ROCAS
            - generic [ref=e135]: SHOOTER
      - link "VER TODOS LOS JUEGOS →" [ref=e137] [cursor=pointer]:
        - /url: /games
    - generic [ref=e139]:
      - generic [ref=e140]:
        - generic [ref=e141]: 12+
        - generic [ref=e142]: JUEGOS
        - generic [ref=e143]: Y CONTANDO
      - generic [ref=e144]:
        - generic [ref=e145]: MILES
        - generic [ref=e146]: DE PARTIDAS
        - generic [ref=e147]: JUGADAS CADA DÍA
      - generic [ref=e148]:
        - generic [ref=e149]: GLOBAL
        - generic [ref=e150]: RANKING
        - generic [ref=e151]: COMPITE CON EL MUNDO
    - generic [ref=e152]:
      - generic [ref=e153]:
        - generic [ref=e154]: // 03
        - heading "ACTIVIDAD EN VIVO" [level=2] [ref=e155]
      - generic [ref=e157]:
        - generic [ref=e158]:
          - generic [ref=e160]: ▸ ÚLTIMAS PUNTUACIONES
          - generic [ref=e161]: ▸ AÚN NO HAY ACTIVIDAD RECIENTE
        - generic [ref=e162]:
          - generic [ref=e163]:
            - generic [ref=e164]: ▸ TOP JUGADORES · HOY
            - link "VER SALÓN →" [ref=e165] [cursor=pointer]:
              - /url: /salon
          - generic [ref=e166]:
            - generic [ref=e167]:
              - generic [ref=e168]: "#01"
              - text: ARKADYA283.707
            - generic [ref=e169]:
              - generic [ref=e170]: "#02"
              - text: CYBER_LU188.860
            - generic [ref=e171]:
              - generic [ref=e172]: "#03"
              - text: VAULT_0785.813
            - generic [ref=e173]:
              - generic [ref=e174]: "#04"
              - text: ATARI_KID79.380
            - generic [ref=e175]:
              - generic [ref=e176]: "#05"
              - text: PIXEL_DAD44.470
    - generic [ref=e177]:
      - generic [ref=e178]:
        - generic [ref=e179]: // 04
        - heading "PRECIOS" [level=2] [ref=e180]
      - generic [ref=e182]:
        - generic [ref=e183]:
          - generic [ref=e184]: PLAN ÚNICO
          - generic [ref=e185]: JUGADOR VAULT
          - generic [ref=e186]: $0/ SIEMPRE
          - generic [ref=e187]: SIN TRUCOS · SIN LETRA PEQUEÑA
          - list [ref=e188]:
            - listitem [ref=e189]: ✔ Acceso a todos los juegos
            - listitem [ref=e190]: ✔ Ranking global y salón de la fama
            - listitem [ref=e191]: ✔ Sin anuncios entre partidas
            - listitem [ref=e192]: ✔ Guarda tus puntuaciones
            - listitem [ref=e193]: ✔ Nuevos juegos cada mes
            - listitem [ref=e194]: ✔ Funciona en cualquier navegador
          - link "EMPEZAR GRATIS →" [ref=e195] [cursor=pointer]:
            - /url: /auth
          - generic [ref=e196]: No pedimos tarjeta. Nunca lo haremos
          - generic [ref=e197]:
            - text: FREE
            - text: PLAY
        - generic [ref=e198]:
          - generic [ref=e199]:
            - generic [ref=e200]: ¿REALMENTE ES GRATIS
            - generic [ref=e201]: Sí. Arcade Vault es un proyecto sin fines de lucro hecho por amor a los clásicos. No hay versión premium escondida.
          - generic [ref=e202]:
            - generic [ref=e203]: ¿NECESITO CREAR CUENTA
            - generic [ref=e204]: No. Puedes jugar como invitado. Si quieres guardar tu puntuación y aparecer en el ranking, regístrate en 10 segundos.
          - generic [ref=e205]:
            - generic [ref=e206]: ¿CÓMO SOBREVIVEN SIN COBRAR
            - generic [ref=e207]: Es un proyecto comunitario. Si te gusta, compártelo. Esa es toda la moneda que aceptamos.
    - generic [ref=e208]:
      - heading "¿LISTO PARA JUGAR" [level=2] [ref=e209]
      - link "INSERTAR MONEDA →" [ref=e210] [cursor=pointer]:
        - /url: /games
      - generic [ref=e211]: Gratis. Sin registro obligatorio. Empieza en segundos.
  - contentinfo [ref=e212]: © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('/about', () => {
  4  |   test('renders hero, highlights and contact form', async({ page }) => {
  5  |     await page.goto('/about');
  6  | 
  7  |     await expect(page.locator('h1')).toHaveText('ACERCA DE ARCADE VAULT');
  8  |     await expect(page.locator('.about-mission')).toBeVisible();
  9  |     await expect(page.locator('.highlight')).toHaveCount(3);
  10 |     await expect(page.locator('form.contact-form')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('navigates from nav link', async({ page }) => {
> 14 |     await page.goto('/');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  15 |     await page.locator('nav .links a[href="/about"]').click();
  16 |     await expect(page).toHaveURL('/about');
  17 |     await expect(page.locator('h1')).toHaveText('ACERCA DE ARCADE VAULT');
  18 |   });
  19 | 
  20 |   test('validates required fields before sending', async({ page }) => {
  21 |     await page.goto('/about');
  22 | 
  23 |     const nameInput = page.locator('input#name');
  24 |     const emailInput = page.locator('input#email');
  25 |     const messageInput = page.locator('textarea#message');
  26 | 
  27 |     await page.locator('form.contact-form button[type="submit"]').click();
  28 | 
  29 |     await expect(nameInput).toHaveAttribute('required', '');
  30 |     await expect(emailInput).toHaveAttribute('required', '');
  31 |     await expect(messageInput).toHaveAttribute('required', '');
  32 |   });
  33 | 
  34 |   test('submits the form and shows terminal success', async({ page }) => {
  35 |     await page.goto('/about');
  36 | 
  37 |     await page.locator('input#name').fill('Jugador Test');
  38 |     await page.locator('input#email').fill('test@arcade-vault.gg');
  39 |     await page.locator('textarea#message').fill('Mensaje de prueba desde Playwright.');
  40 | 
  41 |     await page.locator('form.contact-form button[type="submit"]').click();
  42 | 
  43 |     await expect(page.locator('.terminal-success')).toBeVisible();
  44 |     await expect(page.locator('.term-body .success')).toContainText('JUGADOR TEST');
  45 |   });
  46 | });
  47 | 
```