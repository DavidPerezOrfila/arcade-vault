# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: salon.spec.ts >> Salón de la Fama (/salon) >> estado vacío sin puntuaciones
- Location: tests\e2e\salon.spec.ts:26:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.hall-empty')
Expected pattern: /AÚN NO HAY PUNTUACIONES/
Received string:  "▸ CARGANDO..."
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.hall-empty')
    13 × locator resolved to <div class="hall-empty pixel neon-cyan">▸ CARGANDO...</div>
       - unexpected value "▸ CARGANDO..."

```

```yaml
- text: ▸ CARGANDO...
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
> 28 |     await expect(page.locator('.hall-empty')).toContainText(/AÚN NO HAY PUNTUACIONES/);
     |                                               ^ Error: expect(locator).toContainText(expected) failed
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
  42 |     await page.reload();
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