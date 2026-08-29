import { test, expect } from '@playwright/test';

test.describe('DUELO PIXEL Game', () => {
  test.beforeEach(async({ page }) => {
    await page.goto('/games/duelo-pixel?e2e=1');
    // Wait for the board canvas to be ready
    await page.waitForSelector('.duelo-pixel-board-wrap canvas', {
      timeout: 10000,
    });
    // Give the game a moment to initialize
    await page.waitForTimeout(1000);
  });

  test('loads without errors', async({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/DUELO PIXEL \| Arcade Vault/);

    // Check board canvas is visible
    const board = page.locator('.duelo-pixel-board-wrap canvas');
    await expect(board).toBeVisible();

    // Check mode selector renders
    await expect(
      page.getByRole('button', { name: /RACHA CPU/ })
    ).toBeVisible();

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
    await expect(page.locator('text=W / S')).toBeVisible(); // WASD move
    await expect(page.locator('text=P / Esc')).toBeVisible(); // Pause

    // Check for scoring info
    await expect(
      page.locator('h2.duelo-pixel-sidebar-title--scoring')
    ).toBeVisible();
    await expect(
      page.getByText('Racha CPU', { exact: true })
    ).toBeVisible();
    await expect(page.locator('text=1ª a 5 puntos')).toBeVisible();
  });

  test('game is playable - can move paddles with W/S and arrows', async({
    page,
  }) => {
    const board = page.locator('.duelo-pixel-board-wrap canvas');

    // W/S (J1 in cpu-endurance)
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(100);
    await page.keyboard.up('KeyW');

    await page.keyboard.down('KeyS');
    await page.waitForTimeout(100);
    await page.keyboard.up('KeyS');

    // Arrows also mapped to J1 in cpu-endurance
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowUp');

    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowDown');

    // Pause/resume
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(100);
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(100);

    // If we reach here without errors, basic input works
    await expect(board).toBeVisible();
  });

  test('mode selector switches to local-exhibition and back', async({
    page,
  }) => {
    const localBtn = page.getByRole('button', { name: /2 JUGADORES/ });
    await expect(localBtn).toBeVisible();
    await localBtn.click();
    await expect(localBtn).toHaveAttribute('aria-pressed', 'true');

    // Arrows now drive J2; no crash.
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowUp');

    const cpuBtn = page.getByRole('button', { name: /RACHA CPU/ });
    await cpuBtn.click();
    await expect(cpuBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('game over shows auth prompt for unauthenticated user', async({
    page,
  }) => {
    // The game over is forced via the test hook (?e2e=1). As an unauthenticated
    // user, submitDueloPixelScore returns UNAUTHENTICATED, so the auth prompt
    // must appear.
    const board = page.locator('.duelo-pixel-board-wrap canvas');
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      (window as { __forceGameOver?: () => void }).__forceGameOver?.();
    });

    const overlay = page.locator('.duelo-pixel-auth-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay.locator('.duelo-pixel-auth-title')).toHaveText(
      '¡Partida terminada!'
    );
    await expect(overlay.locator('.duelo-pixel-auth-button')).toHaveAttribute(
      'href',
      '/auth?redirect=/games/duelo-pixel'
    );
  });

  test('leaderboard displays', async({ page }) => {
    // Check leaderboard is visible
    const leaderboard = page.locator('.duelo-pixel-leaderboard');
    await expect(leaderboard).toBeVisible();

    // Check title
    await expect(page.locator('.duelo-pixel-leaderboard-title')).toContainText(
      'TOP 10'
    );
  });

  test('responsive canvas scales correctly', async({ page }) => {
    const board = page.locator('.duelo-pixel-board-wrap canvas');

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

    // Aspect ratio should be maintained (800:600 = 4:3)
    const aspectRatio = mobileBox!.width / mobileBox!.height;
    expect(aspectRatio).toBeCloseTo(4 / 3, 1);
  });

  test('el selector de skin comparte columna con el panel', async({
    page,
  }) => {
    // El borde derecho de la barra de skin debe coincidir con el borde
    // derecho del panel lateral. Tolerancia ±2px.
    const skinBar = page.locator('.duelo-pixel-skin-bar');
    const panel = page.locator('.duelo-pixel-panel');
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
    await expect(page).toHaveTitle(/DUELO PIXEL \| Arcade Vault/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /paletas/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /DUELO PIXEL/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /paletas/);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
  });
});
