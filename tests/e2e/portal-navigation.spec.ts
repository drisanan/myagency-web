/**
 * Portal Navigation Tests
 *
 * Verifies:
 * - Agency view has correct sidebar items
 * - All major pages load without errors
 * - Input consistency across pages
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, createConsoleCollector } from './helpers';

const PAGES = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/clients', label: 'Athletes' },
  { path: '/lists', label: 'Lists' },
  { path: '/tasks', label: 'Tasks' },
  { path: '/recruiter', label: 'Recruiter' },
  { path: '/agents', label: 'Agents' },
  { path: '/ai/prompts', label: 'Prompts' },
  { path: '/settings', label: 'Settings' },
];

test.describe('Portal Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('all major pages load without errors', async ({ page }) => {
    const console = createConsoleCollector(page);

    for (const { path, label } of PAGES) {
      await page.goto(path);
      await dismissTour(page);
      await page.waitForTimeout(2000);

      // Page should not show a 404 or blank screen
      const has404 = await page.locator('text=404, text=Not Found').count();
      expect(has404).toBe(0);

      // Should still have a sidebar or main content area
      const sidebar = page.locator('[class*="Drawer"], [class*="sidebar"], main, [class*="AppShell"]');
      expect(await sidebar.count()).toBeGreaterThan(0);
    }

    console.assertNoErrors();
  });

  test('input fields are consistently sized', async ({ page }) => {
    const sizes: Record<string, number[]> = {};

    for (const { path, label } of PAGES) {
      await page.goto(path);
      await dismissTour(page);
      await page.waitForTimeout(1500);

      const heights = await page.evaluate(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="email"]');
        return Array.from(inputs).map((el) => el.getBoundingClientRect().height);
      });

      if (heights.length > 0) {
        sizes[label] = heights;
      }
    }

    // All input heights should be within ±6px of each other
    const allHeights = Object.values(sizes).flat();
    if (allHeights.length > 1) {
      const min = Math.min(...allHeights);
      const max = Math.max(...allHeights);
      expect(max - min).toBeLessThanOrEqual(6);
    }
  });
});
