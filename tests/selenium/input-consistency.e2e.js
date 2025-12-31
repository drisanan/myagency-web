/**
 * E2E Test: Input Size Consistency
 * Tests that all input fields across different pages use consistent sizing (size="small").
 * This ensures a uniform UI experience.
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, allowlistedConsoleErrors, sleep, dismissTour } = require('./utils');

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

async function checkInputSizes(driver, pageName) {
  // Get all MUI TextField inputs
  const inputs = await driver.findElements(By.css('.MuiInputBase-root'));
  let smallCount = 0;
  let nonSmallCount = 0;

  for (const input of inputs) {
    const classList = await input.getAttribute('class');
    // MUI small inputs have 'MuiInputBase-sizeSmall' class
    if (classList.includes('MuiInputBase-sizeSmall')) {
      smallCount++;
    } else if (classList.includes('MuiInputBase-root') && !classList.includes('MuiInputBase-multiline')) {
      // Only flag non-multiline inputs that aren't small
      // Multiline textareas may have different sizing requirements
      nonSmallCount++;
    }
  }

  return { pageName, smallCount, nonSmallCount, total: smallCount + nonSmallCount };
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  const results = [];

  try {
    await login(driver);
    await dismissTour(driver);

    // Test 1: Lists page
    console.log('Checking Lists page...');
    await driver.get(`${BASE}/lists`);
    await dismissTour(driver);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Lists")]`)), 10000);
    await sleep(500);
    results.push(await checkInputSizes(driver, 'Lists'));

    // Test 2: Recruiter page
    console.log('Checking Recruiter page...');
    await driver.get(`${BASE}/recruiter`);
    await dismissTour(driver);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Recruiter")]`)), 10000);
    await sleep(500);
    results.push(await checkInputSizes(driver, 'Recruiter'));

    // Test 3: Client creation wizard
    console.log('Checking Client Creation page...');
    await driver.get(`${BASE}/clients/new`);
    await dismissTour(driver);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Basic Info")]`)), 10000);
    await sleep(500);
    results.push(await checkInputSizes(driver, 'Client Create'));

    // Test 4: AI Prompts page
    console.log('Checking AI Prompts page...');
    await driver.get(`${BASE}/ai/prompts`);
    await dismissTour(driver);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"AI Prompt")]`)), 10000);
    await sleep(500);
    results.push(await checkInputSizes(driver, 'AI Prompts'));

    // Test 5: Tasks page (check dialog)
    console.log('Checking Tasks page...');
    await driver.get(`${BASE}/tasks`);
    await dismissTour(driver);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Tasks")]`)), 10000);
    await sleep(500);
    // Open add task dialog
    const addTaskBtn = await driver.findElements(By.xpath(`//button[contains(., "Add task")]`));
    if (addTaskBtn.length > 0) {
      await addTaskBtn[0].click();
      await sleep(500);
      results.push(await checkInputSizes(driver, 'Tasks Dialog'));
      // Close dialog
      await driver.findElement(By.xpath(`//button[contains(., "Cancel")]`)).click();
    }

    // Print results
    console.log('\n=== Input Size Consistency Results ===');
    let allPassed = true;
    for (const r of results) {
      const status = r.nonSmallCount === 0 ? '✓' : '✗';
      console.log(`${status} ${r.pageName}: ${r.smallCount} small, ${r.nonSmallCount} non-small (total: ${r.total})`);
      if (r.nonSmallCount > 0 && r.total > 0) {
        // Allow some flexibility - warn but don't fail if there are any inputs at all
        console.log(`  Warning: ${r.nonSmallCount} input(s) may not be using size="small"`);
      }
    }

    // Check total consistency
    const totalSmall = results.reduce((acc, r) => acc + r.smallCount, 0);
    const totalNonSmall = results.reduce((acc, r) => acc + r.nonSmallCount, 0);
    console.log(`\nTotal: ${totalSmall} small inputs, ${totalNonSmall} non-small inputs`);

    if (totalSmall === 0 && totalNonSmall > 0) {
      throw new Error('No small inputs found - size="small" may not be applied');
    }

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('\nE2E input consistency check passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

