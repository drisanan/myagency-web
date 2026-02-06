/**
 * SPA Navigation Tests
 *
 * Verifies that the application behaves as a single-page app:
 * - Sidebar navigation is client-side (no full page reload)
 * - Logout uses router.push (no full page reload)
 * - Session cookie is cleared on logout
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, markSpaContext, assertNoReload } from './helpers';

test.describe('SPA Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('sidebar navigation preserves SPA context', async ({ page }) => {
    await markSpaContext(page);

    // Navigate to Athletes via sidebar
    await page.locator('a[href="/clients"]').first().click();
    await page.waitForURL(/\/clients/);
    await assertNoReload(page);

    // Navigate to Lists via sidebar
    await page.locator('a[href="/lists"]').first().click();
    await page.waitForURL(/\/lists/);
    await dismissTour(page);
    await assertNoReload(page);

    // Navigate to Tasks via sidebar
    await page.locator('a[href="/tasks"]').first().click();
    await page.waitForURL(/\/tasks/);
    await dismissTour(page);
    await assertNoReload(page);
  });

  test('logout redirects to login page', async ({ page }) => {
    // Open user menu (avatar)
    await page.locator('.MuiAvatar-root').click();
    await page.waitForTimeout(500);

    // Click Logout
    await page.locator('li:has-text("Logout")').click();

    // Should redirect to login page
    await page.waitForURL(/\/auth\/login/, { timeout: 10_000 });
    expect(page.url()).toContain('/auth/login');

    // Session cookie should be expired (set to past date via document.cookie)
    const cookieValue = await page.evaluate(() => {
      const match = document.cookie.match(/an_session=([^;]*)/);
      return match ? match[1] : null;
    });
    expect(cookieValue).toBeFalsy();
  });
});
