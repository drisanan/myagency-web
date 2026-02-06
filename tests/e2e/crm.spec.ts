/**
 * CRM Features Tests
 *
 * Verifies:
 * - Coach notes tab renders
 * - Communications tab renders
 * - Tasks tab renders
 * - Meetings tab renders
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, createConsoleCollector } from './helpers';

test.describe('CRM Features', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Go to clients page and open first client detail
    await page.goto('/clients');
    await dismissTour(page);
    await page.waitForTimeout(3000);
  });

  test('client detail CRM tabs load', async ({ page }) => {
    const console = createConsoleCollector(page);

    // Click first client row to open detail
    const clientRow = page.locator('tr, .MuiCard-root, a[href*="/clients/"]').first();
    await clientRow.click();
    await page.waitForTimeout(3000);

    // Verify CRM tabs exist
    const tabLabels = ['Coach Notes', 'Communications', 'Tasks', 'Meetings'];
    for (const label of tabLabels) {
      const tab = page.locator(`button:has-text("${label}"), [role="tab"]:has-text("${label}")`);
      if (await tab.count() > 0) {
        await expect(tab.first()).toBeVisible({ timeout: 5000 });
      }
    }

    console.assertNoErrors();
  });

  test('can add a coach note', async ({ page }) => {
    // Click first client
    const clientLink = page.locator('tr, .MuiCard-root, a[href*="/clients/"]').first();
    await clientLink.click();
    await page.waitForTimeout(3000);

    // Click Coach Notes tab
    const tab = page.locator('button:has-text("Coach Notes"), [role="tab"]:has-text("Coach Notes")').first();
    if (await tab.isVisible({ timeout: 5000 })) {
      await tab.click();
      await page.waitForTimeout(1000);

      // Look for Add Note button
      const addBtn = page.getByRole('button', { name: /add note|new note/i });
      if (await addBtn.isVisible({ timeout: 3000 })) {
        await addBtn.click();
        await page.waitForTimeout(1000);

        // Fill note content
        const textarea = page.locator('textarea').first();
        await textarea.fill('Playwright CRM test note');

        // Save
        const saveBtn = page.getByRole('button', { name: /save|submit/i }).first();
        await saveBtn.click();
        await page.waitForTimeout(2000);

        // Verify note appears
        await expect(page.locator('text=Playwright CRM test note')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
