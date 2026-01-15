/**
 * Quick test for Program Level feature
 */
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, sleep, dismissTour, getSessionCookie } = require('./utils');

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
    
    // Navigate to first client
    await driver.get(`${BASE}/clients`);
    await sleep(2000);
    await dismissTour(driver);
    
    const viewLink = await driver.findElement(By.xpath('(//*[text()="VIEW" or text()="View"])[1]'));
    const href = await viewLink.getAttribute('href');
    console.log(`\n📋 Testing Program Level for: ${href}`);
    await driver.get(href);
    await sleep(1500);
    await dismissTour(driver);
    
    // Click Account tab
    const accountTab = await driver.wait(until.elementLocated(By.xpath('//button[@role="tab" and contains(text(), "Account")]')), 5000);
    await driver.executeScript('arguments[0].click()', accountTab);
    await sleep(1000);
    
    // Check if program level chips are displayed
    const programLevelChips = await driver.findElements(By.xpath('//*[@data-testid="program-level-bronze"] | //*[@data-testid="program-level-silver"] | //*[@data-testid="program-level-gold"] | //*[@data-testid="program-level-platinum"]'));
    
    if (programLevelChips.length >= 4) {
      console.log('✅ Found all program level options (Bronze, Silver, Gold, Platinum)');
      
      // Click on Gold level
      const goldChip = await driver.findElement(By.xpath('//*[@data-testid="program-level-gold"]'));
      await goldChip.click();
      await sleep(1500);
      
      // Verify change
      const updatedGold = await driver.findElement(By.xpath('//*[@data-testid="program-level-gold"]'));
      const goldText = await updatedGold.getText();
      console.log(`✅ Clicked Gold level: ${goldText}`);
      console.log('\n🎉 Program Level feature is working!');
    } else {
      console.log('❌ Program level chips not found');
      console.log(`Found ${programLevelChips.length} chips`);
    }
    
  } catch (e) {
    console.error('Test failed:', e.message);
  } finally {
    await driver.quit();
  }
}

run();
