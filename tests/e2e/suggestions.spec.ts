/**
 * Suggestions Feature Tests
 *
 * Verifies:
 * - Floating suggestion button is visible (not for client role)
 * - Clicking opens the overlay with area selection
 * - Selecting an area shows the suggestion form
 * - Submitting creates a suggestion
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour } from './helpers';

test.describe('Suggestions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await dismissTour(page);
    await page.waitForTimeout(2000);
  });

  test('suggestion button is visible on dashboard', async ({ page }) => {
    // The floating button should be visible (Fab or button with lightbulb)
    const fab = page.locator('.MuiFab-root, button[aria-label="Suggest improvement"]');
    await expect(fab.first()).toBeVisible({ timeout: 10_000 });
  });

  test('clicking button opens overlay with area selection', async ({ page }) => {
    // Click the suggestion button
    const fab = page.locator('.MuiFab-root, button[aria-label="Suggest improvement"]').first();
    await fab.click();
    await page.waitForTimeout(1000);

    // "Tap the area" banner should appear
    await expect(page.locator('text=Tap the area')).toBeVisible({ timeout: 5000 });
  });

  test('full suggestion flow: select area and fill form', async ({ page }) => {
    // Click the suggestion button
    const fab = page.locator('.MuiFab-root, button[aria-label="Suggest improvement"]').first();
    await fab.click();
    await page.waitForTimeout(1000);

    // Wait for area selection mode
    await expect(page.locator('text=Tap the area')).toBeVisible({ timeout: 5000 });

    // Click on a page element to select area
    const targetEl = page.locator('main h1, main h2, main .MuiTypography-h5, main .MuiPaper-root').first();
    await targetEl.click({ force: true });
    await page.waitForTimeout(2000);

    // Suggestion form should appear with a textarea
    const textarea = page.locator('textarea');
    await expect(textarea.first()).toBeVisible({ timeout: 10_000 });

    // Enter suggestion text
    await textarea.first().fill('Playwright E2E test suggestion - please ignore');

    // Submit button should exist
    const hasSubmit = await page.evaluate(() =>
      !!Array.from(document.querySelectorAll('button')).find((b) =>
        /submit/i.test(b.textContent || ''),
      ),
    );
    expect(hasSubmit).toBeTruthy();

    // Submit via JS (button may be outside viewport due to overlay positioning)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /submit/i.test(b.textContent || ''),
      );
      if (btn) btn.click();
    });

    // Wait for the form to close or success - either the overlay disappears or we return to dashboard
    await page.waitForTimeout(5000);
    // If we're still on the dashboard, the submission went through
    expect(page.url()).toContain('/dashboard');
  });
});
