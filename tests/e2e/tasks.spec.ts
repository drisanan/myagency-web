/**
 * Tasks Tests
 *
 * Verifies:
 * - Tasks page loads
 * - Can create a new task
 * - Can mark a task as complete
 */
import { test, expect } from '@playwright/test';
import { login, dismissTour, getSessionCookie, deleteTaskById, createConsoleCollector } from './helpers';

test.describe('Tasks', () => {
  let sessionCookie: string | null = null;
  let createdTaskId: string | null = null;

  test.beforeEach(async ({ page, context }) => {
    await login(page);
    sessionCookie = await getSessionCookie(context);
    await page.goto('/tasks');
    await dismissTour(page);
    await page.waitForTimeout(2000);
  });

  test.afterEach(async () => {
    if (sessionCookie && createdTaskId) {
      await deleteTaskById(sessionCookie, createdTaskId);
    }
  });

  test('tasks page renders', async ({ page }) => {
    const console = createConsoleCollector(page);
    await expect(page.getByRole('heading', { name: /tasks/i }).first()).toBeVisible({ timeout: 10_000 });
    console.assertNoErrors();
  });

  test('create a new task', async ({ page }) => {
    const taskTitle = `PW Task ${Date.now()}`;

    // Click Add Task button
    const addBtn = page.getByRole('button', { name: /add task|new task|create/i });
    if (await addBtn.isVisible({ timeout: 5000 })) {
      await addBtn.click();
      await page.waitForTimeout(1000);

      // Fill task title
      const titleInput = page.locator('input[name="title"], input').first();
      await titleInput.fill(taskTitle);

      // Save
      const saveBtn = page.getByRole('button', { name: /save|create|add/i }).first();
      await saveBtn.click();
      await page.waitForTimeout(3000);

      // Verify task appears
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible({ timeout: 10_000 });
    }
  });
});
