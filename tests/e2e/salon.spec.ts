import { test, expect } from '@playwright/test';

// SPEC 06 — /salon renovada: client-side tabs + leaderboard via Server Action.
// Tests deterministas sin depender de Supabase Auth local.

test.describe('Salón de la Fama (/salon)', () => {
  test.beforeEach(async({ page }) => {
    await page.goto('/salon');
  });

  test('carga salón con cabecera y pestañas', async({ page }) => {
    await expect(page.locator('h1')).toHaveText('SALÓN DE LA FAMA');
    await expect(page.locator('.hall-tabs .chip')).toHaveCount(8);
    await expect(page.locator('.hall-tabs .chip.active')).toHaveCount(1);
  });

  test('pestañas client-side: cambiar no modifica URL', async({ page }) => {
    const urlInicial = page.url();
    expect(urlInicial).not.toContain('?game=');

    await page.locator('.hall-tabs .chip').nth(1).click();
    await expect(page.locator('.hall-tabs .chip.active')).toHaveCount(1);
    expect(page.url()).toBe(urlInicial);
  });

  test('estado vacío sin puntuaciones', async({ page }) => {
    // .hall-empty muestra primero "▸ CARGANDO..." hasta que la Server Action
    // resuelve; la aserción debe esperar el estado final (timeout generoso)
    // en vez de quedarse con el estado de carga visible.
    await expect(page.locator('.hall-empty')).toContainText(
      /AÚN NO HAY PUNTUACIONES/,
      { timeout: 15000 }
    );
  });

  test('VOLVER A LA BIBLIOTECA navega a /', async({ page }) => {
    await expect(
      page.locator('a.btn.lg', { hasText: 'VOLVER A LA BIBLIOTECA' })
    ).toBeVisible();
    await page
      .locator('a.btn.lg', { hasText: 'VOLVER A LA BIBLIOTECA' })
      .click();
    await expect(page).toHaveURL('/');
  });

  test('sin errores de consola en carga', async({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
    await page.waitForTimeout(500);
    const reales = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('chrome-extension')
    );
    expect(reales).toEqual([]);
  });
});
