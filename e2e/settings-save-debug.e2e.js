/**
 * Debug test for Settings save functionality
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const TEST_EMAIL = process.env.TEST_EMAIL || 'Brian@coachhorschel.com';
const TEST_PHONE = process.env.TEST_PHONE || '9072441155';
const TEST_ACCESS = process.env.TEST_ACCESS || '574907';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runTest() {
  console.log('Settings Save Debug Test\n');

  const options = new chrome.Options();
  options.addArguments('--window-size=1400,900');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // Login
    console.log('1. Logging in...');
    await driver.get(`${BASE_URL}/auth/login`);
    await sleep(2000);

    await driver.findElement(By.css('input[type="email"]')).sendKeys(TEST_EMAIL);
    await driver.findElement(By.css('input[type="tel"]')).sendKeys(TEST_PHONE);
    await driver.findElement(By.css('input[inputmode="numeric"]')).sendKeys(TEST_ACCESS);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await sleep(3000);
    await driver.wait(until.urlContains('/dashboard'), 10000);
    console.log('   Logged in.\n');

    // Go to Settings
    console.log('2. Navigating to Settings...');
    await driver.get(`${BASE_URL}/settings`);
    await sleep(3000);

    // Capture page state before save
    console.log('3. Capturing page state before save...');
    const pageTextBefore = await driver.findElement(By.css('body')).getText();
    
    // Look for any existing alerts/errors
    const alertsBefore = await driver.findElements(By.css('.MuiAlert-root'));
    console.log(`   Alerts before save: ${alertsBefore.length}`);
    for (const alert of alertsBefore) {
      const text = await alert.getText();
      console.log(`   - Alert: "${text}"`);
    }

    // Find and click Save button
    console.log('\n4. Clicking Save button...');
    const saveBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Save') or contains(text(), 'Update')]"));
    const saveBtnText = await saveBtn.getText();
    console.log(`   Found button: "${saveBtnText}"`);
    await saveBtn.click();
    await sleep(3000);

    // Check for any alerts/errors after save
    console.log('\n5. Checking for alerts after save...');
    const alertsAfter = await driver.findElements(By.css('.MuiAlert-root'));
    console.log(`   Alerts after save: ${alertsAfter.length}`);
    for (const alert of alertsAfter) {
      const text = await alert.getText();
      const severity = await alert.getAttribute('class');
      const isError = severity.includes('error');
      const isSuccess = severity.includes('success');
      console.log(`   - ${isError ? '❌ ERROR' : isSuccess ? '✅ SUCCESS' : 'ℹ️  INFO'}: "${text}"`);
    }

    // Check for any error text on page
    const pageTextAfter = await driver.findElement(By.css('body')).getText();
    const errorKeywords = ['error', 'failed', 'invalid', 'cannot', 'unable'];
    const foundErrors = [];
    for (const keyword of errorKeywords) {
      if (pageTextAfter.toLowerCase().includes(keyword) && !pageTextBefore.toLowerCase().includes(keyword)) {
        // Find the context
        const lines = pageTextAfter.split('\n');
        for (const line of lines) {
          if (line.toLowerCase().includes(keyword)) {
            foundErrors.push(line.trim());
          }
        }
      }
    }
    
    if (foundErrors.length > 0) {
      console.log('\n6. Error-related text found on page:');
      foundErrors.forEach(e => console.log(`   - "${e}"`));
    } else {
      console.log('\n6. No new error text found on page after save.');
    }

    // Check browser console for API errors
    console.log('\n7. Checking browser console logs...');
    const logs = await driver.manage().logs().get('browser');
    const apiErrors = logs.filter(log => 
      log.level.name === 'SEVERE' && 
      (log.message.includes('api') || log.message.includes('API') || log.message.includes('settings'))
    );
    if (apiErrors.length > 0) {
      console.log('   API-related errors:');
      apiErrors.forEach(log => console.log(`   - ${log.message}`));
    } else {
      console.log('   No API errors in console.');
    }

    // Final screenshot
    const screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('/tmp/settings-after-save.png', screenshot, 'base64');
    console.log('\n8. Screenshot saved to /tmp/settings-after-save.png');

  } catch (error) {
    console.error('\nError:', error.message);
    const screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('/tmp/settings-debug-error.png', screenshot, 'base64');
  } finally {
    await driver.quit();
  }
}

runTest();
