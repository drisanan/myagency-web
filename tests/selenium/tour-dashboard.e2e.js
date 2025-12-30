const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE_URL = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const LOGIN_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const LOGIN_PHONE = process.env.TEST_PHONE || '2084407940';
const LOGIN_CODE = process.env.TEST_ACCESS || '123456';

async function login(driver) {
  await driver.get(`${BASE_URL}/auth/login`);
  await findAndType(driver, 'Email', LOGIN_EMAIL);
  await findAndType(driver, 'Phone', LOGIN_PHONE);
  await findAndType(driver, 'Access Code', LOGIN_CODE);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.urlContains('/dashboard'), 20000);
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new'); // enable in CI if desired
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Clear tour flag to force first-run tour
    await driver.get(BASE_URL);
    await driver.executeScript('localStorage.removeItem("tour_completed_dashboard");');

    await login(driver);

    // Wait for Joyride overlay (Skip Tour button)
    const skipBtn = await driver.wait(
      until.elementLocated(By.xpath(`//button[contains(., "Skip Tour")]`)),
      15000
    );

    // Advance/skip
    await skipBtn.click();
    await sleep(500);

    // Verify tour is gone
    const remainingSkip = await driver.findElements(By.xpath(`//button[contains(., "Skip Tour")]`));
    if (remainingSkip.length) {
      throw new Error('Tour did not close after skipping');
    }

    // Ensure completion persists on reload
    await driver.navigate().refresh();
    await driver.wait(until.urlContains('/dashboard'), 15000);
    await sleep(1000);
    const skipAfterRefresh = await driver.findElements(By.xpath(`//button[contains(., "Skip Tour")]`));
    if (skipAfterRefresh.length) {
      throw new Error('Tour re-appeared after completion');
    }

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('Dashboard tour e2e passed.');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

