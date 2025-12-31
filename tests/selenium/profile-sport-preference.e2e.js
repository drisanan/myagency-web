/**
 * E2E Test: Profile Sport Preference
 * Tests that an agency can save their preferred sport in Profile settings
 * and that the dashboard calendar reflects this preference.
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
    await dismissTour(driver);

    // Navigate to Profile page
    await driver.get(`${BASE}/profile`);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Profile")]`)), 10000);
    await sleep(500);

    // Look for the sport preference dropdown
    const sportLabel = await driver.wait(
      until.elementLocated(By.xpath(`//label[contains(., "Preferred Sport")]`)),
      10000
    );
    console.log('Found Preferred Sport label');

    // Find and click the sport dropdown
    const sportSelect = await driver.findElement(
      By.xpath(`//label[contains(., "Preferred Sport")]/following::div[contains(@class,"MuiSelect")][1]`)
    );
    await sportSelect.click();
    await sleep(300);

    // Select Basketball as preferred sport
    const basketballOption = await driver.wait(
      until.elementLocated(By.xpath(`//li[normalize-space(.)="Basketball"]`)),
      5000
    );
    await basketballOption.click();
    await sleep(300);

    // Click Save Preference button
    const saveBtn = await driver.findElement(
      By.xpath(`//button[contains(., "Save Preference")]`)
    );
    await saveBtn.click();

    // Wait for success message
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Sport preference saved")]`)),
      10000
    );
    console.log('Sport preference saved successfully');

    // Navigate to Dashboard
    await driver.get(`${BASE}/dashboard`);
    await dismissTour(driver);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Recruiting Calendar")]`)), 10000);

    // Verify that Basketball is now selected in the calendar dropdown
    const calendarSelect = await driver.findElement(By.css('[data-testid="recruiting-calendar-sport"]'));
    const selectedValue = await calendarSelect.getText();
    
    if (!selectedValue.includes('Basketball')) {
      console.log('Current selection:', selectedValue);
      throw new Error('Expected Basketball to be selected in calendar after saving preference');
    }
    console.log('Dashboard calendar shows saved preference: Basketball');

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E profile sport preference passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

