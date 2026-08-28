import { test, expect } from '@playwright/test';

test.describe('RANARIA Game', () => {
  test.beforeEach(async({ page }) => {
    await page.goto('/games/ranaria?e2e=1');
    // Wait for the board canvas to be ready
    await page.waitForSelector('.ranaria-board-wrap canvas', {
      timeout: 10000,
    });
    // Give the game a moment to initialize
    await page.waitForTimeout(1000);
  });

  test('loads without errors', async({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/RANARIA \| Arcade Vault/);

    // Check board canvas is visible
    const board = page.locator('.ranaria-board-wrap canvas');
    await expect(board).toBeVisible();

    // Check HUD renders
    await expect(page.getByText('PUNTOS', { exact: true })).toBeVisible();

    // Check no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Give time for any errors to surface
    await page.waitForTimeout(500);
    expect(
      errors.filter(
        (e) => !e.includes('favicon') && !e.includes('chrome-extension')
      ).length
    ).toBe(0);
  });

  test('shows game controls sidebar', async({ page }) => {
    // Check for controls section
    await expect(page.locator('text=CONTROLES')).toBeVisible();
    await expect(page.locator('text=↑ ↓ ← →')).toBeVisible(); // Arrows
    await expect(page.locator('text=W A S D')).toBeVisible(); // WASD

    // Check for scoring info
    await expect(
      page.locator('h2.ranaria-sidebar-title--scoring')
    ).toBeVisible();
    await expect(page.locator('text=Nenúfar')).toBeVisible();
    await expect(page.locator('text=+10')).toBeVisible();
  });

  test('game is playable - can move with arrows and WASD', async({ page }) => {
    const board = page.locator('.ranaria-board-wrap canvas');

    // Arrows
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowUp');

    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowDown');

    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowLeft');

    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowRight');

    // WASD
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(100);
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(100);
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(100);
    await page.keyboard.press('KeyD');
    await page.waitForTimeout(100);

    // If we reach here without errors, basic input works
    await expect(board).toBeVisible();
  });

  test('game over shows auth prompt for unauthenticated user', async({
    page,
  }) => {
    // The game over is forced via the test hook (?e2e=1). As an unauthenticated
    // user, submitRanariaScore returns UNAUTHENTICATED, so the auth prompt
    // must appear.
    const board = page.locator('.ranaria-board-wrap canvas');
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      (window as { __forceGameOver?: () => void }).__forceGameOver?.();
    });

    const overlay = page.locator('.ranaria-auth-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay.locator('.ranaria-auth-title')).toHaveText(
      '¡Partida terminada!'
    );
    await expect(overlay.locator('.ranaria-auth-button')).toHaveAttribute(
      'href',
      '/auth?redirect=/games/ranaria'
    );
  });

  test('leaderboard displays', async({ page }) => {
    // Check leaderboard HUD is visible
    const leaderboard = page.locator('.ranaria-leaderboard');
    await expect(leaderboard).toBeVisible();

    // Check title
    await expect(page.locator('.ranaria-leaderboard-title')).toContainText(
      'TOP 10'
    );
  });

  test('responsive canvas scales correctly', async({ page }) => {
    const board = page.locator('.ranaria-board-wrap canvas');

    // Get initial size on desktop
    const desktopBox = await board.boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.width).toBeLessThanOrEqual(640);

    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    const mobileBox = await board.boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.width).toBeLessThanOrEqual(375);

    // Aspect ratio should be maintained (640:560 = 8:7)
    const aspectRatio = mobileBox!.width / mobileBox!.height;
    expect(aspectRatio).toBeCloseTo(8 / 7, 1);
  });

  test('el selector de skin comparte columna con el panel', async({
    page,
  }) => {
    // El borde derecho de la barra de skin debe coincidir con el borde
    // derecho del panel lateral. Tolerancia ±2px.
    const skinBar = page.locator('.ranaria-skin-bar');
    const panel = page.locator('.ranaria-panel');
    const skinBox = await skinBar.boundingBox();
    const panelBox = await panel.boundingBox();
    expect(skinBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    const skinRight = skinBox!.x + skinBox!.width;
    const panelRight = panelBox!.x + panelBox!.width;
    expect(Math.abs(skinRight - panelRight)).toBeLessThanOrEqual(2);
  });

  test('SEO metadata present', async({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/RANARIA \| Arcade Vault/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /autopista/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /RANARIA/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /autopista/);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
  });
});
