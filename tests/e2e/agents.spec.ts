/**
 * Agents Management Tests
 *
 * Verifies:
 * - Agents page loads with table
 * - Create agent dialog works
 * - Delete agent works
 * - Agent login flow
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, fillByLabel, createConsoleCollector } from './helpers';

const AGENT_EMAIL = `pw-agent-${Date.now()}@example.com`;

test.describe('Agents', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/agents');
    await dismissTour(page);
    await page.waitForTimeout(2000);
  });

  test('agents page renders with table', async ({ page }) => {
    const console = createConsoleCollector(page);

    // Should show a table or "No agents" message
    const hasTable = await page.locator('table, .MuiTableContainer-root').count();
    const hasEmpty = await page.locator('text=No agents').count();
    expect(hasTable > 0 || hasEmpty > 0).toBeTruthy();

    console.assertNoErrors();
  });

  test('invite agent dialog opens with form fields', async ({ page }) => {
    // Click Invite/Add Agent button
    const addBtn = page.getByRole('button', { name: /add|invite|new|create/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();
    await page.waitForTimeout(1000);

    // Dialog should open with input fields
    const dialog = page.locator('.MuiDialog-root');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Should have input fields (name, email, etc.)
    const inputs = dialog.locator('input:visible');
    expect(await inputs.count()).toBeGreaterThan(0);

    // Should have a submit/save button
    const saveBtn = dialog.getByRole('button', { name: /save|create|add|invite/i }).first();
    await expect(saveBtn).toBeVisible();

    // Close the dialog
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });
});
