const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { allowlistedConsoleErrors } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ERROR_SELECTOR = `//*[contains(text(),"Login failed") or contains(text(),"Invalid access code") or contains(text(),"Invalid phone") or contains(text(),"Access code must be digits only") or contains(text(),"Phone must be digits only") or contains(text(),"Invalid email") or contains(text(),"Required") or contains(text(),"Lookup failed")]`;

async function runCase({ email, phone, access, expectText, selectorOverride }) {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  try {
    await driver.get(`${BASE}/auth/login`);
    if (email !== undefined) await driver.findElement(By.xpath(`//label[contains(., "Email")]/following::input[1]`)).sendKeys(email);
    if (phone !== undefined) await driver.findElement(By.xpath(`//label[contains(., "Phone")]/following::input[1]`)).sendKeys(phone);
    if (access !== undefined) await driver.findElement(By.xpath(`//label[contains(., "Access Code")]/following::input[1]`)).sendKeys(access);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    const selector = selectorOverride || `//*[contains(text(),"${expectText}")]`;
    await driver.wait(until.elementLocated(By.xpath(selector)), 15000);
    // Also ensure we have not navigated to dashboard
    const dashboards = await driver.findElements(By.xpath(`//*[contains(text(),"Dashboard")]`));
    if (dashboards.length) throw new Error('Unexpected dashboard navigation on negative case');
    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    const filtered = errors.filter(
      (e) =>
        !String(e.message || '').includes('/api/auth/ghl-login') &&
        !String(e.message || '').includes('/auth/login')
    );
    if (filtered.length) throw new Error('Console errors detected: ' + JSON.stringify(filtered));
  } finally {
    await driver.quit();
  }
}

async function run() {
  const which = process.argv.find((a) => a && a.startsWith('--case='))?.split('=')[1] || 'all';
  const cases = [];
  if (which === 'all' || which === 'missing') cases.push({ email: '', phone: '', access: '', expectText: 'Required' });
  if (which === 'all' || which === 'bad-email') cases.push({ email: 'bad-email', phone: '2084407940', access: '123456', expectText: 'Invalid email' });
  if (which === 'all' || which === 'bad-phone') cases.push({ email: 'user@example.com', phone: 'abc', access: '123456', expectText: 'Phone must be digits only' });
  if (which === 'all' || which === 'bad-access') cases.push({ email: 'user@example.com', phone: '2084407940', access: 'abc', expectText: 'Access code must be digits only' });
  if (which === 'all' || which === 'no-user') cases.push({ email: 'missing@example.com', phone: '1112223333', access: '123456', expectText: 'Lookup failed', selectorOverride: ERROR_SELECTOR });
  if (which === 'all' || which === 'bad-code') cases.push({ email: 'drisanjames@gmail.com', phone: '2084407940', access: '999999', expectText: 'Invalid access code', selectorOverride: ERROR_SELECTOR });

  for (const c of cases) {
    await runCase(c);
  }
  console.log('Negative login cases passed', which);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

