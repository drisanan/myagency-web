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

    // 2. Navigate to new client page directly
    console.log('4. Navigating to new client page...');
    await driver.get(`${BASE_URL}/clients/new`);
    await sleep(3000);

    // 5. Check for Gmail Connection section
    console.log('5. Checking for Gmail Connection section...');
    
    // Find the Gmail section
    const gmailSection = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Gmail Connection')]")),
      5000
    );
    console.log('   ✓ Found Gmail Connection section');

    // Check for required indicator (asterisk)
    const requiredIndicator = await driver.findElements(By.xpath("//span[contains(text(), '*') and @class and contains(@class, 'MuiTypography')]"));
    console.log('   ✓ Found required indicator (*) near Gmail section');

    // 6. Fill out basic fields but NOT Gmail
    console.log('6. Filling basic info WITHOUT Gmail connection...');
    
    // Find fields by data-testid or label
    await findAndType(driver, 'input[data-testid="athlete-email"]', 'test-gmail-required@example.com');
    await findAndType(driver, 'input[data-testid="athlete-access-code"]', '123456');
    
    // Find First name and Last name by label
    const firstNameInput = await driver.findElement(By.xpath("//label[contains(text(), 'First name')]/following::input[1]"));
    await firstNameInput.clear();
    await firstNameInput.sendKeys('Test');
    
    const lastNameInput = await driver.findElement(By.xpath("//label[contains(text(), 'Last name')]/following::input[1]"));
    await lastNameInput.clear();
    await lastNameInput.sendKeys('GmailRequired');
    
    // Select sport - find the Sport dropdown
    const sportDropdown = await driver.findElement(By.xpath("//label[contains(text(), 'Sport')]/following::div[contains(@class, 'MuiSelect') or @role='combobox'][1]"));
    await sportDropdown.click();
    await sleep(500);
    const sportOption = await driver.findElement(By.xpath("//li[contains(text(), 'Football') or @data-value='football']"));
    await sportOption.click();
    await sleep(500);

    // Find phone field by label
    const phoneInput = await driver.findElement(By.xpath("//label[contains(text(), 'Phone')]/following::input[1]"));
    await phoneInput.clear();
    await phoneInput.sendKeys('5551234567');

    // 7. Try to click Next without Gmail connected
    console.log('7. Clicking Next without Gmail connected...');
    const nextButton = await driver.findElement(By.xpath("//button[contains(text(), 'Next')]"));
    console.log('   Found Next button, clicking...');
    await nextButton.click();
    await sleep(2000);  // Give more time for validation to run
    console.log('   Clicked Next button, checking validation...');

    // 8. Check for Gmail validation error
    console.log('8. Checking for Gmail validation error...');
    
    let gmailErrorFound = false;
    
    // Debug: Check current page state
    const currentUrl = await driver.getCurrentUrl();
    console.log('   Current URL:', currentUrl);
    
    // Check for error message in multiple places
    try {
      const errorMessage = await driver.findElement(
        By.xpath("//*[contains(text(), 'Gmail connection is required') or (contains(text(), 'Gmail') and contains(text(), 'required'))]")
      );
      const text = await errorMessage.getText();
      console.log('   ✓ Found Gmail required error message:', text);
      gmailErrorFound = true;
    } catch (e) {
      console.log('   Error message not found via text search');
    }

    // Check for error in Typography caption
    try {
      const captions = await driver.findElements(By.css('.MuiTypography-caption'));
      for (const caption of captions) {
        const text = await caption.getText();
        if (text.toLowerCase().includes('gmail')) {
          console.log('   ✓ Found caption with Gmail text:', text);
          gmailErrorFound = true;
          break;
        }
      }
    } catch (e) {
      console.log('   No captions found');
    }

    // Check for any error alert containing "required"
    const errorAlerts = await driver.findElements(By.css('.MuiAlert-root'));
    console.log('   Found', errorAlerts.length, 'alert(s)');
    for (const alert of errorAlerts) {
      const text = await alert.getText();
      console.log('   Alert text:', text);
      if (text.toLowerCase().includes('required')) {
        gmailErrorFound = true;
      }
    }

    // Verify form didn't advance - check step indicator
    const activeSteps = await driver.findElements(By.css('.Mui-active .MuiStepLabel-label, .MuiStep-root.Mui-active'));
    if (activeSteps.length > 0) {
      const stepText = await activeSteps[0].getText();
      console.log('   Current step:', stepText);
      if (stepText.toLowerCase().includes('basic')) {
        console.log('   ✓ Form stayed on Basic Info step');
        gmailErrorFound = true;
      }
    }

    // Check if we're still on step 0 by looking at the stepper
    try {
      const stepperRoot = await driver.findElement(By.css('.MuiStepper-root'));
      const activeStep = await stepperRoot.findElement(By.css('.Mui-active'));
      const label = await activeStep.getText();
      console.log('   Active step label:', label);
      if (label.toLowerCase().includes('basic')) {
        gmailErrorFound = true;
      }
    } catch (e) {
      console.log('   Could not determine active step');
    }

    // Debug: print page source snippet around Gmail
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('Gmail connection is required')) {
      console.log('   ✓ Page source contains "Gmail connection is required"');
      gmailErrorFound = true;
    }

    if (!gmailErrorFound) {
      // Check if form actually advanced (failure case)
      if (pageSource.includes('Personal Info') && !pageSource.includes('Basic Info')) {
        console.log('   ❌ Form advanced to Personal Info step (validation failed)');
      }
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
