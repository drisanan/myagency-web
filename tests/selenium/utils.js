const { By, until } = require('selenium-webdriver');

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
  const allowed = ['favicon.ico', 'Hydration failed', '/auth/signup'];
  return logs
    .filter((l) => l.level && l.level.name === 'SEVERE')
    .filter((l) => !allowed.some((sub) => (l.message || '').includes(sub)));
}

module.exports = {
  sleep,
  setSession,
  findAndType,
  selectOption,
  allowlistedConsoleErrors,
};

