/**
 * E2E Test: Client Events & Metrics Step in ClientWizard
 * 
 * Tests the expanded event fields: name, website, start/end time, player number, location
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, selectOption, allowlistedConsoleErrors, sleep, getSessionCookie, deleteClientByEmail, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const TEST_EMAIL = `ui-events-${Date.now()}@example.com`;
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
    await findAndType(driver, 'First name', 'Event');
    await findAndType(driver, 'Last name', 'Test');
    await findAndType(driver, 'Phone', '5551234567');
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

    // Navigate to Events & Metrics step (step 5)
    console.log('Navigating to Events & Metrics step...');
    await clickNext(); // 0 -> 1 (Basic -> Personal)
    await clickNext(); // 1 -> 2 (Personal -> Social)
    await clickNext(); // 2 -> 3 (Social -> Content)
    await clickNext(); // 3 -> 4 (Content -> Gallery)
    await clickNext(); // 4 -> 5 (Gallery -> Events)

    // Verify we're on the Events & Metrics step by checking for the add-event button
    await driver.wait(
      until.elementLocated(By.xpath(`//button[@data-testid="add-event"]`)),
      5000
    );
    console.log('On Events & Metrics step');

    // Add an event
    console.log('Adding event...');
    const addEventBtn = await driver.findElement(By.xpath(`//button[@data-testid="add-event"]`));
    await addEventBtn.click();
    await sleep(300);

    // Fill in event details using data-testid
    console.log('Filling event details...');
    
    // Event Name
    const eventNameField = await driver.findElement(By.css(`[data-testid="event-name-0"]`));
    await eventNameField.clear();
    await eventNameField.sendKeys('Summer Showcase Tournament');

    // Event Website
    const eventWebsiteField = await driver.findElement(By.css(`[data-testid="event-website-0"]`));
    await eventWebsiteField.clear();
    await eventWebsiteField.sendKeys('https://summershowcase.example.com');

    // Start Time
    const eventStartField = await driver.findElement(By.css(`[data-testid="event-start-0"]`));
    await eventStartField.sendKeys('07152026\t1000AM'); // Format for datetime-local

    // End Time
    const eventEndField = await driver.findElement(By.css(`[data-testid="event-end-0"]`));
    await eventEndField.sendKeys('07182026\t0600PM');

    // Player Number
    const playerNumberField = await driver.findElement(By.css(`[data-testid="event-player-number-0"]`));
    await playerNumberField.clear();
    await playerNumberField.sendKeys('23');

    // Location
    const locationField = await driver.findElement(By.css(`[data-testid="event-location-0"]`));
    await locationField.clear();
    await locationField.sendKeys('Phoenix, AZ - State Farm Stadium');

    console.log('Event details filled');

    // Add a metric
    console.log('Adding metric...');
    const addMetricBtn = await driver.findElement(By.xpath(`//button[@data-testid="add-metric"]`));
    await addMetricBtn.click();
    await sleep(300);

    // Fill metric details
    await findAndType(driver, 'Metric Title', '40-Yard Dash');
    await findAndType(driver, 'Metric Value', '4.52 seconds');

    console.log('Metric added');

    // Continue to Review step
    await clickNext(); // 5 -> 6 (Events -> Motivation)
    await clickNext(); // 6 -> 7 (Motivation -> Review)

    // Verify event details appear in review
    console.log('Verifying event details in Review...');
    
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Summer Showcase Tournament")]`)),
      5000
    );
    console.log('✓ Event name displayed in review');

    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Phoenix, AZ - State Farm Stadium")]`)),
      5000
    );
    console.log('✓ Event location displayed in review');

    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Player #: 23")]`)),
      5000
    );
    console.log('✓ Player number displayed in review');

    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"summershowcase.example.com")]`)),
      5000
    );
    console.log('✓ Event website displayed in review');

    // Verify metric in review
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"40-Yard Dash")]`)),
      5000
    );
    console.log('✓ Metric displayed in review');

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

    console.log('✅ E2E client events test PASSED');
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
  console.error('❌ E2E client events test FAILED:', err);
  process.exit(1);
});

