const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { findAndType, selectOption, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = `ui-client-${Date.now()}@example.com`;
const LOGIN_EMAIL = 'drisanjames@gmail.com';
const LOGIN_PHONE = '2084407940';
const LOGIN_CODE = '123456';

async function login(driver) {
  await driver.get(`${BASE}/auth/login`);
  await findAndType(driver, 'Email', LOGIN_EMAIL);
  await findAndType(driver, 'Phone', LOGIN_PHONE);
  await findAndType(driver, 'Access Code', LOGIN_CODE);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await login(driver);
    await driver.get(`${BASE}/clients/new`);

    await findAndType(driver, 'Email', TEST_EMAIL);
    await findAndType(driver, 'Password', 'pw12345');
    await findAndType(driver, 'First name', 'Client');
    await findAndType(driver, 'Last name', 'Create');
    await selectOption(driver, 'Sport', 'Football');

    const createBtn =
      (await driver.findElements(By.xpath(`//button[normalize-space(.)="Create Client"]`)))[0] ||
      (await driver.findElements(By.xpath(`//button[normalize-space(.)="Save"]`)))[0];
    if (!createBtn) throw new Error('Create/Save button not found');
    await createBtn.click();

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

