const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_SESSION = { role: 'parent', email: 'admin' };
const AGENCY_NAME = `Selenium Agency ${Date.now()}`;

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(`${BASE}/agencies/new`);
    await driver.executeScript(`window.localStorage.setItem('session', '${JSON.stringify(ADMIN_SESSION)}');`);
    await driver.navigate().refresh();

    // Start on the create form directly
    await driver.wait(until.elementLocated(By.xpath(`//label[contains(., "Agency Name")]/following::input[1]`)), 15000);
    await newBtn.click();

    await driver.wait(until.elementLocated(By.css('input[data-testid="agency-name"]')), 10000);
    const nameInput = await driver.findElement(By.css('input[data-testid="agency-name"]'));
    await nameInput.clear(); await nameInput.sendKeys(AGENCY_NAME);

    const ownerFirst = await driver.findElements(By.css('input[data-testid="owner-first"]'));
    // Owner fields optional; fill if present by label
    const ownerFirstLabel = await driver.findElements(By.xpath(`//label[contains(., "Owner First")]/following::input[1]`));
    if (ownerFirstLabel.length) {
      await ownerFirstLabel[0].sendKeys('S');
      const ownerLast = await driver.findElement(By.xpath(`//label[contains(., "Owner Last")]/following::input[1]`));
      const ownerEmail = await driver.findElement(By.xpath(`//label[contains(., "Owner Email")]/following::input[1]`));
      await ownerLast.sendKeys('Agent');
      await ownerEmail.sendKeys(`owner-${Date.now()}@example.com`);
    }

    const saveBtn = await driver.findElement(By.css('[data-testid="agency-save"]'));
    await saveBtn.click();

    await sleep(1000);
    await driver.get(`${BASE}/agencies`);
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,"MuiDataGrid")]`)), 15000);
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(text(),"${AGENCY_NAME}")]`)), 20000);

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E agency wizard passed with name', AGENCY_NAME);
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

