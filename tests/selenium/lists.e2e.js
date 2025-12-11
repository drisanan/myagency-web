const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, selectOption, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';
const LIST_NAME = `Selenium List ${Date.now()}`;

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });
    await driver.get(`${BASE}/lists`);

    await selectOption(driver, 'Sport', 'Football');
    await selectOption(driver, 'Division', 'D1');
    await selectOption(driver, 'State', 'California');

    // Wait for universities and pick first if available
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,"MuiCardContent-root")]`)), 15000);
    const firstSchool = await driver.findElement(By.xpath(`(//div[contains(@class,"MuiCardContent-root")])[1]`));
    await firstSchool.click();

    // Wait for coaches and add first
    await driver.wait(until.elementLocated(By.xpath(`(//input[@type='checkbox'])[1]`)), 15000);
    const firstCoachChk = await driver.findElement(By.xpath(`(//input[@type='checkbox'])[1]`));
    await firstCoachChk.click();

    // Add manual coach to ensure a valid entry
    const manualNameInput = await driver.findElement(By.xpath(`//label[contains(.,"Full name")]/following::input[1]`));
    await manualNameInput.clear(); await manualNameInput.sendKeys('Manual Coach');
    const manualEmailInput = await driver.findElement(By.xpath(`//label[contains(.,"Email")]/following::input[1]`));
    await manualEmailInput.clear(); await manualEmailInput.sendKeys(`manual-${Date.now()}@example.com`);
    const addBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Add"]`));
    await addBtn.click();
    await sleep(500);

    // Save list
    const nameInput = await driver.findElement(By.xpath(`//label[contains(.,"List name")]/following::input[1]`));
    await nameInput.clear(); await nameInput.sendKeys(LIST_NAME);
    const saveBtn = await driver.findElement(By.xpath(`//button[contains(., "Save List") or normalize-space(.)="Save List"]`));
    await driver.wait(async () => await saveBtn.isEnabled(), 5000);
    await saveBtn.click();
    await sleep(1000);
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"${LIST_NAME}")]`)), 20000);

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E lists smoke passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

