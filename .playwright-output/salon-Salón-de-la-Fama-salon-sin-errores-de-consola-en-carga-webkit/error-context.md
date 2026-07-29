# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: salon.spec.ts >> Salón de la Fama (/salon) >> sin errores de consola en carga
- Location: tests\e2e\salon.spec.ts:37:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.reload: Test timeout of 30000ms exceeded.
Call log:
  - waiting for navigation until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
      - link "Inicio" [ref=e18]:
        - /url: /
      - link "Biblioteca" [ref=e19]:
        - /url: /games
      - link "Salón de la Fama" [ref=e20]:
        - /url: /salon
      - link "Acerca de" [ref=e21]:
        - /url: /about
      - link "Iniciar Sesión" [ref=e22]:
        - /url: /auth
      - generic [ref=e24]: CRÉDITOS · 03
    - generic [ref=e25]:
      - generic [ref=e26]:
        - heading "SALÓN DE LA FAMA" [level=1] [ref=e27]
        - paragraph [ref=e28]: LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
      - generic [ref=e29]: ▸ CARGANDO...
      - link "VOLVER A LA BIBLIOTECA" [ref=e31] [cursor=pointer]:
        - /url: /
    - contentinfo [ref=e32]: © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
  - generic [ref=e37] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e38]:
      - img [ref=e39]
    - generic [ref=e44]:
      - button "Open issues overlay" [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]: "0"
          - generic [ref=e48]: "1"
        - generic [ref=e49]: Issue
      - button "Collapse issues badge" [ref=e50]:
        - img [ref=e51]
  - alert [ref=e53]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // SPEC 06 — /salon renovada: client-side tabs + leaderboard via Server Action.
  4  | // Tests deterministas sin depender de Supabase Auth local.
  5  | 
  6  | test.describe('Salón de la Fama (/salon)', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await page.goto('/salon');
  9  |   });
  10 | 
  11 |   test('carga salón con cabecera y pestañas', async ({ page }) => {
  12 |     await expect(page.locator('h1')).toHaveText('SALÓN DE LA FAMA');
  13 |     await expect(page.locator('.hall-tabs .chip')).toHaveCount(8);
  14 |     await expect(page.locator('.hall-tabs .chip.active')).toHaveCount(1);
  15 |   });
  16 | 
  17 |   test('pestañas client-side: cambiar no modifica URL', async ({ page }) => {
  18 |     const urlInicial = page.url();
  19 |     expect(urlInicial).not.toContain('?game=');
  20 | 
  21 |     await page.locator('.hall-tabs .chip').nth(1).click();
  22 |     await expect(page.locator('.hall-tabs .chip.active')).toHaveCount(1);
  23 |     expect(page.url()).toBe(urlInicial);
  24 |   });
  25 | 
  26 |   test('estado vacío sin puntuaciones', async ({ page }) => {
  27 |     await expect(page.locator('.hall-empty')).toBeVisible({ timeout: 10000 });
  28 |     await expect(page.locator('.hall-empty')).toContainText(/AÚN NO HAY PUNTUACIONES/);
  29 |   });
  30 | 
  31 |   test('VOLVER A LA BIBLIOTECA navega a /', async ({ page }) => {
  32 |     await expect(page.locator('a.btn.lg', { hasText: 'VOLVER A LA BIBLIOTECA' })).toBeVisible();
  33 |     await page.locator('a.btn.lg', { hasText: 'VOLVER A LA BIBLIOTECA' }).click();
  34 |     await expect(page).toHaveURL('/');
  35 |   });
  36 | 
  37 |   test('sin errores de consola en carga', async ({ page }) => {
  38 |     const errors: string[] = [];
  39 |     page.on('console', (msg) => {
  40 |       if (msg.type() === 'error') errors.push(msg.text());
  41 |     });
> 42 |     await page.reload();
     |                ^ Error: page.reload: Test timeout of 30000ms exceeded.
  43 |     await expect(page.locator('h1')).toBeVisible();
  44 |     await page.waitForTimeout(500);
  45 |     const reales = errors.filter(
  46 |       (e) => !e.includes('favicon') && !e.includes('chrome-extension')
  47 |     );
  48 |     expect(reales).toEqual([]);
  49 |   });
  50 | });
  51 | 
```