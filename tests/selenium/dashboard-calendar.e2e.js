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
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Recruiting Calendar")]`)), 10000);
    await sleep(500);

    // Ensure legend chips and blocks render
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dead")]`)), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Contact")]`)), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Quiet")]`)), 5000);

    const select = await driver.findElement(By.css('[data-testid="recruiting-calendar-sport"]'));

    // Collect all sport options
    await select.click();
    const optionElements = await driver.findElements(By.xpath(`//li[contains(@class,"MuiMenuItem-root")]`));
    const sportNames = [];
    for (const opt of optionElements) {
      const text = await opt.getText();
      if (text && text.trim()) {
        sportNames.push(text.trim());
      }
    }
    // close menu
    await driver.actions().sendKeys('\uE00C').perform(); // ESC
    await sleep(300);

    console.log(`Testing ${sportNames.length} sports:`, sportNames.slice(0, 5).join(', ') + '...');

    // Test a subset of sports to keep test quick
    const sportsToTest = sportNames.slice(0, 3);
    for (const name of sportsToTest) {
      await select.click();
      await sleep(300);
      const opt = await driver.wait(until.elementLocated(By.xpath(`//li[normalize-space(.)="${name}"]`)), 5000);
      await opt.click();
      await sleep(300);
      await driver.wait(until.elementLocated(By.css('[data-testid="calendar-day"]')), 5000);
      await driver.wait(until.elementLocated(By.css('[data-testid="calendar-period-chip"]')), 5000);
      console.log(`✓ Tested sport: ${name}`);
    }

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }
    console.log('E2E dashboard calendar passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


