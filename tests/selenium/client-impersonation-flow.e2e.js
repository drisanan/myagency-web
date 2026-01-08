/**
 * E2E Test: Client (Athlete) Impersonation Flow
 * 
 * Tests the agency's ability to impersonate a client and view the client portal.
 * 
 * Flow:
 * 1. Agency logs in
 * 2. Navigate to Athletes page
 * 3. Click "Impersonate" on a client row
 * 4. Verify redirected to /client/lists (client portal)
 * 5. Verify impersonation banner is displayed
 * 6. Click "Stop Impersonating"
 * 7. Verify redirected back to /clients (agency view)
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, allowlistedConsoleErrors, sleep, getSessionCookie, dismissTour, deleteClientByEmail } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const LOGIN_EMAIL = 'drisanjames@gmail.com';
const LOGIN_PHONE = '2084407940';
const LOGIN_CODE = '123456';

// Test client to impersonate (created for this test)
const TEST_CLIENT_EMAIL = `impersonate-test-${Date.now()}@example.com`;

let sessionCookie = null;

async function clearImpersonationStorage(driver) {
  // Clear any stale impersonation data from previous test runs
  await driver.executeScript(`
    window.localStorage.removeItem('session_impersonation_base');
    window.localStorage.removeItem('session_impersonation_active');
  `);
}

async function login(driver) {
  await driver.get(`${BASE}/auth/login`);
  
  // Clear any stale impersonation state
  await clearImpersonationStorage(driver);
  
  await findAndType(driver, 'Email', LOGIN_EMAIL);
  await findAndType(driver, 'Phone', LOGIN_PHONE);
  await findAndType(driver, 'Access Code', LOGIN_CODE);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);
  sessionCookie = await getSessionCookie(driver);
}

async function createTestClient(driver) {
  await driver.get(`${BASE}/clients/new`);
  await dismissTour(driver);
  await sleep(1000);

  await findAndType(driver, 'Athlete Email', TEST_CLIENT_EMAIL);
  await findAndType(driver, 'Access Code', '654321');
  await findAndType(driver, 'First name', 'Test');
  await findAndType(driver, 'Last name', 'Impersonate');
  await findAndType(driver, 'Phone', '5551234567');

  // Select sport
  const sportSelect = await driver.findElement(
    By.xpath(`//label[contains(., "Sport")]/following::div[contains(@class,"MuiSelect")]`)
  );
  await sportSelect.click();
  await sleep(500);
  const footballOpt = await driver.wait(
    until.elementLocated(By.xpath(`//li[contains(text(),"Football")]`)),
    5000
  );
  await footballOpt.click();
  await sleep(500);

  // Simulate Gmail connection
  await driver.executeScript(`
    window.postMessage({ type: 'google-oauth-success', clientId: 'test-impersonate-${Date.now()}' }, window.location.origin);
  `);
  await sleep(500);

  // Click through wizard steps to save
  for (let i = 0; i < 7; i++) {
    try {
      const nextBtn = await driver.wait(
        until.elementLocated(By.xpath(`//button[normalize-space(.)="Next" or normalize-space(.)="NEXT"]`)),
        5000
      );
      await driver.wait(until.elementIsEnabled(nextBtn), 3000);
      await nextBtn.click();
      await sleep(800);
    } catch (e) {
      break;
    }
  }

  // Click Save on final step
  try {
    const saveBtn = await driver.wait(
      until.elementLocated(By.xpath(`//button[contains(text(),"Save") or contains(text(),"Create")]`)),
      5000
    );
    await saveBtn.click();
    await sleep(2000);
  } catch (e) {
    console.log('Save button not found or already saved');
  }

  console.log(`Created test client: ${TEST_CLIENT_EMAIL}`);
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Step 1: Login as agency
    console.log('Step 1: Logging in as agency...');
    await login(driver);
    await dismissTour(driver);

    // Step 2: Create a test client to impersonate (or use existing)
    console.log('Step 2: Creating test client...');
    await createTestClient(driver);

    // Step 3: Navigate to Athletes page
    console.log('Step 3: Navigating to Athletes page...');
    await driver.get(`${BASE}/clients`);
    await dismissTour(driver);
    await sleep(2000);

    // Wait for clients list to load
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Athletes")]`)),
      10000
    );

    // Step 4: Find and click Impersonate button for our test client
    console.log('Step 4: Looking for Impersonate button...');
    
    // First check if ANY Impersonate button exists on the page
    await sleep(2000);
    let impersonateBtns = await driver.findElements(By.xpath(`//button[contains(text(),"Impersonate")]`));
    console.log(`Found ${impersonateBtns.length} Impersonate buttons on page`);
    
    if (impersonateBtns.length === 0) {
      // Debug: show available buttons
      const allButtons = await driver.findElements(By.css('button'));
      const btnTexts = await Promise.all(allButtons.slice(0, 20).map(b => b.getText().catch(() => '')));
      console.log('Available buttons on page:', btnTexts.filter(t => t).join(', '));
      throw new Error('No Impersonate buttons found. Feature may not be deployed yet.');
    }
    
    // Look for the test client row and its Impersonate button
    const impersonateBtn = await driver.wait(
      until.elementLocated(By.xpath(`//button[contains(text(),"Impersonate")]`)),
      5000
    );
    
    console.log('Step 5: Clicking Impersonate button...');
    await impersonateBtn.click();
    await sleep(2000);

    // Step 6: Verify redirected to client portal
    console.log('Step 6: Verifying redirect to client portal...');
    const currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/client/')) {
      throw new Error(`Expected redirect to /client/*, got: ${currentUrl}`);
    }
    console.log(`✓ Redirected to: ${currentUrl}`);

    // Step 7: Verify impersonation banner is displayed
    console.log('Step 7: Verifying impersonation banner...');
    const banner = await driver.wait(
      until.elementLocated(By.xpath(
        `//*[contains(text(),"You are viewing as") or contains(text(),"Stop Impersonating")]`
      )),
      10000
    );
    const bannerText = await banner.getText();
    console.log(`✓ Impersonation banner found: "${bannerText}"`);

    // Step 8: Click "Stop Impersonating"
    console.log('Step 8: Clicking Stop Impersonating...');
    const stopBtn = await driver.wait(
      until.elementLocated(By.xpath(`//button[contains(text(),"Stop Impersonating")]`)),
      5000
    );
    // Use JavaScript click to avoid element click interception
    await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', stopBtn);
    await sleep(500);
    await driver.executeScript('arguments[0].click();', stopBtn);
    await sleep(2000);

    // Step 9: Verify redirected back to agency view (/clients)
    console.log('Step 9: Verifying return to agency view...');
    const finalUrl = await driver.getCurrentUrl();
    if (!finalUrl.includes('/clients')) {
      throw new Error(`Expected redirect to /clients, got: ${finalUrl}`);
    }
    console.log(`✓ Returned to: ${finalUrl}`);

    // Step 10: Verify impersonation banner is gone
    console.log('Step 10: Verifying banner is removed...');
    await sleep(1000);
    const banners = await driver.findElements(By.xpath(`//*[contains(text(),"Stop Impersonating")]`));
    if (banners.length > 0) {
      throw new Error('Impersonation banner still visible after stopping');
    }
    console.log('✓ Impersonation banner removed');

    // Check for console errors
    const logs = await driver.manage().logs().get('browser');
    const errs = await allowlistedConsoleErrors(logs);
    if (errs.length) {
      console.warn('Browser console warnings:', errs.map(e => e.message));
    }

    console.log('\n✅ E2E client impersonation flow PASSED');

  } catch (err) {
    console.error('\n❌ E2E client impersonation flow FAILED');
    console.error(err);
    
    // Debug: print current page info
    try {
      const url = await driver.getCurrentUrl();
      const body = await driver.findElement(By.tagName('body'));
      const text = await body.getText();
      console.error(`\nDebug - Current URL: ${url}`);
      console.error(`Debug - Page content (first 500 chars): ${text.substring(0, 500)}`);
    } catch (e) {}
    
    throw err;
  } finally {
    // Cleanup: delete test client
    if (sessionCookie) {
      console.log(`\nCleaning up test client: ${TEST_CLIENT_EMAIL}`);
      await deleteClientByEmail(API_BASE, sessionCookie, TEST_CLIENT_EMAIL);
    }
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

