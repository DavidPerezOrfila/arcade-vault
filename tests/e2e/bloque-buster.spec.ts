import { test, expect } from '@playwright/test';

// Espejo de tests/e2e/asteroids.spec.ts con el prefijo CSS de bloque-buster.
// Sin powerups ni tabla de puntuación alternativa: el sidebar de bloque-buster
// solo tiene CONTROLES (← → / ratón, P pausa, ESPACIO reiniciar).
test.describe('Bloque Buster Game', () => {
  test.beforeEach(async({ page }) => {
    await page.goto('/games/bloque-buster?e2e=1');
    // Wait for the game canvas to be ready
    await page.waitForSelector('.bloque-buster-game-container canvas', {
      timeout: 10000,
    });
    // Give the game a moment to initialize
    await page.waitForTimeout(1000);
  });

  test('loads without errors', async({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Bloque Buster \| Arcade Vault/);

    // Check canvas is visible
    const canvas = page.locator('.bloque-buster-game-container canvas');
    await expect(canvas).toBeVisible();

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
    await expect(page.locator('text=← →')).toBeVisible(); // Mover paleta
    await expect(page.locator('text=Ratón')).toBeVisible();
    await expect(page.getByText('Pausar')).toBeVisible();
    await expect(
      page.locator('.bloque-buster-control-key').getByText('P', {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.locator('.bloque-buster-control-key').getByText('ESPACIO', {
        exact: true,
      })
    ).toBeVisible(); // Reiniciar
  });

  test('game is playable - paddle moves with keyboard', async({ page }) => {
    const canvas = page.locator('.bloque-buster-game-container canvas');

    // Focus the canvas
    await canvas.click();

    // Mover la paleta a la derecha
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowRight');

    // Mover la paleta a la izquierda
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowLeft');

    // If we reach here without errors, basic input works
    await expect(canvas).toBeVisible();
  });

  test('el juego corre - la escena cambia con el tiempo', async({ page }) => {
    // Sin input, la pelota arranca sola y se mueve: dos capturas separadas
    // 1.2s deben diferir; un loop congelado deja el canvas idéntico → fail.
    const canvas = page.locator('.bloque-buster-game-container canvas');
    const shot1 = await canvas.screenshot();
    await page.waitForTimeout(1200);
    const shot2 = await canvas.screenshot();
    expect(shot1.equals(shot2)).toBe(false);
  });

  test('game over shows auth prompt for unauthenticated user', async({
    page,
  }) => {
    // The game over is forced via the test hook (?e2e=1). As an unauthenticated
    // user, submitBloqueBusterScore returns UNAUTHENTICATED, so the auth prompt
    // must appear.
    const canvas = page.locator('.bloque-buster-game-container canvas');
    await expect(canvas).toBeVisible();

    await page.evaluate(() => {
      (window as { __forceGameOver?: () => void }).__forceGameOver?.();
    });

    const overlay = page.locator('.bloque-buster-auth-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay.locator('.bloque-buster-auth-title')).toHaveText(
      '¡Partida terminada!'
    );
    await expect(overlay.locator('.bloque-buster-auth-button')).toHaveAttribute(
      'href',
      '/auth?redirect=/games/bloque-buster'
    );
  });

  test('leaderboard displays', async({ page }) => {
    // Check leaderboard card is visible
    const leaderboard = page.locator('.bloque-buster-leaderboard-card');
    await expect(leaderboard).toBeVisible();

    // Check title
    await expect(
      page.locator('.bloque-buster-leaderboard-title')
    ).toContainText('TOP 10');
  });

  test('responsive canvas scales correctly', async({ page }) => {
    const canvas = page.locator('.bloque-buster-game-container canvas');

    // Get initial size on desktop
    const desktopBox = await canvas.boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.width).toBeLessThanOrEqual(800);

    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    const mobileBox = await canvas.boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.width).toBeLessThanOrEqual(375);

    // Aspect ratio should be maintained (approximately 4:3)
    const aspectRatio = mobileBox!.width / mobileBox!.height;
    expect(aspectRatio).toBeCloseTo(4 / 3, 1);
  });

  test('el selector de skin comparte columna con el canvas', async({
    page,
  }) => {
    // El borde derecho de la barra de skin debe coincidir con el borde
    // derecho del canvas (ambos dentro de la misma caja centrada de 800px).
    // Tolerancia ±2px.
    const skinBar = page.locator('.bloque-buster-skin-bar');
    const canvas = page.locator('.bloque-buster-game-container canvas');
    const skinBox = await skinBar.boundingBox();
    const canvasBox = await canvas.boundingBox();
    expect(skinBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();
    const skinRight = skinBox!.x + skinBox!.width;
    const canvasRight = canvasBox!.x + canvasBox!.width;
    expect(Math.abs(skinRight - canvasRight)).toBeLessThanOrEqual(2);
  });

  test('SEO metadata present', async({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Bloque Buster \| Arcade Vault/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute(
      'content',
      /Rompe todos los bloques/
    );

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Bloque Buster/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute(
      'content',
      /Rompe todos los bloques/
    );

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
  });
});
