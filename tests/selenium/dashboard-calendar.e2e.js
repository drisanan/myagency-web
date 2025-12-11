const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, allowlistedConsoleErrors } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });
    await driver.get(`${BASE}/dashboard`);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Recruiting Calendar")]`)), 10000);

    // Ensure legend chips and blocks render
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dead")]`)), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Contact")]`)), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Quiet")]`)), 5000);

    const select = await driver.findElement(By.css('[data-testid="recruiting-calendar-sport"]'));

    // Collect all sport options
    await select.click();
    const options = await driver.findElements(By.xpath(`//li[contains(@class,"MuiMenuItem-root")]`));
    const sportNames = [];
    for (const opt of options) {
      sportNames.push(await opt.getText());
    }
    // close menu
    await driver.actions().sendKeys('\uE00C').perform(); // ESC

    for (const name of sportNames) {
      await select.click();
      const opt = await driver.wait(until.elementLocated(By.xpath(`//li[normalize-space(.)="${name}"]`)), 5000);
      await opt.click();
      await driver.wait(until.elementLocated(By.css('[data-testid="calendar-day"]')), 5000);
      await driver.wait(until.elementLocated(By.css('[data-testid="calendar-period-chip"]')), 5000);
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


