import { test, expect } from "@playwright/test";

test.describe("/about", () => {
  test("renders hero, highlights and contact form", async ({ page }) => {
    await page.goto("/about");

    await expect(page.locator("h1")).toHaveText("ACERCA DE ARCADE VAULT");
    await expect(page.locator(".about-mission")).toBeVisible();
    await expect(page.locator(".highlight")).toHaveCount(3);
    await expect(page.locator('form.contact-form')).toBeVisible();
  });

  test("navigates from nav link", async ({ page }) => {
    await page.goto("/");
    await page.locator('nav .links a[href="/about"]').click();
    await expect(page).toHaveURL("/about");
    await expect(page.locator("h1")).toHaveText("ACERCA DE ARCADE VAULT");
  });

  test("validates required fields before sending", async ({ page }) => {
    await page.goto("/about");

    const nameInput = page.locator('input#name');
    const emailInput = page.locator('input#email');
    const messageInput = page.locator('textarea#message');

    await page.locator('form.contact-form button[type="submit"]').click();

    await expect(nameInput).toHaveAttribute("required", "");
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(messageInput).toHaveAttribute("required", "");
  });

  test("submits the form and shows terminal success", async ({ page }) => {
    await page.goto("/about");

    await page.locator('input#name').fill("Jugador Test");
    await page.locator('input#email').fill("test@arcade-vault.gg");
    await page.locator('textarea#message').fill("Mensaje de prueba desde Playwright.");

    await page.locator('form.contact-form button[type="submit"]').click();

    await expect(page.locator(".terminal-success")).toBeVisible();
    await expect(page.locator(".term-body .success")).toContainText("JUGADOR TEST");
  });
});
