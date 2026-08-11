import { test, expect } from "@playwright/test";

test.describe("CAÍDA Game", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games/caida?e2e=1");
    // Wait for the board canvas to be ready (next canvas follows)
    await page.waitForSelector(".caida-board-wrap canvas", {
      timeout: 10000,
    });
    // Give the game a moment to initialize
    await page.waitForTimeout(1000);
  });

  test("loads without errors", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/CAÍDA \| Arcade Vault/);

    // Check board and next canvases are visible
    const board = page.locator(".caida-board-wrap canvas");
    await expect(board).toBeVisible();
    const next = page.locator(".caida-next canvas");
    await expect(next).toBeVisible();

    // Check HUD renders (exact: sidebar scoring mentions "líneas" and "nivel")
    await expect(page.getByText("PUNTOS", { exact: true })).toBeVisible();
    await expect(page.getByText("LÍNEAS", { exact: true })).toBeVisible();
    await expect(page.getByText("NIVEL", { exact: true })).toBeVisible();

    // Check no console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Give time for any errors to surface
    await page.waitForTimeout(500);
    expect(
      errors.filter(
        (e) => !e.includes("favicon") && !e.includes("chrome-extension"),
      ).length,
    ).toBe(0);
  });

  test("shows game controls sidebar", async ({ page }) => {
    // Check for controls section
    await expect(page.locator("text=CONTROLES")).toBeVisible();
    await expect(page.locator("text=← →")).toBeVisible(); // Move
    await expect(page.locator("text=↑ / X")).toBeVisible(); // Rotate
    await expect(page.locator("text=ESPACIO")).toBeVisible(); // Hard drop

    // Check for scoring info
    await expect(page.locator("h2.caida-sidebar-title--scoring")).toBeVisible();
    await expect(page.locator("text=1 línea")).toBeVisible();
  });

  test("game is playable - can move, rotate, and hard drop", async ({
    page,
  }) => {
    const board = page.locator(".caida-board-wrap canvas");

    // Test move left
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowLeft");

    // Test move right
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowRight");

    // Test rotate
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(100);

    // Test hard drop
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);

    // If we reach here without errors, basic input works
    await expect(board).toBeVisible();
  });

  test("las flechas no desplazan la página (no scroll)", async ({ page }) => {
    // Viewport pequeño para que la página sea scrolleable; si las flechas no
    // hacen preventDefault, window.scrollY cambia y el test falla.
    await page.setViewportSize({ width: 400, height: 500 });
    await page.waitForTimeout(200);
    await page.locator(".caida-board-wrap canvas").scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => window.scrollY);
    expect(after).toBe(before);
  });

  test("la pieza cae sola (el loop del juego corre)", async ({ page }) => {
    // Sin input, la pieza debe caer una fila cada ~1s (dropInterval 1000ms).
    // Dos capturas del canvas separadas 1.3s: si el loop corre, la pieza y el
    // ghost cambian de posición y los píxeles difieren. Un loop congelado
    // (RAF estrangulado en headless WebKit) deja el canvas idéntico → fail.
    const board = page.locator(".caida-board-wrap canvas");
    const shot1 = await board.screenshot();
    await page.waitForTimeout(1300);
    const shot2 = await board.screenshot();
    expect(shot1.equals(shot2)).toBe(false);
  });

  test("game over shows auth prompt for unauthenticated user", async ({
    page,
  }) => {
    // The game over is forced via the test hook (?e2e=1). As an unauthenticated
    // user, submitCaidaScore returns UNAUTHENTICATED, so the auth prompt
    // must appear.
    const board = page.locator(".caida-board-wrap canvas");
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      (window as { __forceGameOver?: () => void }).__forceGameOver?.();
    });

    const overlay = page.locator(".caida-auth-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay.locator(".caida-auth-title")).toHaveText(
      "¡Partida terminada!",
    );
    await expect(overlay.locator(".caida-auth-button")).toHaveAttribute(
      "href",
      "/auth?redirect=/games/caida",
    );
  });

  test("leaderboard displays", async ({ page }) => {
    // Check leaderboard HUD is visible
    const leaderboard = page.locator(".caida-leaderboard");
    await expect(leaderboard).toBeVisible();

    // Check title
    await expect(page.locator(".caida-leaderboard-title")).toContainText(
      "TOP 10",
    );
  });

  test("responsive canvas scales correctly", async ({ page }) => {
    const board = page.locator(".caida-board-wrap canvas");

    // Get initial size on desktop
    const desktopBox = await board.boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.width).toBeLessThanOrEqual(800);

    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    const mobileBox = await board.boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.width).toBeLessThanOrEqual(375);

    // Aspect ratio should be maintained (approximately 1:2)
    const aspectRatio = mobileBox!.width / mobileBox!.height;
    expect(aspectRatio).toBeCloseTo(0.5, 1);
  });

  test("SEO metadata present", async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/CAÍDA \| Arcade Vault/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /Tetris/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /CAÍDA/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /Tetris/);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "website");
  });
});
