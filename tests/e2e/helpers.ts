/**
 * Shared Playwright test helpers
 */
import { type Page, type BrowserContext, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';

// ── Auth ──

export const DEFAULT_CREDENTIALS = {
  email: process.env.TEST_EMAIL || 'drisanjames@gmail.com',
  phone: process.env.TEST_PHONE || '2084407940',
  accessCode: process.env.TEST_ACCESS || '123456',
};

/**
 * Login as the default agency user.
 * Fills the login form and waits for the dashboard.
 */
export async function login(
  page: Page,
  credentials = DEFAULT_CREDENTIALS,
) {
  await page.goto('/auth/login');
  await fillByLabel(page, 'Email', credentials.email);
  await fillByLabel(page, 'Phone', credentials.phone);
  await fillByLabel(page, 'Access Code', credentials.accessCode);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(dashboard|clients|lists)/, { timeout: 20_000 });
  await dismissTour(page);
}

/**
 * Get the an_session cookie value from the browser context.
 */
export async function getSessionCookie(context: BrowserContext): Promise<string | null> {
  const cookies = await context.cookies();
  const session = cookies.find((c) => c.name === 'an_session');
  return session?.value ?? null;
}

// ── Form helpers ──

/**
 * Find an input by its associated label text and fill it.
 * Finds an input by label and fills it with a value.
 */
export async function fillByLabel(page: Page, label: string, value: string) {
  const input = page.locator(
    `//label[contains(., "${label}")]/following::input[1] | //label[contains(., "${label}")]/following::textarea[1]`,
  );
  await input.waitFor({ state: 'visible', timeout: 15_000 });
  await input.fill(value);
}

/**
 * Select a MUI dropdown option by label text.
 */
export async function selectOption(page: Page, label: string, option: string) {
  // Click the MUI Select trigger
  const select = page.locator(
    `//label[contains(., "${label}")]/following::div[contains(@class,"MuiSelect-select")][1]`,
  );
  await select.click();
  // Click the option in the opened listbox
  await page.locator(`li:has-text("${option}")`).first().click();
}

/**
 * Select the first available option in a MUI Select dropdown.
 */
export async function selectFirstOption(page: Page, label: string) {
  const select = page.locator(
    `//label[contains(., "${label}")]/following::div[contains(@class,"MuiSelect-select")][1]`,
  );
  await select.waitFor({ timeout: 15_000 });
  await select.click();
  await page.locator('ul li').first().click();
}

// ── Tour / Overlay ──

/**
 * Dismiss any driver.js tour overlay by marking all tours complete
 * and removing the overlay elements + body class.
 */
export async function dismissTour(page: Page) {
  await page.evaluate(() => {
    const tours = [
      'dashboard', 'athletes', 'prompts', 'lists', 'tasks',
      'recruiter', 'client-lists', 'client-tasks',
    ];
    tours.forEach((k) => localStorage.setItem(`tour_completed_${k}`, 'true'));
    // Remove overlay elements
    document
      .querySelectorAll('.driver-popover, .driver-overlay, .driver-active-element, .driver-popover-tip')
      .forEach((el) => el.remove());
    // Remove the body class that blocks pointer events
    document.body.classList.remove('driver-active', 'driver-fade');
    document.body.style.pointerEvents = '';
  });
  // Small wait for DOM to settle
  await page.waitForTimeout(500);
}

// ── API cleanup helpers ──

async function apiFetch(path: string, sessionCookie: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `an_session=${sessionCookie}`,
      ...(init?.headers as Record<string, string>),
    },
  });
}

/**
 * Delete a client by email via the API (cleanup after tests).
 */
export async function deleteClientByEmail(sessionCookie: string, email: string) {
  if (!email || !sessionCookie) return;
  try {
    const res = await apiFetch('/clients', sessionCookie);
    if (!res.ok) return;
    const data = await res.json();
    const clients: any[] = data?.clients ?? [];
    const client = clients.find((c: any) => c.email === email);
    if (client?.id) {
      await apiFetch(`/clients/${client.id}`, sessionCookie, { method: 'DELETE' });
    }
  } catch (e: any) {
    console.warn(`Cleanup (client): ${e.message}`);
  }
}

/**
 * Delete a list by name via the API (cleanup after tests).
 */
export async function deleteListByName(sessionCookie: string, name: string) {
  if (!name || !sessionCookie) return;
  try {
    const res = await apiFetch('/lists', sessionCookie);
    if (!res.ok) return;
    const data = await res.json();
    const lists: any[] = data?.lists ?? [];
    const list = lists.find((l: any) => l.name === name);
    if (list?.id) {
      await apiFetch(`/lists/${list.id}`, sessionCookie, { method: 'DELETE' });
    }
  } catch (e: any) {
    console.warn(`Cleanup (list): ${e.message}`);
  }
}

/**
 * Delete a task by ID via the API (cleanup after tests).
 */
export async function deleteTaskById(sessionCookie: string, taskId: string) {
  if (!taskId || !sessionCookie) return;
  try {
    await apiFetch(`/tasks/${taskId}`, sessionCookie, { method: 'DELETE' });
  } catch (e: any) {
    console.warn(`Cleanup (task): ${e.message}`);
  }
}

// ── Console error checking ──

const ALLOWLISTED_ERRORS = [
  'favicon.ico',
  'Hydration failed',
  'error #418',
  'error #423',
  '/auth/signup',
  'Missing session',
  'Failed to fetch agency settings',
  '401',
  '404',
  'Sync failed',
  'Not found',
];

/**
 * Collect console errors from the page, filtering out known/expected ones.
 */
export function createConsoleCollector(page: Page) {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const isAllowed = ALLOWLISTED_ERRORS.some((a) => text.includes(a));
      if (!isAllowed) errors.push(text);
    }
  });

  return {
    /** Return only unexpected console errors */
    getErrors: () => [...errors],
    /** Assert no unexpected console errors occurred */
    assertNoErrors: () => {
      if (errors.length > 0) {
        throw new Error(`Unexpected console errors:\n${errors.join('\n')}`);
      }
    },
  };
}

// ── SPA detection ──

/**
 * Inject a marker variable to detect full page reloads.
 * Call `assertNoReload` after navigation to verify SPA behavior.
 */
export async function markSpaContext(page: Page) {
  await page.evaluate(() => {
    (window as any).__pw_spa_marker = Date.now().toString();
  });
}

/**
 * Assert no full page reload happened since `markSpaContext`.
 */
export async function assertNoReload(page: Page) {
  const marker = await page.evaluate(() => (window as any).__pw_spa_marker);
  expect(marker).toBeTruthy();
}
