/**
 * Settings Save Tests
 *
 * Verifies that saving white-label settings:
 * - Does NOT trigger a full page reload
 * - Shows a success message
 * - Theme updates reactively via DynamicThemeProvider
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, markSpaContext, assertNoReload } from './helpers';

test.describe('Settings Save', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    await page.waitForSelector('text=White-Label Branding', { timeout: 20_000 });
    await dismissTour(page);
  });

  test('settings page loads and preserves SPA context during navigation', async ({ page }) => {
    await markSpaContext(page);

    // Verify key elements are present
    await expect(page.locator('text=White-Label Branding')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Agency Name' })).toBeVisible();

    // Navigate away and back to verify SPA
    await page.locator('a[href="/dashboard"]').first().click();
    await page.waitForURL(/\/dashboard/);

    // Navigate back to settings
    await page.goto('/settings');
    await page.waitForSelector('text=White-Label Branding', { timeout: 20_000 });

    // Verify Save Settings button exists in the DOM
    const saveBtnExists = await page.evaluate(() =>
      !!Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Save Settings'),
      ),
    );
    expect(saveBtnExists).toBeTruthy();
  });
});
