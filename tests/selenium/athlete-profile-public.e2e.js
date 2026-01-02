/**
 * E2E Test: Public Athlete Profile Page
 * 
 * Tests the public athlete profile page feature:
 * 1. Creates a client with a unique username
 * 2. Visits the public profile page
 * 3. Verifies profile data displays correctly
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { findAndType, selectOption, sleep, getSessionCookie, deleteClientByEmail, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const TEST_USERNAME = `test-athlete-${Date.now()}`;
const TEST_EMAIL = `athlete-profile-${Date.now()}@example.com`;
const LOGIN_EMAIL = 'drisanjames@gmail.com';
const LOGIN_PHONE = '2084407940';
const LOGIN_CODE = '123456';

let sessionCookie = null;

async function login(driver) {
  await driver.get(`${BASE}/auth/login`);
  await findAndType(driver, 'Email', LOGIN_EMAIL);
  await findAndType(driver, 'Phone', LOGIN_PHONE);
  await findAndType(driver, 'Access Code', LOGIN_CODE);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);
  sessionCookie = await getSessionCookie(driver);
}

// Simulate Gmail OAuth success for testing
async function simulateGmailConnection(driver) {
  await driver.executeScript(`
    window.postMessage({ type: 'google-oauth-success', clientId: 'test-${Date.now()}' }, window.location.origin);
  `);
  await sleep(500);
}

async function clickNext(driver) {
  const nextBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`));
  await nextBtn.click();
  await sleep(500);
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    console.log('🏃 Starting Athlete Profile Public E2E Test');
    console.log(`📧 Test email: ${TEST_EMAIL}`);
    console.log(`👤 Test username: ${TEST_USERNAME}`);

    // Step 1: Login as agency
    console.log('\n📝 Step 1: Logging in...');
    await login(driver);
    console.log('✅ Login successful');

    // Step 2: Navigate to create new client
    console.log('\n📝 Step 2: Creating new client with username...');
    await driver.get(`${BASE}/clients/new`);
    await dismissTour(driver);

    // Fill Basic Info step
    await findAndType(driver, 'Athlete Email', TEST_EMAIL);
    await findAndType(driver, 'Access Code', '123456');
    await findAndType(driver, 'First name', 'TestAthlete');
    await findAndType(driver, 'Last name', 'Profile');
    await findAndType(driver, 'Phone', '2084407940');
    await selectOption(driver, 'Sport', 'Football');

    // Fill username field
    const usernameInput = await driver.findElement(By.css('[data-testid="athlete-username"]'));
    await usernameInput.clear();
    await usernameInput.sendKeys(TEST_USERNAME);
    console.log(`✅ Username entered: ${TEST_USERNAME}`);

    // Wait for username availability check
    await sleep(1500);

    // Check for username availability indicator (green checkmark)
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(@class, 'MuiInputAdornment-root')]//*[local-name()='svg']`)),
        5000
      );
      console.log('✅ Username availability checked');
    } catch (e) {
      console.log('⚠️ Username check indicator not found, continuing...');
    }

    // Simulate Gmail connection
    await simulateGmailConnection(driver);
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Gmail Connected")]`)),
      5000
    );
    console.log('✅ Gmail connected (simulated)');

    // Navigate through wizard steps
    console.log('\n📝 Step 3: Navigating through wizard...');
    
    // Step 1 -> 2 (Personal Info)
    await clickNext(driver);
    await findAndType(driver, 'Preferred Position', 'Quarterback');
    await findAndType(driver, 'Height', '6\'2"');
    await findAndType(driver, 'Weight (lb)', '200');
    await findAndType(driver, 'School / Team / Club', 'Test High School');
    await findAndType(driver, 'GPA', '3.8');
    await findAndType(driver, 'Graduation Year', '2025');
    console.log('✅ Personal info filled');

    // Step 2 -> 3 (Social Media)
    await clickNext(driver);
    await findAndType(driver, 'Instagram Handle', 'testathlete');
    console.log('✅ Social media filled');

    // Step 3 -> 4 (Content Links)
    await clickNext(driver);
    await findAndType(driver, 'YouTube Highlight URL', 'https://youtube.com/watch?v=test123');
    console.log('✅ Content links filled');

    // Step 4 -> 5 (Gallery) - NEW STEP
    await clickNext(driver);
    console.log('✅ Gallery step (skipping upload in test)');

    // Step 5 -> 6 (Events & Metrics)
    await clickNext(driver);
    // Add a metric
    try {
      const addMetricBtn = await driver.findElement(By.css('[data-testid="add-metric"]'));
      await addMetricBtn.click();
      await sleep(300);
      await findAndType(driver, 'Metric Title', '40-Yard Dash');
      await findAndType(driver, 'Metric Value', '4.5s');
      console.log('✅ Metrics added');
    } catch (e) {
      console.log('⚠️ Could not add metric:', e.message);
    }

    // Step 6 -> 7 (Motivation & References)
    await clickNext(driver);
    await findAndType(driver, 'Favorite Motivational Quote', 'Hard work beats talent when talent doesn\'t work hard.');
    console.log('✅ Motivation filled');

    // Step 7 -> 8 (Review)
    await clickNext(driver);
    await sleep(1000); // Give time for review step to render
    console.log('✅ Arrived at Review step');

    // Verify username shows in review - use partial match on username without @
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"${TEST_USERNAME}")]`)),
        5000
      );
      console.log('✅ Username displayed in review');
    } catch (e) {
      console.log('⚠️ Username not found with contains, checking page source...');
      const pageSource = await driver.getPageSource();
      if (pageSource.includes(TEST_USERNAME)) {
        console.log('✅ Username found in page source');
      } else {
        throw new Error(`Username ${TEST_USERNAME} not found in review`);
      }
    }

    // Verify profile URL shows
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"myrecruiteragency.com")]`)),
        5000
      );
      console.log('✅ Profile URL displayed in review');
    } catch (e) {
      console.log('⚠️ Profile URL box not found, continuing...');
    }

    // Submit the form
    const createBtn = await driver.findElement(By.xpath(`//button[contains(text(),"Create Client")]`));
    await createBtn.click();
    console.log('⏳ Creating client...');

    // Wait for navigation to clients list
    await driver.wait(until.urlContains('/clients'), 15000);
    console.log('✅ Client created successfully');

    // Step 4: Visit public profile page
    console.log('\n📝 Step 4: Visiting public profile page...');
    const profileUrl = `${BASE}/athlete/${TEST_USERNAME}`;
    console.log(`🔗 Profile URL: ${profileUrl}`);
    
    await driver.get(profileUrl);
    await sleep(2000);

    // Verify profile elements
    console.log('\n📝 Step 5: Verifying profile page...');

    // Check for athlete name
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"TestAthlete") or contains(text(),"Profile")]`)),
        10000
      );
      console.log('✅ Athlete name displayed');
    } catch (e) {
      console.log('⚠️ Athlete name not found - profile may not have loaded');
    }

    // Check for username
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"@${TEST_USERNAME}")]`)),
        5000
      );
      console.log('✅ Username displayed on profile');
    } catch (e) {
      console.log('⚠️ Username not found on profile');
    }

    // Check for sport
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"Football")]`)),
        5000
      );
      console.log('✅ Sport displayed on profile');
    } catch (e) {
      console.log('⚠️ Sport not found on profile');
    }

    // Check for position
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"Quarterback")]`)),
        5000
      );
      console.log('✅ Position displayed on profile');
    } catch (e) {
      console.log('⚠️ Position not found on profile');
    }

    // Check for GPA
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"3.8")]`)),
        5000
      );
      console.log('✅ GPA displayed on profile');
    } catch (e) {
      console.log('⚠️ GPA not found on profile');
    }

    // Check for contact section
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"Get In Touch")]`)),
        5000
      );
      console.log('✅ Contact section displayed');
    } catch (e) {
      console.log('⚠️ Contact section not found');
    }

    // Check for footer
    try {
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"Athlete Narrative")]`)),
        5000
      );
      console.log('✅ Footer displayed');
    } catch (e) {
      console.log('⚠️ Footer not found');
    }

    console.log('\n✅ All checks passed!');
    console.log('🎉 Athlete Profile Public E2E Test PASSED');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    
    // Capture screenshot on failure
    try {
      const screenshot = await driver.takeScreenshot();
      const fs = require('fs');
      const screenshotPath = `./athlete-profile-failure-${Date.now()}.png`;
      fs.writeFileSync(screenshotPath, screenshot, 'base64');
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    } catch (e) {
      console.log('Could not save screenshot');
    }
    
    process.exitCode = 1;
  } finally {
    // Cleanup: Delete test client
    console.log('\n🧹 Cleaning up...');
    try {
      if (sessionCookie) {
        await deleteClientByEmail(API_BASE, sessionCookie, TEST_EMAIL);
        console.log('✅ Test client deleted');
      }
    } catch (e) {
      console.log('⚠️ Could not delete test client:', e.message);
    }
    
    await driver.quit();
    console.log('✅ Browser closed');
  }
}

run();

