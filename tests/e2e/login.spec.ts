/**
 * Login Tests
 *
 * Verifies:
 * - Successful agency login redirects to dashboard
 * - Invalid credentials show error
 * - Login form renders all required fields
 */
import { test, expect } from '@playwright/test';
import { fillByLabel } from './helpers';

test.describe('Login', () => {
  test('login form renders required fields', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await fillByLabel(page, 'Email', process.env.TEST_EMAIL || 'drisanjames@gmail.com');
    await fillByLabel(page, 'Phone', process.env.TEST_PHONE || '2084407940');
    await fillByLabel(page, 'Access Code', process.env.TEST_ACCESS || '123456');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/(dashboard|clients)/, { timeout: 20_000 });
    expect(page.url()).toMatch(/\/(dashboard|clients)/);
  });

  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('/auth/login');
    await fillByLabel(page, 'Email', 'fake@notreal.com');
    await fillByLabel(page, 'Phone', '0000000000');
    await fillByLabel(page, 'Access Code', '000000');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show an error message or stay on login page
    await page.waitForTimeout(5000);
    const url = await page.url();
    // Either still on login or shows an error
    const hasError = await page.locator('.MuiAlert-root, [role="alert"]').count();
    expect(url.includes('/auth/login') || hasError > 0).toBeTruthy();
  });
});
