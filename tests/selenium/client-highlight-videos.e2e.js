/**
 * E2E Test: Client Highlight Videos in Gallery Step
 * 
 * Tests the highlight videos feature: adding up to 4 video URLs with titles
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, selectOption, allowlistedConsoleErrors, sleep, getSessionCookie, deleteClientByEmail, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const TEST_EMAIL = `ui-highlight-videos-${Date.now()}@example.com`;
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

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await login(driver);
    await driver.get(`${BASE}/clients/new`);
    await dismissTour(driver);

    // Step 0: Basic Info
    console.log('Step 0: Filling Basic Info...');
    await findAndType(driver, 'Athlete Email', TEST_EMAIL);
    await findAndType(driver, 'Access Code', '123456');
    await findAndType(driver, 'First name', 'Highlight');
    await findAndType(driver, 'Last name', 'Video Test');
    await findAndType(driver, 'Phone', '5559876543');
    await selectOption(driver, 'Sport', 'Football');
    await simulateGmailConnection(driver);
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Gmail Connected")]`)),
      5000
    );

    const clickNext = async () => {
      const nextBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`));
      await nextBtn.click();
      await sleep(300);
    };

    // Navigate to Gallery step (step 4)
    console.log('Navigating to Gallery step...');
    await clickNext(); // 0 -> 1 (Basic -> Personal)
    await clickNext(); // 1 -> 2 (Personal -> Social)
    await clickNext(); // 2 -> 3 (Social -> Content)
    await clickNext(); // 3 -> 4 (Content -> Gallery)

    // Verify we're on the Gallery step
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Profile Gallery")]`)),
      5000
    );
    console.log('On Gallery step');

    // Verify Highlight Videos section exists
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Highlight Videos")]`)),
      5000
    );
    console.log('Highlight Videos section found');

    // Add first highlight video
    console.log('Adding highlight video 1...');
    const addVideoBtn = await driver.findElement(By.xpath(`//button[@data-testid="add-highlight-video"]`));
    await addVideoBtn.click();
    await sleep(300);

    // Fill first video details
    const video1Title = await driver.findElement(By.css(`[data-testid="highlight-video-title-0"]`));
    await video1Title.clear();
    await video1Title.sendKeys('Senior Year Highlights');

    const video1Url = await driver.findElement(By.css(`[data-testid="highlight-video-url-0"]`));
    await video1Url.clear();
    await video1Url.sendKeys('https://youtube.com/watch?v=abc123');

    console.log('Video 1 added');

    // Add second highlight video
    console.log('Adding highlight video 2...');
    const addVideoBtn2 = await driver.findElement(By.xpath(`//button[@data-testid="add-highlight-video"]`));
    await addVideoBtn2.click();
    await sleep(300);

    const video2Title = await driver.findElement(By.css(`[data-testid="highlight-video-title-1"]`));
    await video2Title.clear();
    await video2Title.sendKeys('Championship Game');

    const video2Url = await driver.findElement(By.css(`[data-testid="highlight-video-url-1"]`));
    await video2Url.clear();
    await video2Url.sendKeys('https://vimeo.com/456789');

    console.log('Video 2 added');

    // Videos added - count should now be 2
    console.log('✓ 2 videos added successfully');

    // Continue to Review step
    await clickNext(); // 4 -> 5 (Gallery -> Events)
    await clickNext(); // 5 -> 6 (Events -> Motivation)
    await clickNext(); // 6 -> 7 (Motivation -> Review)

    // Verify highlight videos appear in review
    console.log('Verifying highlight videos in Review...');
    
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Highlight Videos")]`)),
      5000
    );
    console.log('✓ Highlight Videos section in review');

    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Senior Year Highlights")]`)),
      5000
    );
    console.log('✓ Video 1 title displayed in review');

    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"youtube.com")]`)),
      5000
    );
    console.log('✓ Video 1 URL displayed in review');

    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Championship Game")]`)),
      5000
    );
    console.log('✓ Video 2 title displayed in review');

    // Submit the form
    console.log('Submitting form...');
    const createBtn = await driver.findElement(By.xpath(`//button[contains(., "Create Client")]`));
    await createBtn.click();
    await sleep(2000);

    // Verify redirect to clients list
    await driver.wait(until.urlContains('/clients'), 10000);
    console.log('✓ Redirected to clients list after creation');

    // Check console for errors
    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('✅ E2E client highlight videos test PASSED');
  } finally {
    // Cleanup
    if (sessionCookie) {
      await deleteClientByEmail(API_BASE, sessionCookie, TEST_EMAIL);
      console.log(`Cleaned up client: ${TEST_EMAIL}`);
    }
    await driver.quit();
  }
}

run().catch((err) => {
  console.error('❌ E2E client highlight videos test FAILED:', err);
  process.exit(1);
});

