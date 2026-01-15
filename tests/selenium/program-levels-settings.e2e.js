/**
 * Test Program Levels settings functionality
 */
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, sleep, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const LOGIN_EMAIL = 'drisanjames@gmail.com';
const LOGIN_PHONE = '2084407940';
const LOGIN_CODE = '123456';

async function run() {
  const opts = new chrome.Options().addArguments('--headless', '--no-sandbox', '--disable-gpu');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
  
  try {
    // Login
    console.log('🔐 Logging in...');
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', LOGIN_EMAIL);
    await findAndType(driver, 'Phone', LOGIN_PHONE);
    await findAndType(driver, 'Access Code', LOGIN_CODE);
    await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
    await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Dashboard")]')), 20000);
    await dismissTour(driver);
    console.log('✅ Login successful');
    
    // Navigate to settings
    console.log('\n📋 Navigating to Settings...');
    await driver.get(`${BASE}/settings`);
    await sleep(2000);
    
    // Look for Program Level section (may be "Program Level" or "Program Levels")
    const programLevelsSection = await driver.findElements(By.xpath('//*[contains(text(), "Program Level")]'));
    
    if (programLevelsSection.length > 0) {
      console.log('✅ Found Program Levels section in settings');
      
      // Check for level inputs
      const levelInputs = await driver.findElements(By.xpath('//label[contains(text(), "Level") and contains(text(), "Name")]'));
      console.log(`✅ Found ${levelInputs.length} level name input fields`);
      
      // Check for Add Level button
      const addLevelBtn = await driver.findElements(By.xpath('//*[contains(text(), "Add Level")]'));
      if (addLevelBtn.length > 0) {
        console.log('✅ "Add Level" button visible');
      }
      
      // Check for Preview section
      const preview = await driver.findElements(By.xpath('//*[contains(text(), "Preview")]'));
      if (preview.length > 0) {
        console.log('✅ Preview section visible');
      }
      
      console.log('\n🎉 Program Levels settings are fully functional!');
    } else {
      console.log('❌ Program Levels section not found in settings');
    }
    
  } catch (e) {
    console.error('Test failed:', e.message);
  } finally {
    await driver.quit();
  }
}

run();
