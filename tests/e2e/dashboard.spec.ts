/**
 * Dashboard Tests
 *
 * Verifies:
 * - Dashboard loads after login
 * - Metric cards are visible
 * - Commits tables render
 * - Navigation items are present in sidebar
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, createConsoleCollector } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dashboard loads with metrics and navigation', async ({ page }) => {
    const console = createConsoleCollector(page);

    // Should be on /dashboard after login
    expect(page.url()).toContain('/dashboard');

    // Sidebar navigation items should be visible (use .first() to avoid strict mode)
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Athletes' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Lists' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tasks' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Recruiter' }).first()).toBeVisible();

    // Wait for dashboard content to load
    await page.waitForTimeout(3000);

    // Metric cards or commits tables should render
    const hasPapers = await page.locator('.MuiPaper-root').count();
    expect(hasPapers).toBeGreaterThan(0);

    console.assertNoErrors();
  });

  test('notification bell is visible', async ({ page }) => {
    // Bell icon should be present
    const bell = page.locator('button[aria-label="Tasks alerts"]');
    await expect(bell).toBeVisible({ timeout: 10_000 });

    // Click opens task popover
    await bell.click();
    await page.waitForTimeout(500);

    // Should show task heading in popover
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  });
});
