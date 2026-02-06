/**
 * Lists Management Tests
 *
 * Verifies:
 * - Filter universities by sport/division/state
 * - University cards render with logos or fallback icons
 * - Add coaches and save a list
 * - Saved list appears in sidebar
 */
import { test, expect } from '@playwright/test';
import {
  login,
  dismissTour,
  getSessionCookie,
  deleteListByName,
  selectFirstOption,
  createConsoleCollector,
} from './helpers';

const LIST_NAME = `PW List ${Date.now()}`;

test.describe('Lists', () => {
  let sessionCookie: string | null = null;

  test.beforeEach(async ({ page, context }) => {
    await login(page);
    sessionCookie = await getSessionCookie(context);
    await page.goto('/lists');
    await dismissTour(page);
  });

  test.afterEach(async () => {
    if (sessionCookie) {
      await deleteListByName(sessionCookie, LIST_NAME);
    }
  });

  test('university cards render with logos or fallback icons', async ({ page }) => {
    // Select sport/division/state
    await selectFirstOption(page, 'Sport');
    await selectFirstOption(page, 'Division');
    await selectFirstOption(page, 'State');

    // Wait for university cards to load
    await page.waitForSelector('.MuiCardContent-root', { timeout: 20_000 });
    await page.waitForTimeout(2000);

    const cardCount = await page.locator('.MuiCardContent-root').count();
    expect(cardCount).toBeGreaterThan(0);

    // Check logos: each card should have either an img or an svg fallback icon
    const logoImages = await page.locator('.MuiCardContent-root img').count();
    const fallbackIcons = await page.locator('.MuiCardContent-root svg').count();
    expect(logoImages + fallbackIcons).toBeGreaterThan(0);

    // No broken images (naturalWidth > 0 for all loaded images)
    if (logoImages > 0) {
      const brokenCount = await page.evaluate(() => {
        let broken = 0;
        document.querySelectorAll('.MuiCardContent-root img').forEach((img) => {
          const imgEl = img as HTMLImageElement;
          if (imgEl.complete && imgEl.naturalWidth === 0) broken++;
        });
        return broken;
      });
      // Allow brief loading - wait and re-check
      if (brokenCount > 0) {
        await page.waitForTimeout(3000);
        const brokenAfterWait = await page.evaluate(() => {
          let broken = 0;
          document.querySelectorAll('.MuiCardContent-root img').forEach((img) => {
            const imgEl = img as HTMLImageElement;
            if (imgEl.complete && imgEl.naturalWidth === 0) broken++;
          });
          return broken;
        });
        expect(brokenAfterWait).toBe(0);
      }

      // Check lazy loading attribute
      const loadingAttr = await page.locator('.MuiCardContent-root img').first().getAttribute('loading');
      expect(loadingAttr).toBe('lazy');
    }
  });

  test('create and save a list with manual coach', async ({ page }) => {
    const console = createConsoleCollector(page);

    await selectFirstOption(page, 'Sport');
    await selectFirstOption(page, 'Division');
    await selectFirstOption(page, 'State');

    // Wait for universities
    await page.waitForSelector('.MuiCardContent-root', { timeout: 20_000 });

    // Click first university card
    await page.locator('.MuiCardContent-root').first().click();
    await page.waitForTimeout(1000);

    // Add a manual coach entry
    const manualName = page.locator('//label[contains(.,"Full name")]/following::input[1]');
    await manualName.fill('PW Test Coach');
    const manualEmail = page.locator('//label[contains(.,"Email")]/following::input[1]');
    await manualEmail.fill(`pw-coach-${Date.now()}@example.com`);
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForTimeout(500);

    // Name the list
    const listNameInput = page.locator('//label[contains(.,"List name")]/following::input[1]');
    await listNameInput.fill(LIST_NAME);

    // Save the list
    await page.getByRole('button', { name: /save list/i }).click();
    await page.waitForTimeout(2000);

    // Verify success snackbar
    await expect(page.locator('text=List saved successfully')).toBeVisible({ timeout: 5000 });

    // Verify list appears in Saved Lists sidebar
    await page.reload();
    await expect(page.locator(`text=${LIST_NAME}`)).toBeVisible({ timeout: 20_000 });

    console.assertNoErrors();
  });
});
