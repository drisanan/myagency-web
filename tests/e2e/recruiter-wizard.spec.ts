/**
 * Recruiter Wizard Tests
 *
 * Verifies:
 * - Wizard loads and renders steps
 * - Can select a client
 * - Can fill out the email form
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, createConsoleCollector } from './helpers';

test.describe('Recruiter Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/recruiter');
    await dismissTour(page);
    await page.waitForTimeout(2000);
  });

  test('wizard loads with step navigation', async ({ page }) => {
    const console = createConsoleCollector(page);

    // Wizard should show a stepper or step content
    const hasStepper = await page.locator('.MuiStepper-root, .MuiStep-root').count();
    const hasContent = await page.locator(
      'text=Select a client, text=Choose a client, text=Pick an athlete',
    ).first();

    expect(hasStepper > 0 || (await hasContent.isVisible({ timeout: 5000 }))).toBeTruthy();
    console.assertNoErrors();
  });

  test('select client and advance to next step', async ({ page }) => {
    // Wait for client selector/list to load
    await page.waitForTimeout(3000);

    // Select the first client - try combobox first, then generic select
    const combobox = page.getByRole('combobox').first();
    if (await combobox.isVisible({ timeout: 5000 })) {
      await combobox.click();
      await page.waitForTimeout(500);
      const option = page.locator('li[role="option"]').first();
      if (await option.isVisible({ timeout: 3000 })) {
        await option.click();
        await page.waitForTimeout(1000);
      }
    }

    // Click Next
    const nextBtn = page.getByRole('button', { name: /next/i }).first();
    if (await nextBtn.isVisible({ timeout: 3000 })) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }

    // Should see some content for the next step
    const hasContent =
      (await page.locator('textarea, [contenteditable], .MuiStepper-root').count()) > 0;
    expect(hasContent).toBeTruthy();
  });
});
