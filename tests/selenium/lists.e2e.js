const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { allowlistedConsoleErrors, sleep, findAndType } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const LOGIN_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const LOGIN_PHONE = process.env.TEST_PHONE || '2084407940';
const LOGIN_CODE = process.env.TEST_ACCESS || '123456';
const LIST_NAME = `Selenium List ${Date.now()}`;

async function run() {
  if (process.env.SKIP_LISTS === '1') {
    console.log('Lists test skipped (SKIP_LISTS=1)');
    return;
  }
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Real login to ensure correct agency context/data
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', LOGIN_EMAIL);
    await findAndType(driver, 'Phone', LOGIN_PHONE);
    await findAndType(driver, 'Access Code', LOGIN_CODE);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);

    await driver.get(`${BASE}/lists`);

    // Select first available options for Sport/Division/State to avoid seed dependencies
    const selectFirst = async (labelText) => {
      const sel = await driver.wait(
        until.elementLocated(By.xpath(`//label[contains(., "${labelText}")]/following::div[contains(@class,"MuiSelect-select")][1]`)),
        15000
      );
      await sel.click();
      const opt = await driver.wait(until.elementLocated(By.xpath(`(//ul//li)[1]`)), 15000);
      await opt.click();
    };
    await selectFirst('Sport');
    await selectFirst('Division');
    await selectFirst('State');

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

