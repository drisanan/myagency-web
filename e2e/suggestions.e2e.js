/**
 * E2E Test: Suggestions Feature
 * Tests the floating suggestion button and overlay workflow
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const TEST_PHONE = process.env.TEST_PHONE || '2084407940';
const TEST_ACCESS = process.env.TEST_ACCESS || '123456';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findAndType(driver, selector, text, timeout = 10000) {
  const el = await driver.wait(until.elementLocated(By.css(selector)), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  await el.clear();
  await el.sendKeys(text);
  return el;
}

async function waitForElement(driver, selector, timeout = 10000) {
  const el = await driver.wait(until.elementLocated(By.css(selector)), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

async function runTest() {
  console.log('Starting Suggestions E2E Test...');
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

    // Wait for redirect to dashboard
    const currentUrl = await driver.getCurrentUrl();
    console.log('   Current URL after login:', currentUrl);

    if (!currentUrl.includes('/dashboard')) {
      console.log('   Waiting for dashboard redirect...');
      await driver.wait(until.urlContains('/dashboard'), 10000);
    }
    console.log('   Logged in successfully.');

    // 2. Check for suggestion button
    console.log('4. Looking for suggestion button...');
    await sleep(2000);

    // Try to find the floating button
    let suggestionBtn;
    try {
      suggestionBtn = await driver.wait(
        until.elementLocated(By.css('button[aria-label="Suggest improvement"]')),
        5000
      );
      console.log('   Found suggestion button by aria-label');
    } catch (e) {
      console.log('   Button not found by aria-label, trying by class...');
      try {
        suggestionBtn = await driver.wait(
          until.elementLocated(By.css('.MuiFab-root')),
          5000
        );
        console.log('   Found suggestion button by MuiFab class');
      } catch (e2) {
        // Check if the button exists in DOM at all
        const fabButtons = await driver.findElements(By.css('button'));
        console.log('   Total buttons on page:', fabButtons.length);
        
        // Check for any fixed positioned elements
        const fixedElements = await driver.executeScript(`
          return Array.from(document.querySelectorAll('*')).filter(el => {
            const style = window.getComputedStyle(el);
            return style.position === 'fixed' && style.right && parseInt(style.right) < 100;
          }).map(el => ({
            tag: el.tagName,
            class: el.className,
            id: el.id,
            ariaLabel: el.getAttribute('aria-label')
          }));
        `);
        console.log('   Fixed elements near right edge:', JSON.stringify(fixedElements, null, 2));
        
        throw new Error('Could not find suggestion button');
      }
    }

    // Check button visibility
    const isDisplayed = await suggestionBtn.isDisplayed();
    console.log('   Button is displayed:', isDisplayed);

    const btnRect = await suggestionBtn.getRect();
    console.log('   Button position:', btnRect);

    // 3. Click the suggestion button
    console.log('5. Clicking suggestion button...');
    await driver.executeScript('arguments[0].scrollIntoView(true);', suggestionBtn);
    await sleep(500);
    
    // Try regular click first
    try {
      await suggestionBtn.click();
      console.log('   Regular click succeeded');
    } catch (e) {
      console.log('   Regular click failed, trying JS click...');
      await driver.executeScript('arguments[0].click();', suggestionBtn);
    }
    await sleep(1000);

    // 4. Check for overlay
    console.log('6. Checking for overlay...');
    
    // Look for the banner with "Tap the area"
    let banner;
    try {
      banner = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Tap the area')]")),
        5000
      );
      console.log('   ✓ Found "Tap the area" banner');
    } catch (e) {
      console.log('   Banner not found, checking for backdrop...');
      
      // Check for backdrop
      const backdrop = await driver.findElements(By.css('[data-suggestion-overlay="backdrop"]'));
      console.log('   Backdrop elements found:', backdrop.length);
      
      // Check for any overlay elements
      const overlayElements = await driver.findElements(By.css('[data-suggestion-overlay]'));
      console.log('   Total overlay elements found:', overlayElements.length);
      
      // Check React state by looking at DOM
      const pageSource = await driver.getPageSource();
      const hasSuggestionOverlay = pageSource.includes('data-suggestion-overlay');
      console.log('   Page contains suggestion overlay attributes:', hasSuggestionOverlay);
      
      throw new Error('Overlay did not appear after clicking button');
    }

    // 5. Click on an area to select it
    console.log('7. Selecting an area...');
    
    // Find something to click on (like a heading or card)
    const targetElement = await driver.findElement(By.css('main h1, main h2, main .MuiTypography-h5, main .MuiPaper-root'));
    console.log('   Found target element to click');
    
    // Click the target
    await targetElement.click();
    await sleep(1000);

    // 6. Check for suggestion form
    console.log('8. Checking for suggestion form...');
    
    let suggestionForm;
    try {
      suggestionForm = await driver.wait(
        until.elementLocated(By.css('[data-suggestion-overlay="form"]')),
        5000
      );
      console.log('   ✓ Found suggestion form');
    } catch (e) {
      // Check for text input
      const inputs = await driver.findElements(By.css('textarea'));
      console.log('   Textarea elements found:', inputs.length);
      throw new Error('Suggestion form did not appear after selecting area');
    }

    // 7. Enter suggestion text
    console.log('9. Entering suggestion...');
    const textarea = await driver.findElement(By.css('textarea'));
    await textarea.sendKeys('This is a test suggestion from Selenium E2E test');
    await sleep(500);

    // 8. Submit the suggestion
    console.log('10. Submitting suggestion...');
    const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
    await submitButton.click();
    await sleep(3000);

    // 9. Check for success
    console.log('11. Checking for success...');
    try {
      await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Suggestion Submitted')]")),
        10000
      );
      console.log('   ✓ Success message found');
    } catch (e) {
      // Check for error
      const errors = await driver.findElements(By.css('.MuiAlert-root'));
      if (errors.length > 0) {
        const errorText = await errors[0].getText();
        console.log('   Error message:', errorText);
      }
      throw new Error('Success message not found');
    }

    console.log('\n✅ SUGGESTIONS E2E TEST PASSED\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    // Take screenshot on failure
    try {
      const screenshot = await driver.takeScreenshot();
      require('fs').writeFileSync('/tmp/suggestions-test-failure.png', screenshot, 'base64');
      console.log('   Screenshot saved to /tmp/suggestions-test-failure.png');
    } catch (e) {
      console.log('   Could not save screenshot');
    }
    
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
}

runTest();
