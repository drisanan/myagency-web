/**
 * E2E Test: Client Creation Wizard
 * 
 * NOTE: This test now requires Gmail connection in the Basic Info step.
 * Since we can't do real OAuth in automated tests, the test simulates
 * the Gmail connection by manipulating localStorage.
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { findAndType, selectOption, allowlistedConsoleErrors, sleep, getSessionCookie, deleteClientByEmail, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const TEST_EMAIL = `ui-client-${Date.now()}@example.com`;
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
  // Capture session for cleanup
  sessionCookie = await getSessionCookie(driver);
}

// Simulate Gmail OAuth success for testing
async function simulateGmailConnection(driver) {
  // Post a message to simulate OAuth popup success
  await driver.executeScript(`
    window.postMessage({ type: 'google-oauth-success', clientId: 'test-${Date.now()}' }, window.location.origin);
  `);
  await new Promise(r => setTimeout(r, 500));
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

    await findAndType(driver, 'Athlete Email', TEST_EMAIL);
    // Access Code is required; use numeric 6-digit
    await findAndType(driver, 'Access Code', '123456');
    await findAndType(driver, 'First name', 'Client');
    await findAndType(driver, 'Last name', 'Create');
    await findAndType(driver, 'Phone', '2084407940');
    await selectOption(driver, 'Sport', 'Football');

    // Verify Gmail connection UI is present
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Gmail Connection")]`)),
      5000
    );
    console.log('Gmail Connection section found');

    // Simulate Gmail connection since we can't do real OAuth in tests
    await simulateGmailConnection(driver);
    
    // Verify Gmail Connected chip appears
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Gmail Connected")]`)),
      5000
    );
    console.log('Gmail Connected successfully (simulated)');

    // Step through wizard (8 steps: Basic, Personal, Social, Content, Gallery, Events, Motivation, Review)
    const clickNext = async () => {
      const nextBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`));
      await nextBtn.click();
      await sleep(200);
    };

    // Step 0 -> 1 (Basic -> Personal)
    await clickNext();
    // Step 1 -> 2 (Personal -> Social)
    await clickNext();
    // Step 2 -> 3 (Social -> Content)
    await clickNext();
    // Step 3 -> 4 (Content -> Gallery)
    await clickNext();
    // Step 4 -> 5 (Gallery -> Events)
    await clickNext();
    // Step 5 -> 6 (Events -> Motivation)
    await clickNext();

    // Fill the new "What makes you different..." field on Motivation step
    const diffField = await driver.wait(
      until.elementLocated(
        By.xpath(`//label[contains(., "What makes you different from everyone else as a person?")]/following::textarea[1] | //label[contains(., "What makes you different from everyone else as a person?")]/following::input[1]`)
      ),
      5000
    );
    await diffField.clear();
    await diffField.sendKeys('I bring relentless curiosity and teamwork to every challenge.');

    // Step 6 -> 7 (Motivation -> Review)
    await clickNext();
    const createBtn =
      (await driver.findElements(By.xpath(`//button[contains(., "Create Client")]`)))[0] ||
      (await driver.findElements(By.xpath(`//button[contains(., "Save Changes")]`)))[0];
    if (!createBtn) throw new Error('Create/Save button not found');
    await createBtn.click();

    if (!process.env.SKIP_CLIENT_CHECK) {
      const maxAttempts = 15;
      let found = false;
      for (let i = 0; i < maxAttempts; i++) {
        await sleep(2000);
        const res = await fetch(`${API_BASE}/clients`, {
          headers: { Cookie: `an_session=${sessionCookie}` },
        });
        if (res.ok) {
          const json = await res.json();
          const clients = json?.clients || [];
          if (i === 0) {
            console.log(`Client list size: ${clients.length}`);
          }
          found = clients.some((c) => String(c?.email || '').toLowerCase() === TEST_EMAIL.toLowerCase());
          if (found) break;
        }
      }
      if (!found) {
        throw new Error(`Client not found via API after creation: ${TEST_EMAIL}`);
      }
    }

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E client create passed with email', TEST_EMAIL);
  } finally {
    // Cleanup: delete created test client
    if (sessionCookie) {
      await deleteClientByEmail(API_BASE, sessionCookie, TEST_EMAIL);
      console.log(`Cleaned up client: ${TEST_EMAIL}`);
    }
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

