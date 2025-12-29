const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { allowlistedConsoleErrors, findAndType, sleep } = require('./utils');

const BASE_URL = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const AGENT_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const AGENT_PHONE = process.env.TEST_PHONE || '2084407940';
const AGENT_ACCESS = process.env.TEST_ACCESS || '123456';

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new'); // enable in CI if desired
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    console.log('1. Logging in as agency...');
    await driver.get(`${BASE_URL}/auth/login`);
    await driver.wait(until.elementLocated(By.xpath(`//button[normalize-space(.)="Agency"]`)), 15000).click();
    await findAndType(driver, 'Email', AGENT_EMAIL);
    await findAndType(driver, 'Phone', AGENT_PHONE);
    await findAndType(driver, 'Access Code', AGENT_ACCESS);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    await driver.wait(until.urlContains('/dashboard'), 20000);

    console.log('2. Navigating to recruiter wizard...');
    await driver.get(`${BASE_URL}/recruiter`);
    await driver.wait(until.elementLocated(By.xpath(`//h6[normalize-space(.)="Preview"]`)), 20000);

    console.log('3. Checking for Saved Prompts selector...');
    // The selector is visible in the draft area; wait and ensure it exists.
    await driver.wait(
      until.elementLocated(By.xpath(`//label[contains(., "Saved Prompts")]/following::input[1] | //label[contains(., "Saved Prompts")]/following::div[contains(@class,"MuiSelect-select")][1]`)),
      15000
    );

    // If options exist, select first non-empty option to ensure it applies
    const trigger = await driver.findElement(By.xpath(`//label[contains(., "Saved Prompts")]/following::div[contains(@class,"MuiSelect-select")][1]`));
    await trigger.click();
    await sleep(500);
    const optionsEls = await driver.findElements(By.xpath(`//ul//li[not(contains(@data-value,""))]`));
    if (optionsEls.length > 0) {
      await optionsEls[0].click();
      await sleep(500);
      // After selecting, preview should not be empty
      const previewHtml = await driver.findElement(By.xpath(`//div[contains(@class,"MuiBox-root")]//div[@dangerouslysetinnerhtml or contains(@class,"MuiBox-root")]`)).getText();
      if (!previewHtml || !previewHtml.trim()) {
        throw new Error('Preview is empty after selecting saved prompt');
      }
    } else {
      console.log('No saved prompts available; selector rendered correctly.');
      await driver.findElement(By.xpath(`//body`)); // noop wait
    }

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('Recruiter prompt selector test passed.');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

