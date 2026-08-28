import { test, expect } from '@playwright/test';

// Usuario único por run con timestamp para no chocar con el unique de
// profiles.username escasos de email. OAuth y reset por email quedan fuera
// del E2E (dependen de servicios externos) — se verifican manualmente.
const unique = Date.now().toString().slice(-6);
const EMAIL = `e2e_${unique}@vault.test`;
const PASSWORD = 'clave-secreta-123';
const USERNAME = `px_${unique}`;

test.describe('Auth', () => {
  test('registro crea sesión y el nav muestra el username', async({
    page,
  }) => {
    await page.goto(`/auth?redirect=/`);

    await page.getByRole('button', { name: 'CREAR CUENTA' }).click();

    await page.getByLabel('Nombre de usuario').fill(USERNAME);
    await page.getByLabel('Correo electrónico').fill(EMAIL);
    await page.getByLabel('Contraseña').fill(PASSWORD);

    await page.getByRole('button', { name: 'CREAR Y JUGAR' }).click();

    // El registro redirige a la home y el nav muestra el username real.
    await expect(page).toHaveURL('/');
    await expect(page.locator('.av-nav')).toContainText(USERNAME);
  });

  test('login con credenciales correctas muestra el username', async({
    page,
  }) => {
    await page.goto('/auth');

    await page.getByLabel('Correo electrónico').fill(EMAIL);
    await page.getByLabel('Contraseña').fill(PASSWORD);

    await page.getByRole('button', { name: 'ENTRAR AL VAULT' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('.av-nav')).toContainText(USERNAME);
  });

  test('login con contraseña incorrecta muestra error', async({ page }) => {
    await page.goto('/auth');

    await page.getByLabel('Correo electrónico').fill(EMAIL);
    await page.getByLabel('Contraseña').fill('contrasena-mala');

    await page.getByRole('button', { name: 'ENTRAR AL VAULT' }).click();

    await expect(
      page.getByText('Correo o contraseña incorrectos.')
    ).toBeVisible();
  });

  test('logout devuelve el nav a Iniciar Sesión', async({ page }) => {
    await page.goto('/auth');

    await page.getByLabel('Correo electrónico').fill(EMAIL);
    await page.getByLabel('Contraseña').fill(PASSWORD);
    await page.getByRole('button', { name: 'ENTRAR AL VAULT' }).click();

    await expect(page.locator('.av-nav')).toContainText(USERNAME);

    // Botón SALIR del nav desktop dispara signOutAction y vuelve a home.
    await page.getByRole('button', { name: 'SALIR' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('.av-nav')).toContainText('Iniciar Sesión');
  });

  test('?redirect= tras login devuelve al juego', async({ page }) => {
    await page.goto('/auth?redirect=/games/asteroids');

    await page.getByLabel('Correo electrónico').fill(EMAIL);
    await page.getByLabel('Contraseña').fill(PASSWORD);
    await page.getByRole('button', { name: 'ENTRAR AL VAULT' }).click();

    await expect(page).toHaveURL('/games/asteroids');
  });

  test('/cuenta sin sesión redirige a /auth', async({ page }) => {
    await page.goto('/cuenta');

    await expect(page).toHaveURL(/\/auth\?redirect=%2Fcuenta/);
  });
});
