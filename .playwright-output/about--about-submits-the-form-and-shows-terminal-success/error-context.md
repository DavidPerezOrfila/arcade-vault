# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: about.spec.ts >> /about >> submits the form and shows terminal success
- Location: e2e\about.spec.ts:34:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/about", waiting until "load"

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
      - generic [ref=e27]: ▸ ACERCA DE
      - heading "ACERCA DE ARCADE VAULT" [level=1] [ref=e28]
      - paragraph [ref=e29]: "Creamos una sala de juegos retro en la web: partidas rápidas, tablas de clasificación y esa estética arcade que nunca pasa de moda."
      - generic [ref=e30]:
        - generic [ref=e31]:
          - img [ref=e32]
          - generic [ref=e45]: HECHO CON ❤️ PARA JUGADORES
        - generic [ref=e46]:
          - img [ref=e47]
          - generic [ref=e57]: JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR
        - generic [ref=e58]:
          - img [ref=e59]
          - generic [ref=e68]: PROYECTO EN CONSTANTE CRECIMIENTO
    - generic [ref=e98]:
      - generic [ref=e99]:
        - generic [ref=e100]: ▸ CONTACTO
        - heading "CONTÁCTANOS" [level=2] [ref=e101]
        - paragraph [ref=e102]: ¿Ideas para nuevos juegos, sugerencias o colaboraciones? Escríbenos y te responderemos cuanto antes.
        - generic [ref=e103]:
          - generic [ref=e104]: RESPUESTA EN 24-48H
          - generic [ref=e106]: SUGERENCIAS BIENVENIDAS
          - generic [ref=e108]: SIN SPAM, JAMÁS
      - generic [ref=e110]:
        - generic [ref=e111]:
          - generic [ref=e112]: NOMBRE
          - textbox "NOMBRE" [ref=e113]:
            - /placeholder: px_kai
        - generic [ref=e114]:
          - generic [ref=e115]: CORREO ELECTRÓNICO
          - textbox "CORREO ELECTRÓNICO" [ref=e116]:
            - /placeholder: jugador@vault.gg
        - generic [ref=e117]:
          - generic [ref=e118]: MENSAJE
          - textbox "MENSAJE" [ref=e119]:
            - /placeholder: ¿Qué te gustaría ver en Arcade Vault?
        - button "▶ ENVIAR MENSAJE" [ref=e120] [cursor=pointer]
  - contentinfo [ref=e121]: © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
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
  14 |     await page.goto('/');
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
> 35 |     await page.goto('/about');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
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