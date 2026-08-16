import { test, expect } from "@playwright/test";

test.describe("Asteroids Game", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games/asteroids?e2e=1");
    // Wait for the game canvas to be ready
    await page.waitForSelector(".asteroids-game-container canvas", {
      timeout: 10000,
    });
    // Give the game a moment to initialize
    await page.waitForTimeout(1000);
  });

  test("loads without errors", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Asteroids \| Arcade Vault/);

    // Check canvas is visible
    const canvas = page.locator(".asteroids-game-container canvas");
    await expect(canvas).toBeVisible();

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
    await expect(page.locator("text=↑")).toBeVisible(); // Thrust
    await expect(page.locator("text=← →")).toBeVisible(); // Rotate
    await expect(page.locator("text=ESPACIO")).toBeVisible(); // Shoot

    // Check for power-up info
    await expect(
      page.locator("h2.asteroids-sidebar-title--powerup"),
    ).toBeVisible();
    await expect(page.locator("text=3x")).toBeVisible();

    // Check for scoring info - use specific selector to avoid strict mode violation
    await expect(
      page.locator("h2.asteroids-sidebar-title--scoring"),
    ).toBeVisible();
    await expect(page.locator("text=Asteroide grande")).toBeVisible();
  });

  test("game is playable - can thrust, rotate, and shoot", async ({ page }) => {
    const canvas = page.locator(".asteroids-game-container canvas");

    // Focus the canvas
    await canvas.click();

    // Test rotation left
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowLeft");

    // Test rotation right
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowRight");

    // Test thrust
    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowUp");

    // Test shooting
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);

    // If we reach here without errors, basic input works
    await expect(canvas).toBeVisible();
  });

  test("el juego corre - la escena cambia con el tiempo", async ({ page }) => {
    // Sin input, los asteroides derivan y la nave parpadea (invincible 3s):
    // la escena cambia continuamente. Dos capturas separadas 1.2s deben
    // diferir; un loop congelado (RAF estrangulado en headless WebKit) deja
    // el canvas idéntico → fail.
    const canvas = page.locator(".asteroids-game-container canvas");
    const shot1 = await canvas.screenshot();
    await page.waitForTimeout(1200);
    const shot2 = await canvas.screenshot();
    expect(shot1.equals(shot2)).toBe(false);
  });

  test("game over shows auth prompt for unauthenticated user", async ({
    page,
  }) => {
    // The game over is forced via the test hook (?e2e=1). As an unauthenticated
    // user, submitAsteroidsScore returns UNAUTHENTICATED, so the auth prompt
    // must appear.
    const canvas = page.locator(".asteroids-game-container canvas");
    await expect(canvas).toBeVisible();

    await page.evaluate(() => {
      (
        window as { __forceGameOver?: (score?: number) => void }
      ).__forceGameOver?.();
    });

    const overlay = page.locator(".asteroids-auth-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay.locator(".asteroids-auth-title")).toHaveText(
      "¡Partida terminada!",
    );
    await expect(overlay.locator(".asteroids-auth-button")).toHaveAttribute(
      "href",
      "/auth?redirect=/games/asteroids",
    );
  });

  test("leaderboard displays", async ({ page }) => {
    // Check leaderboard card is visible
    const leaderboard = page.locator(".asteroids-leaderboard-card");
    await expect(leaderboard).toBeVisible();

    // Check title
    await expect(page.locator(".asteroids-leaderboard-title")).toContainText(
      "TOP 10",
    );
  });

  test("responsive canvas scales correctly", async ({ page }) => {
    const canvas = page.locator(".asteroids-game-container canvas");

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

  test("SEO metadata present", async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Asteroids \| Arcade Vault/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /Asteroids/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /Asteroids/);

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /Asteroids/);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "website");
  });
});
