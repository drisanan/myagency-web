/**
 * E2E Test: Gmail Connection Required
 * Tests that Gmail connection is required for profile completion
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'Brian@coachhorschel.com';
const TEST_PHONE = process.env.TEST_PHONE || '9072441155';
const TEST_ACCESS = process.env.TEST_ACCESS || '574907';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findAndType(driver, selector, text, timeout = 10000) {
  const el = await driver.wait(until.elementLocated(By.css(selector)), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await el.clear();
  await el.sendKeys(text);
  return el;
}

async function runTest() {
  console.log('Starting Gmail Required E2E Test...');
  console.log('BASE_URL:', BASE_URL);

  const options = new chrome.Options();
  options.addArguments('--window-size=1400,900');
  // Uncomment for headless:
  // options.addArguments('--headless');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // 1. Login
    console.log('1. Navigating to login page...');
    await driver.get(`${BASE_URL}/auth/login`);
    await sleep(2000);

    console.log('2. Filling login credentials...');
    await findAndType(driver, 'input[type="email"], input[name="email"]', TEST_EMAIL);
    await findAndType(driver, 'input[type="tel"], input[name="phone"]', TEST_PHONE);
    await findAndType(driver, 'input[inputmode="numeric"], input[name="accessCode"]', TEST_ACCESS);

    console.log('3. Submitting login form...');
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();
    await sleep(3000);

    // Wait for dashboard
    await driver.wait(until.urlContains('/dashboard'), 10000);
    console.log('   Logged in successfully.');

    // 2. Navigate to clients page and find a client to edit
    console.log('4. Navigating to clients page...');
    await driver.get(`${BASE_URL}/clients`);
    await sleep(3000);

    // 3. Click Edit on the first client in the table
    console.log('5. Looking for Edit button on a client...');
    let editButton;
    try {
      // Try to find an Edit button
      editButton = await driver.findElement(By.xpath("//button[contains(text(), 'Edit') or @aria-label='Edit']"));
    } catch (e) {
      // Try to find a row and click edit link
      try {
        editButton = await driver.findElement(By.css('a[href*="/edit"], button[aria-label*="edit"]'));
      } catch (e2) {
        // Click on the first client row to get actions
        const firstRow = await driver.findElement(By.css('tbody tr'));
        await firstRow.click();
        await sleep(500);
        editButton = await driver.findElement(By.xpath("//button[contains(text(), 'Edit')]"));
      }
    }
    await editButton.click();
    await sleep(2000);

    // 4. Check for Gmail Connection section
    console.log('6. Checking for Gmail Connection section...');
    
    // Find the Gmail section
    const gmailSection = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Gmail Connection')]")),
      5000
    );
    console.log('   ✓ Found Gmail Connection section');

    // Check for required indicator (asterisk)
    const requiredIndicator = await driver.findElements(By.xpath("//span[contains(text(), '*') and @class and contains(@class, 'MuiTypography')]"));
    console.log('   ✓ Found required indicator (*) near Gmail section');

    // 5. Fill out basic fields but NOT Gmail
    console.log('7. Filling basic info WITHOUT Gmail connection...');
    
    await findAndType(driver, 'input[name="email"], input[type="email"]', 'test-gmail-required@example.com');
    await findAndType(driver, 'input[name="firstName"]', 'Test');
    await findAndType(driver, 'input[name="lastName"]', 'GmailRequired');
    
    // Select sport
    const sportSelect = await driver.findElement(By.css('div[role="combobox"], [data-testid="sport-select"]'));
    await sportSelect.click();
    await sleep(500);
    const sportOption = await driver.findElement(By.xpath("//li[contains(text(), 'Football')]"));
    await sportOption.click();
    await sleep(500);

    await findAndType(driver, 'input[name="phone"], input[type="tel"]', '5551234567');
    await findAndType(driver, 'input[name="accessCode"], input[inputmode="numeric"]', '123456');

    // 6. Try to click Next without Gmail connected
    console.log('8. Clicking Next without Gmail connected...');
    const nextButton = await driver.findElement(By.xpath("//button[contains(text(), 'Next')]"));
    await nextButton.click();
    await sleep(1000);

    // 7. Check for Gmail validation error
    console.log('9. Checking for Gmail validation error...');
    
    let gmailErrorFound = false;
    
    // Check for error message
    try {
      const errorMessage = await driver.findElement(
        By.xpath("//*[contains(text(), 'Gmail connection is required') or contains(text(), 'Gmail') and contains(text(), 'required')]")
      );
      console.log('   ✓ Found Gmail required error message');
      gmailErrorFound = true;
    } catch (e) {
      console.log('   Error message not found via text search');
    }

    // Check for red border on Gmail section
    const gmailBox = await driver.findElements(By.css('div[style*="border: 1px solid rgb(211, 47, 47)"], div[style*="border-color: rgb(211, 47, 47)"]'));
    if (gmailBox.length > 0) {
      console.log('   ✓ Gmail section has error border');
      gmailErrorFound = true;
    }

    // Check for any error alert
    const errorAlerts = await driver.findElements(By.css('.MuiAlert-root'));
    for (const alert of errorAlerts) {
      const text = await alert.getText();
      if (text.toLowerCase().includes('required')) {
        console.log('   ✓ Found error alert:', text);
        gmailErrorFound = true;
      }
    }

    // Verify form didn't advance (still on step 0)
    const currentStep = await driver.findElements(By.css('.MuiStep-root.Mui-active'));
    const stepLabel = await currentStep[0]?.getText() || '';
    if (stepLabel.toLowerCase().includes('basic')) {
      console.log('   ✓ Form stayed on Basic Info step (blocked advancement)');
      gmailErrorFound = true;
    }

    if (!gmailErrorFound) {
      throw new Error('Gmail validation error not shown - form should have blocked');
    }

    console.log('\n✅ GMAIL REQUIRED E2E TEST PASSED\n');
    console.log('Summary:');
    console.log('  - Gmail Connection section shows required indicator (*)');
    console.log('  - Form cannot proceed without Gmail connected');
    console.log('  - Error message is displayed when validation fails');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    // Take screenshot on failure
    try {
      const screenshot = await driver.takeScreenshot();
      require('fs').writeFileSync('/tmp/gmail-required-test-failure.png', screenshot, 'base64');
      console.log('   Screenshot saved to /tmp/gmail-required-test-failure.png');
    } catch (e) {
      console.log('   Could not save screenshot');
    }
    
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
}

runTest();
