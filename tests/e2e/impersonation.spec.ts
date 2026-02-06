/**
 * Client Impersonation Tests
 *
 * Verifies the agency can:
 * - Impersonate a client from the Athletes page
 * - See the impersonation banner in the client portal
 * - Stop impersonation and return to the agency view
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, getSessionCookie, deleteClientByEmail, fillByLabel } from './helpers';

const TEST_CLIENT_EMAIL = `pw-impersonate-${Date.now()}@example.com`;

test.describe('Client Impersonation', () => {
  let sessionCookie: string | null = null;

  test.beforeEach(async ({ page, context }) => {
    await login(page);
    sessionCookie = await getSessionCookie(context);
  });

  test.afterEach(async () => {
    // Cleanup: delete test client
    if (sessionCookie) {
      await deleteClientByEmail(sessionCookie, TEST_CLIENT_EMAIL);
    }
  });

  test('impersonate client and stop impersonation', async ({ page }) => {
    // Create a test client to impersonate
    await page.goto('/clients/new');
    await dismissTour(page);
    await page.waitForTimeout(1000);

    await fillByLabel(page, 'Athlete Email', TEST_CLIENT_EMAIL);
    await fillByLabel(page, 'Access Code', '654321');
    await fillByLabel(page, 'First name', 'Playwright');
    await fillByLabel(page, 'Last name', 'Impersonate');
    await fillByLabel(page, 'Phone', '5551234567');

    // Select sport using accessible combobox role
    const sportSelect = page.getByRole('combobox', { name: 'Sport' });
    await sportSelect.click();
    await page.locator('li:has-text("Football")').first().click();
    await page.waitForTimeout(500);

    // Click through wizard steps
    for (let i = 0; i < 7; i++) {
      try {
        const nextBtn = page.getByRole('button', { name: /^next$/i });
        if (await nextBtn.isVisible({ timeout: 3000 })) {
          await nextBtn.click();
          await page.waitForTimeout(800);
        }
      } catch {
        break;
      }
    }

    // Try to save
    try {
      const saveBtn = page.getByRole('button', { name: /save|create/i });
      if (await saveBtn.isVisible({ timeout: 3000 })) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
    } catch {
      /* already saved */
    }

    // Navigate to Athletes page
    await page.goto('/clients');
    await dismissTour(page);
    await page.waitForTimeout(2000);

    // Find and click an Impersonate button
    const impersonateBtn = page.getByRole('button', { name: /impersonate/i }).first();
    await expect(impersonateBtn).toBeVisible({ timeout: 10_000 });
    await impersonateBtn.click();
    await page.waitForTimeout(2000);

    // Verify redirected to client portal
    expect(page.url()).toContain('/client/');

    // Verify impersonation banner or End button is visible
    const endBtn = page.locator('button:has-text("End"), button:has-text("Stop Impersonating")');
    await expect(endBtn.first()).toBeVisible({ timeout: 10_000 });

    // Stop impersonation
    await endBtn.first().click();

    // Should navigate back to /clients (agency view)
    await page.waitForURL(/\/clients/, { timeout: 20_000 });
    await page.waitForTimeout(5000);

    // Verify we're on the agency clients page (not client portal)
    const currentUrl = page.url();
    // Should be on /clients (not /client/*)
    expect(currentUrl).toMatch(/\/clients(?!\/)/);
  });
});
