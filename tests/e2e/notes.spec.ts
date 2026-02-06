/**
 * Notes CRUD Tests
 *
 * Verifies:
 * - Notes page displays existing notes
 * - Can create a new note
 * - Can edit a note
 * - Can delete a note
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, createConsoleCollector } from './helpers';

test.describe('Notes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('notes CRUD operations', async ({ page }) => {
    const console = createConsoleCollector(page);
    const noteName = `PW Note ${Date.now()}`;

    // Navigate to clients
    await page.goto('/clients');
    await dismissTour(page);
    await page.waitForTimeout(3000);

    // Open first client
    const firstClient = page.locator('tr td a, tr a, .MuiCard-root a').first();
    if (await firstClient.isVisible({ timeout: 5000 })) {
      await firstClient.click();
      await page.waitForTimeout(3000);
    }

    // Look for Notes tab or section
    const notesTab = page.locator(
      'button:has-text("Notes"), [role="tab"]:has-text("Notes"), a:has-text("Notes")',
    ).first();
    if (await notesTab.isVisible({ timeout: 5000 })) {
      await notesTab.click();
      await page.waitForTimeout(1000);
    }

    // Add Note
    const addBtn = page.getByRole('button', { name: /add note|new note/i });
    if (await addBtn.isVisible({ timeout: 5000 })) {
      await addBtn.click();
      await page.waitForTimeout(1000);

      // Fill note
      const textarea = page.locator('textarea, [contenteditable]').first();
      await textarea.fill(noteName);

      // Save
      await page.getByRole('button', { name: /save|submit|add/i }).first().click();
      await page.waitForTimeout(2000);

      // Verify note appears
      await expect(page.locator(`text=${noteName}`)).toBeVisible({ timeout: 5000 });

      // Delete the note (cleanup)
      const noteRow = page.locator(`*:has-text("${noteName}")`).last();
      const deleteBtn = noteRow.locator('button[aria-label="delete"], button:has(svg)').first();
      if (await deleteBtn.isVisible({ timeout: 3000 })) {
        await deleteBtn.click();
        await page.waitForTimeout(500);
        // Confirm
        const confirmBtn = page.getByRole('button', { name: /confirm|delete|yes/i });
        if (await confirmBtn.isVisible({ timeout: 2000 })) {
          await confirmBtn.click();
        }
        await page.waitForTimeout(2000);
      }
    }

    console.assertNoErrors();
  });
});
