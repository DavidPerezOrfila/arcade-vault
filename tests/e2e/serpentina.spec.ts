import { test, expect } from "@playwright/test";

test.describe("SERPENTINA Game", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games/serpentina?e2e=1");
    // Wait for the board canvas to be ready
    await page.waitForSelector(".serpentina-board-wrap canvas", {
      timeout: 10000,
    });
    // Give the game a moment to initialize
    await page.waitForTimeout(1000);
  });

  test("loads without errors", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/SERPENTINA \| Arcade Vault/);

    // Check board canvas is visible
    const board = page.locator(".serpentina-board-wrap canvas");
    await expect(board).toBeVisible();

    // Check HUD renders
    await expect(page.getByText("PUNTOS", { exact: true })).toBeVisible();

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
    await expect(page.locator("text=↑ ↓ ← →")).toBeVisible(); // Arrows
    await expect(page.locator("text=W A S D")).toBeVisible(); // WASD

    // Check for scoring info
    await expect(
      page.locator("h2.serpentina-sidebar-title--scoring"),
    ).toBeVisible();
    await expect(page.locator("text=Fruta")).toBeVisible();
    await expect(page.locator("text=+10")).toBeVisible();
  });

  test("game is playable - can move with arrows and WASD", async ({ page }) => {
    const board = page.locator(".serpentina-board-wrap canvas");

    // Arrows
    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowUp");

    await page.keyboard.down("ArrowDown");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowDown");

    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowLeft");

    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowRight");

    // WASD
    await page.keyboard.press("KeyW");
    await page.waitForTimeout(100);
    await page.keyboard.press("KeyS");
    await page.waitForTimeout(100);
    await page.keyboard.press("KeyA");
    await page.waitForTimeout(100);
    await page.keyboard.press("KeyD");
    await page.waitForTimeout(100);

    // If we reach here without errors, basic input works
    await expect(board).toBeVisible();
  });

  test("game over shows auth prompt for unauthenticated user", async ({
    page,
  }) => {
    // The game over is forced via the test hook (?e2e=1). As an unauthenticated
    // user, submitSerpentinaScore returns UNAUTHENTICATED, so the auth prompt
    // must appear.
    const board = page.locator(".serpentina-board-wrap canvas");
    await expect(board).toBeVisible();

    await page.evaluate(() => {
      (
        window as { __forceGameOver?: (score?: number) => void }
      ).__forceGameOver?.();
    });

    const overlay = page.locator(".serpentina-auth-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay.locator(".serpentina-auth-title")).toHaveText(
      "¡Partida terminada!",
    );
    await expect(overlay.locator(".serpentina-auth-button")).toHaveAttribute(
      "href",
      "/auth?redirect=/games/serpentina",
    );
  });

  test("wall collision triggers game over and restart button works", async ({
    page,
  }) => {
    // La serpiente empieza en (11,12) moviéndose a la derecha sin input:
    // choca con la pared derecha (~1.7s) y dispara GAME OVER real.
    const overlay = page.locator(".serpentina-overlay:not(.hidden)");
    await expect(overlay).toBeVisible({ timeout: 10000 });
    await expect(overlay.locator(".serpentina-overlay-title")).toHaveText(
      "GAME OVER",
    );

    // Usuario no autenticado: el submit dispara el prompt de auth.
    const auth = page.locator(".serpentina-auth-overlay");
    await expect(auth).toBeVisible();
    await auth.locator(".serpentina-auth-dismiss").click();

    // Reiniciar sin recargar: el overlay desaparece y el juego corre de nuevo.
    await overlay.locator(".serpentina-overlay-button").click();
    await expect(page.locator(".serpentina-overlay")).toHaveClass(/hidden/);
    await expect(page.locator(".serpentina-board-wrap canvas")).toBeVisible();
  });

  test("snake eats food, grows and score increases by 10", async ({ page }) => {
    // Pin de Math.random ANTES de cargar el juego: spawnFood usa
    // empty[floor(random*empty.length)] en orden row-major; con 0.5236 la
    // comida cae en (12,12) — justo delante de la cabeza (11,12) que avanza
    // a la derecha. Un tick (~130ms) → come → score 10.
    await page.addInitScript(() => {
      Math.random = () => 0.5236;
    });
    await page.goto("/games/serpentina?e2e=1");
    await page.waitForSelector(".serpentina-board-wrap canvas", {
      timeout: 10000,
    });

    const score = page.locator(".serpentina-hud-item span:last-child");
    await expect(score).toHaveText("10", { timeout: 5000 });
  });

  test("leaderboard displays", async ({ page }) => {
    // Check leaderboard HUD is visible
    const leaderboard = page.locator(".serpentina-leaderboard");
    await expect(leaderboard).toBeVisible();

    // Check title
    await expect(page.locator(".serpentina-leaderboard-title")).toContainText(
      "TOP 10",
    );
  });

  test("responsive canvas scales correctly", async ({ page }) => {
    const board = page.locator(".serpentina-board-wrap canvas");

    // Get initial size on desktop
    const desktopBox = await board.boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.width).toBeLessThanOrEqual(600);

    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    const mobileBox = await board.boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.width).toBeLessThanOrEqual(375);

    // Aspect ratio should be maintained (1:1)
    const aspectRatio = mobileBox!.width / mobileBox!.height;
    expect(aspectRatio).toBeCloseTo(1, 1);
  });

  test("SEO metadata present", async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/SERPENTINA \| Arcade Vault/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /Clásico Snake/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /SERPENTINA/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /Clásico Snake/);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "website");
  });
});
