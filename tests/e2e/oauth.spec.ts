import { test, expect } from '@playwright/test';

// Cobertura OAuth: los botones GOOGLE/GITHUB inician el flujo contra el
// proveedor real vía Supabase; el callback con code inválido ejercita la
// rama de error del route handler. El login completo solo con GitHub y una
// cuenta de prueba dedicada (sin 2FA): credenciales en GH_E2E_USERNAME y
// GH_E2E_PASSWORD; sin ellas el test se salta. Nunca la cuenta personal.
// GH_E2E_USERNAME debe ser el login de GitHub (el trigger de profiles
// deriva el username visible de ese handle).
const GH_USERNAME = process.env.GH_E2E_USERNAME;
const GH_PASSWORD = process.env.GH_E2E_PASSWORD;

// Misma derivación que el trigger handle_new_user: lowercase, sin caracteres
// raros, máximo 20.
const ghHandle = (login: string) =>
  login
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);

test.describe('OAuth', () => {
  test('GOOGLE inicia el flujo hacia el proveedor', async ({ page }) => {
    await page.goto('/auth');

    await page.getByRole('button', { name: 'GOOGLE' }).click();

    // Tolerante: Google puede mostrar el consent real o su bloqueo de
    // tráfico inusual; lo que verifica es que salimos hacia google.com.
    await page.waitForURL(/google\.com/, { timeout: 30000 });
  });

  test('GITHUB inicia el flujo hacia el proveedor', async ({ page }) => {
    await page.goto('/auth');

    await page.getByRole('button', { name: 'GITHUB' }).click();

    await page.waitForURL(/github\.com\/login/, { timeout: 30000 });
  });

  test('callback con code inválido redirige a /auth?error=callback', async ({
    page,
  }) => {
    // Ejercita la rama de error real del route handler sin depender del
    // proveedor: un code inválido hace que exchangeCodeForSession falle.
    // (Un mock con fulfill 302 no es válido en WebKit.)
    await page.goto('/auth/callback?code=invalid');

    await expect(page).toHaveURL(/\/auth\?error=callback/);
  });

  test('login completo con GitHub crea sesión y el nav muestra avatar + nombre + SALIR', async ({
    page,
    browserName,
  }) => {
    test.skip(
      !GH_USERNAME || !GH_PASSWORD || browserName !== 'chromium',
      'requiere GH_E2E_USERNAME/GH_E2E_PASSWORD (cuenta de prueba GitHub sin 2FA) y chromium'
    );
    test.setTimeout(120000);

    const expectedHandle = ghHandle(GH_USERNAME!);

    await page.goto('/auth');
    await page.getByRole('button', { name: 'GITHUB' }).click();

    await page.waitForURL(/github\.com\/login/, { timeout: 30000 });
    await page.locator('#login_field').fill(GH_USERNAME!);
    await page.locator('#password').fill(GH_PASSWORD!);
    await page.getByRole('button', { name: /Sign in/i }).click();

    // Primera vez: consentimiento de la OAuth app de Arcade Vault.
    const authorize = page.getByRole('button', { name: /Authorize/i });
    try {
      await authorize.click({ timeout: 10000 });
    } catch {
      // Sin consent pendiente: seguimos.
    }

    await page.waitForURL('http://localhost:3000/');

    const nav = page.locator('.av-nav');
    await expect(nav).toContainText(expectedHandle);
    await expect(
      page.locator('.auth-avatar img[src*="avatars.githubusercontent.com"]')
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'SALIR' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Iniciar Sesión' })
    ).toHaveCount(0);

    // Sesión válida server-side: /cuenta accesible.
    await page.goto('/cuenta');
    await expect(page.locator('.av-nav')).toContainText(expectedHandle);

    // Logout vuelve al estado deslogueado.
    await page.getByRole('button', { name: 'SALIR' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('.av-nav')).toContainText('Iniciar Sesión');
  });
});
