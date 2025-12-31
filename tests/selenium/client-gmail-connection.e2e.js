/**
 * E2E Test: Client Gmail Connection UI
 * Tests that the Gmail connection UI is present in the client creation wizard
 * and that validation prevents proceeding without connecting Gmail.
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, selectOption, allowlistedConsoleErrors, sleep, dismissTour } = require('./utils');

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
    await driver.get(`${BASE}/clients/new`);
    await dismissTour(driver);
    await sleep(500);

    // 1. Verify Gmail Connection section exists
    const gmailSection = await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Gmail Connection")]`)),
      10000
    );
    console.log('✓ Gmail Connection section found');

    // 2. Verify Connect Gmail button exists
    const connectBtn = await driver.wait(
      until.elementLocated(By.xpath(`//button[contains(., "Connect Gmail Account")]`)),
      5000
    );
    console.log('✓ Connect Gmail Account button found');

    // 3. Verify the required indicator (*) is present
    const requiredIndicator = await driver.findElement(
      By.xpath(`//*[contains(text(),"Gmail Connection")]/following::*[contains(text(),"*")][1]`)
    );
    console.log('✓ Gmail required indicator found');

    // 4. Fill required fields but don't connect Gmail
    await findAndType(driver, 'Athlete Email', `test-gmail-${Date.now()}@example.com`);
    await findAndType(driver, 'Access Code', '123456');
    await findAndType(driver, 'First name', 'Test');
    await findAndType(driver, 'Last name', 'Gmail');
    await selectOption(driver, 'Sport', 'Football');

    // 5. Try to proceed to next step without Gmail connected
    const nextBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`));
    await nextBtn.click();
    await sleep(500);

    // 6. Verify validation error appears for Gmail
    const gmailError = await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"connect your Gmail") or contains(text(),"Gmail account")]`)),
      5000
    );
    console.log('✓ Gmail validation error displayed when trying to proceed without connecting');

    // 7. Verify we're still on step 0 (Basic Info)
    const stepLabels = await driver.findElements(By.xpath(`//span[contains(@class,"MuiStepLabel-label")]`));
    const basicInfoStep = stepLabels[0];
    const isActive = await basicInfoStep.getAttribute('class');
    if (!isActive.includes('Mui-active') && !isActive.includes('completed')) {
      // Check if activeStep is still 0 by seeing if we're still on Basic Info content
      const basicInfoContent = await driver.findElements(By.xpath(`//label[contains(., "Athlete Email")]`));
      if (basicInfoContent.length === 0) {
        throw new Error('Should have stayed on Basic Info step due to Gmail validation');
      }
    }
    console.log('✓ Wizard correctly prevents advancing without Gmail connection');

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E client Gmail connection UI passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

