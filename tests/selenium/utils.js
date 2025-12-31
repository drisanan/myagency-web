const { By, until } = require('selenium-webdriver');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function setSession(driver, baseUrl, sessionObj) {
  await driver.get(`${baseUrl}/auth/login`);
  const api = process.env.API_BASE_URL;
  if (!api) throw new Error('API_BASE_URL not set for session');
  await driver.executeAsyncScript(
    `
    const cb = arguments[arguments.length - 1];
    const payload = ${JSON.stringify(sessionObj)};
    fetch('${api}/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        agencyId: payload.agencyId || 'agency-001',
        email: payload.email,
        role: payload.role || 'agency',
        userId: payload.userId || 'selenium-user'
      })
    }).then(() => {
      // Set a localhost session cookie so the Next app (localhost origin) sees the session without relying solely on API cookies.
      document.cookie = "session="+encodeURIComponent(JSON.stringify({ role: 'agency', email: payload.email, agencyId: payload.agencyId || 'agency-001' }))+"; path=/";
      cb();
    }).catch((e) => cb(e?.message || 'session error'));
    `
  );
  await driver.navigate().refresh();
}

async function findAndType(driver, labelText, value) {
  const locator = By.xpath(`//label[contains(., "${labelText}")]/following::input[1] | //label[contains(., "${labelText}")]/following::textarea[1]`);
  let lastErr;
  for (let i = 0; i < 4; i++) {
    try {
      const input = await driver.wait(until.elementLocated(locator), 20000);
      await driver.wait(until.elementIsVisible(input), 10000);
      await input.clear().catch(() => {});
      await input.sendKeys(value);
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function selectOption(driver, labelText, optionText) {
  const select = await driver.findElement(
    By.xpath(`//label[contains(., "${labelText}")]/following::div[contains(@class,"MuiSelect")]`)
  );
  await select.click();
  const opt = await driver.wait(until.elementLocated(By.xpath(`//li[normalize-space(.)="${optionText}"]`)), 5000);
  await opt.click();
}

async function allowlistedConsoleErrors(logs) {
  const allowed = [
    'favicon.ico', 
    'Hydration failed', 
    '/auth/signup',
    'Missing session',
    'Failed to fetch agency settings',
    '401',
  ];
  return logs
    .filter((l) => l.level && l.level.name === 'SEVERE')
    .filter((l) => !allowed.some((sub) => (l.message || '').includes(sub)));
}

// --- Cleanup Helpers ---
// Delete a client via API (requires session cookie)
async function deleteClientViaApi(apiBase, sessionCookie, clientId) {
  if (!clientId) return;
  try {
    const res = await fetch(`${apiBase}/clients/${clientId}`, {
      method: 'DELETE',
      headers: { Cookie: `an_session=${sessionCookie}` },
    });
    if (!res.ok) console.warn(`Failed to delete client ${clientId}: ${res.status}`);
  } catch (e) {
    console.warn(`Cleanup error (client): ${e.message}`);
  }
}

// Find client by email and delete
async function deleteClientByEmail(apiBase, sessionCookie, email) {
  if (!email) return;
  try {
    const res = await fetch(`${apiBase}/clients`, {
      headers: { Cookie: `an_session=${sessionCookie}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    const clients = data?.clients || data?.data || [];
    const client = clients.find((c) => c.email === email);
    if (client?.id) {
      await deleteClientViaApi(apiBase, sessionCookie, client.id);
    }
  } catch (e) {
    console.warn(`Cleanup error (client by email): ${e.message}`);
  }
}

// Delete a list via API
async function deleteListViaApi(apiBase, sessionCookie, listId) {
  if (!listId) return;
  try {
    const res = await fetch(`${apiBase}/lists/${listId}`, {
      method: 'DELETE',
      headers: { Cookie: `an_session=${sessionCookie}` },
    });
    if (!res.ok) console.warn(`Failed to delete list ${listId}: ${res.status}`);
  } catch (e) {
    console.warn(`Cleanup error (list): ${e.message}`);
  }
}

// Find list by name and delete
async function deleteListByName(apiBase, sessionCookie, name) {
  if (!name) return;
  try {
    const res = await fetch(`${apiBase}/lists`, {
      headers: { Cookie: `an_session=${sessionCookie}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    const lists = data?.lists || data?.data || [];
    const list = lists.find((l) => l.name === name);
    if (list?.id) {
      await deleteListViaApi(apiBase, sessionCookie, list.id);
    }
  } catch (e) {
    console.warn(`Cleanup error (list by name): ${e.message}`);
  }
}

// Delete a task via API
async function deleteTaskViaApi(apiBase, sessionCookie, taskId) {
  if (!taskId) return;
  try {
    const res = await fetch(`${apiBase}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Cookie: `an_session=${sessionCookie}` },
    });
    if (!res.ok) console.warn(`Failed to delete task ${taskId}: ${res.status}`);
  } catch (e) {
    console.warn(`Cleanup error (task): ${e.message}`);
  }
}

// Get session cookie from driver
async function getSessionCookie(driver) {
  const cookie = await driver.manage().getCookie('an_session');
  return cookie?.value || null;
}

// Dismiss any driver.js tour overlay
async function dismissTour(driver, tourKeys = []) {
  await driver.executeScript(`
    // Mark specified tours as completed
    const keys = arguments[0];
    keys.forEach(k => localStorage.setItem('tour_completed_' + k, 'true'));
    // Also mark common tours
    ['dashboard', 'athletes', 'prompts', 'lists', 'tasks', 'recruiter', 'client-lists', 'client-tasks'].forEach(k => localStorage.setItem('tour_completed_' + k, 'true'));
    // Remove any visible tour elements
    document.querySelectorAll('.driver-popover, .driver-overlay, .driver-active-element').forEach(el => el.remove());
  `, tourKeys);
}

module.exports = {
  sleep,
  setSession,
  findAndType,
  selectOption,
  allowlistedConsoleErrors,
  deleteClientViaApi,
  deleteClientByEmail,
  deleteListViaApi,
  deleteListByName,
  deleteTaskViaApi,
  getSessionCookie,
  dismissTour,
};

