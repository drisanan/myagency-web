const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, allowlistedConsoleErrors, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const LOGIN_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const LOGIN_PHONE = process.env.TEST_PHONE || '2084407940';
const LOGIN_CODE = process.env.TEST_ACCESS || '123456';

async function login(driver) {
  await driver.get(`${BASE}/auth/login`);
  await findAndType(driver, 'Email', LOGIN_EMAIL);
  await findAndType(driver, 'Phone', LOGIN_PHONE);
  await findAndType(driver, 'Access Code', LOGIN_CODE);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);
}

async function run() {
  if (process.env.SKIP_AI_PROMPTS === '1') {
    console.log('AI prompts test skipped (SKIP_AI_PROMPTS=1)');
    return;
  }
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await login(driver);
    await dismissTour(driver);
    await driver.get(`${BASE}/ai/prompts`);

    // select client (open select then first option)
    await driver.wait(until.elementLocated(By.xpath(`//label[contains(.,"Athlete")]/following::div[@role="combobox"][1]`)), 15000);
    const clientSel = await driver.findElement(By.xpath(`//label[contains(.,"Athlete")]/following::div[@role="combobox"][1]`));
    await clientSel.click();
    const firstLi = await driver.wait(until.elementLocated(By.xpath(`//li[1]`)), 5000);
    await firstLi.click();

    const promptArea = await driver.wait(
      until.elementLocated(By.xpath(`//label[contains(.,"Prompt")]/following::textarea[1]`)),
      10000
    );
    await promptArea.clear();
    await promptArea.sendKeys('Write a concise intro.');

    const runBtn = await driver.wait(
      until.elementLocated(By.xpath(`//button[contains(., "Run") or contains(., "Generate")]`)),
      15000
    );
    await driver.wait(async () => !(await runBtn.getAttribute('disabled')), 10000).catch(() => {});
    await driver.executeScript('arguments[0].click();', runBtn);

    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Response") or contains(text(),"Intro")]`)), 20000);

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E AI prompts smoke passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

