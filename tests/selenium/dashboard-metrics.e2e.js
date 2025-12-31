/**
 * E2E Test: Dashboard Metrics
 * Verifies that the metrics cards render properly on the dashboard.
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, allowlistedConsoleErrors, dismissTour, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
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
    await dismissTour(driver);
    await driver.get(`${BASE}/dashboard`);
    await dismissTour(driver);
    await sleep(500);

    // Verify metrics section renders
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Emails Sent")]`)), 10000);
    console.log('✓ Emails Sent metric found');

    // Verify Open Rate metric exists
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Open Rate")]`)), 10000);
    console.log('✓ Open Rate metric found');

    // Verify Athletes Added metric exists
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Added This Month")] | //*[contains(text(),"Athletes")]`)), 10000);
    console.log('✓ Athletes metric found');

    // Verify metrics cards container exists
    const metricsCards = await driver.findElements(By.css('#metrics-cards'));
    if (metricsCards.length === 0) {
      throw new Error('Metrics cards container not found');
    }
    console.log('✓ Metrics cards container found');

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }
    console.log('E2E dashboard metrics passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


