import { test, expect } from '@playwright/test';

// Verifica el trabajo responsive + touch de SPEC.md: el mando táctil estilo
// NES (TouchControls) se monta solo en punteros gruesos y el layout no
// desborda horizontalmente en movil ni en desktop.
test.describe('desktop keyboard', () => {
  test.beforeEach(async({ page }) => {
    await page.goto('/games/asteroids?e2e=1');
    await page.waitForSelector('.asteroids-game-container canvas', {
      timeout: 10000,
    });
  });

  test('loads the asteroids canvas and accepts keyboard input', async({
    page,
  }) => {
    const canvas = page.locator('.asteroids-game-container canvas');
    await expect(canvas).toBeVisible();

    await canvas.click();
    await page.keyboard.press('ArrowRight');

    await expect(canvas).toBeVisible();
  });

  test('does not render the touch controls on desktop', async({ page }) => {
    await expect(page.locator('.touch-controls')).toHaveCount(0);
  });

  test('home page has no horizontal overflow on desktop', async({ page }) => {
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

  test.beforeEach(async({ page }) => {
    await page.goto('/games/asteroids?e2e=1');
    await page.waitForSelector('.asteroids-game-container canvas', {
      timeout: 10000,
    });
    await page.waitForSelector('.touch-controls', {
      timeout: 10000,
    });
  });

  test('renders the NES touch controls (d-pad + A/B) on mobile', async({
    page,
  }) => {
    const controls = page.locator('.touch-controls');
    await expect(controls).toBeVisible();

    await expect(controls.locator('.touch-dpad')).toBeVisible();

    const buttonCount = await controls.locator('.touch-btn').count();
    expect(buttonCount).toBeGreaterThanOrEqual(2);
  });

  test('tapping the A (FIRE) button fires an action and the canvas keeps animating', async({
    page,
  }) => {
    const canvas = page.locator('.asteroids-game-container canvas');
    const fireButton = page.locator('.touch-btn').filter({ hasText: 'A' });

    const before = await canvas.evaluate((c: HTMLCanvasElement) =>
      c.toDataURL()
    );

    await fireButton.tap();
    await page.waitForTimeout(400);

    const after = await canvas.evaluate((c: HTMLCanvasElement) =>
      c.toDataURL()
    );

    expect(after).not.toBe(before);
  });

  test('tapping the d-pad right direction dispatches input without throwing', async({
    page,
  }) => {
    const canvas = page.locator('.asteroids-game-container canvas');
    const dPad = page.locator('.touch-dpad');

    await expect(dPad).toBeVisible();
    await dPad.tap({ position: { x: 100, y: 60 } });
    await page.waitForTimeout(200);

    await expect(canvas).toBeVisible();
  });

  test('home page has no horizontal overflow on mobile', async({ page }) => {
    await page.goto('/');

    const hasNoOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );

    expect(hasNoOverflow).toBe(true);
  });

  test('bloque-buster shows a PAUSA touch button and tapping it does not throw', async({
    page,
  }) => {
    await page.goto('/games/bloque-buster?e2e=1');
    await page.waitForSelector('.bloque-buster-game-container canvas', {
      timeout: 10000,
    });

    const controls = page.locator('.touch-controls');
    await expect(controls).toBeVisible();

    const pauseButton = controls
      .locator('.touch-pause')
      .filter({ hasText: 'PAUSA' });
    await expect(pauseButton).toBeVisible();

    await pauseButton.click();

    await expect(
      page.locator('.bloque-buster-game-container canvas')
    ).toBeVisible();
  });

  test('game page uses the game-viewport container on mobile', async({
    page,
  }) => {
    await expect(page.locator('.game-viewport')).toHaveCount(1);
  });

  test('touch controls do not overlap the canvas', async({ page }) => {
    const canvas = page.locator('.asteroids-game-container canvas');
    const controls = page.locator('.touch-controls');

    await expect(canvas).toBeVisible();
    await expect(controls).toBeVisible();

    const canvasBox = await canvas.boundingBox();
    const controlsBox = await controls.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(controlsBox).not.toBeNull();

    expect(controlsBox!.y).toBeGreaterThanOrEqual(
      canvasBox!.y + canvasBox!.height - 1
    );
  });
});
