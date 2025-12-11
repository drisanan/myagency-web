const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { setSession, findAndType, selectOption, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';
const TEST_EMAIL = `ui-client-${Date.now()}@example.com`;

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Negative path: missing required fields
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });
    await driver.get(`${BASE}/clients/new`);
    // Immediately try to submit
    const nextBtnNeg = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`));
    await nextBtnNeg.click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Please fill all required fields")]`)), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Email is required")]`)), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"First name is required")]`)), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Last name is required")]`)), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Sport is required")]`)), 5000);
    // ensure not navigated
    const url = await driver.getCurrentUrl();
    if (url.includes('/clients') && !url.endsWith('/clients/new')) {
      throw new Error('Unexpected navigation on validation failure');
    }

    // Positive path
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });
    await driver.get(`${BASE}/clients/new`);

    await findAndType(driver, 'Email', TEST_EMAIL);
    await findAndType(driver, 'Password', 'pw12345');
    await findAndType(driver, 'First name', 'Client');
    await findAndType(driver, 'Last name', 'Create');
    await selectOption(driver, 'Sport', 'Football');

    // Advance through steps
    const clickIfExists = async (xpath) => {
      const btns = await driver.findElements(By.xpath(xpath));
      if (btns.length) { await btns[0].click(); return true; }
      return false;
    };
    // Up to 6 steps before final
    for (let i = 0; i < 6; i++) {
      const clicked = await clickIfExists(`//button[normalize-space(.)="Next"]`);
      if (!clicked) break;
      await sleep(200);
    }
    // Final submit
    const submitBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Create Client"]`));
    await submitBtn.click();

    // Wait for navigation/notification
    await sleep(1000);
    await driver.get(`${BASE}/clients`);
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,"MuiDataGrid")]`)), 15000);
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(text(),"${TEST_EMAIL}")]`)), 20000);

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E client create passed with email', TEST_EMAIL);
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

