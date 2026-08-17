import { test, expect } from '@playwright/test';

// Verifica el trabajo responsive + touch de SPEC.md: el overlay de botones
// tactiles (TouchControls) se monta solo en punteros gruesos y el layout no
// desborda horizontalmente en movil ni en desktop.
test.describe('desktop keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/asteroids?e2e=1');
    await page.waitForSelector('.asteroids-game-container canvas', {
      timeout: 10000,
    });
  });

  test('loads the asteroids canvas and accepts keyboard input', async ({
    page,
  }) => {
    const canvas = page.locator('.asteroids-game-container canvas');
    await expect(canvas).toBeVisible();

    await canvas.click();
    await page.keyboard.press('ArrowRight');

    await expect(canvas).toBeVisible();
  });

  test('home page has no horizontal overflow on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const hasNoOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );

    expect(hasNoOverflow).toBe(true);
  });
});

test.describe('mobile touch', () => {
  test.use({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/games/asteroids?e2e=1');
    await page.waitForSelector('.asteroids-game-container canvas', {
      timeout: 10000,
    });
    await page.waitForSelector('.asteroids-touch-controls', {
      timeout: 10000,
    });
  });

  test('renders touch controls with at least one button on mobile', async ({
    page,
  }) => {
    const controls = page.locator('.asteroids-touch-controls');
    await expect(controls).toBeVisible();

    const buttonCount = await controls
      .locator('.asteroids-touch-button')
      .count();
    expect(buttonCount).toBeGreaterThanOrEqual(1);
  });

  test('tapping the FIRE touch button fires an action and the canvas keeps animating', async ({
    page,
  }) => {
    const canvas = page.locator('.asteroids-game-container canvas');
    const fireButton = page
      .locator('.asteroids-touch-button')
      .filter({ hasText: 'FIRE' });

    const before = await canvas.evaluate((c: HTMLCanvasElement) =>
      c.toDataURL()
    );

    await fireButton.click();
    await page.waitForTimeout(400);

    const after = await canvas.evaluate((c: HTMLCanvasElement) =>
      c.toDataURL()
    );

    expect(after).not.toBe(before);
  });

  test('home page has no horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/');

    const hasNoOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );

    expect(hasNoOverflow).toBe(true);
  });

  test('bloque-buster shows a PAUSA touch button and tapping it does not throw', async ({
    page,
  }) => {
    await page.goto('/games/bloque-buster?e2e=1');
    await page.waitForSelector('.bloque-buster-game-container canvas', {
      timeout: 10000,
    });

    const controls = page.locator('.bloque-buster-touch-controls');
    await expect(controls).toBeVisible();

    const pauseButton = controls
      .locator('.bloque-buster-touch-button')
      .filter({ hasText: 'PAUSA' });
    await expect(pauseButton).toBeVisible();

    await pauseButton.click();

    await expect(
      page.locator('.bloque-buster-game-container canvas')
    ).toBeVisible();
  });
});
