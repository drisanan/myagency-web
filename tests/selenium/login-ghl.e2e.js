const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = 'drisanjames@gmail.com';
const PHONE = '2084407940';
const ACCESS = '123456';

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(`${BASE}/auth/login`);

    await driver.findElement(By.xpath(`//label[contains(., "Email")]/following::input[1]`)).sendKeys(EMAIL);
    await driver.findElement(By.xpath(`//label[contains(., "Phone")]/following::input[1]`)).sendKeys(PHONE);
    await driver.findElement(By.xpath(`//label[contains(., "Access Code")]/following::input[1]`)).sendKeys(ACCESS);

    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();

    // Wait for spinner to appear, then dashboard
    await driver.wait(until.elementLocated(By.css('[data-testid="login-spinner"]')), 10000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);

    const logs = await driver.manage().logs().get('browser');
    const errs = await allowlistedConsoleErrors(logs);
    const errors = errs.filter(
      (e) => !String(e.message || '').includes('/auth/login')
    );
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }
    console.log('GHL login e2e passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

