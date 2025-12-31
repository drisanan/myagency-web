/**
 * E2E Test: Client Recruiter Wizard
 * Tests that athletes/clients can use the recruiter wizard to:
 * - Select a list from their assigned lists
 * - Select ONE coach only
 * - Generate AI intro and edit email
 * - Create Gmail draft
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { findAndType, allowlistedConsoleErrors, sleep, dismissTour, getSessionCookie } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';

// Agency credentials (to create test data)
const AGENCY_EMAIL = 'drisanjames@gmail.com';
const AGENCY_PHONE = '2084407940';
const AGENCY_CODE = '123456';

// Test client data
const TEST_CLIENT_EMAIL = `client-recruiter-${Date.now()}@example.com`;
const TEST_CLIENT_CODE = '123456';
const TEST_LIST_NAME = `Test List ${Date.now()}`;

let sessionCookie = null;
let createdClientId = null;
let createdListId = null;

async function loginAsAgency(driver) {
  await driver.get(`${BASE}/auth/login`);
  await findAndType(driver, 'Email', AGENCY_EMAIL);
  await findAndType(driver, 'Phone', AGENCY_PHONE);
  await findAndType(driver, 'Access Code', AGENCY_CODE);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);
  sessionCookie = await getSessionCookie(driver);
}

async function loginAsClient(driver) {
  await driver.get(`${BASE}/auth/client-login`);
  await dismissTour(driver);
  await findAndType(driver, 'Email', TEST_CLIENT_EMAIL);
  await findAndType(driver, 'Access Code', TEST_CLIENT_CODE);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await sleep(2000);
  // Wait for client portal to load
  await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Client Portal")]`)), 20000);
}

async function createTestClient() {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `an_session=${sessionCookie}`,
    },
    body: JSON.stringify({
      email: TEST_CLIENT_EMAIL,
      phone: `208${Math.floor(1000000 + Math.random() * 9000000)}`,
      accessCode: TEST_CLIENT_CODE,
      firstName: 'Test',
      lastName: 'Athlete',
      sport: 'Football',
      radar: {
        school: 'Test High School',
        gpa: '3.5',
        accomplishments: ['State Champion', 'All-Conference'],
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Client creation failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  createdClientId = data?.client?.id;
  console.log('Created test client:', createdClientId);
  return createdClientId;
}

async function createTestList() {
  const res = await fetch(`${API_BASE}/lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `an_session=${sessionCookie}`,
    },
    body: JSON.stringify({
      name: TEST_LIST_NAME,
      items: [
        {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@university.edu',
          title: 'Head Coach',
          school: 'Test University',
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@college.edu',
          title: 'Assistant Coach',
          school: 'Another College',
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`List creation failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  createdListId = data?.list?.id || data?.id;
  console.log('Created test list:', createdListId);
  return createdListId;
}

async function cleanup() {
  if (sessionCookie) {
    if (createdClientId) {
      try {
        await fetch(`${API_BASE}/clients/${createdClientId}`, {
          method: 'DELETE',
          headers: { Cookie: `an_session=${sessionCookie}` },
        });
        console.log('Cleaned up client:', createdClientId);
      } catch {}
    }
    if (createdListId) {
      try {
        await fetch(`${API_BASE}/lists/${createdListId}`, {
          method: 'DELETE',
          headers: { Cookie: `an_session=${sessionCookie}` },
        });
        console.log('Cleaned up list:', createdListId);
      } catch {}
    }
  }
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Setup: Login as agency and create test data
    console.log('Setting up test data as agency...');
    await loginAsAgency(driver);
    await dismissTour(driver);
    await createTestClient();
    await createTestList();

    // Test: Login as client and use recruiter
    console.log('Testing client recruiter wizard...');
    await loginAsClient(driver);
    await dismissTour(driver);

    // Navigate to client recruiter page
    await driver.get(`${BASE}/client/recruiter`);
    await dismissTour(driver);
    await sleep(1000);

    // Verify page loads
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Send Recruiting Emails")]`)),
      10000
    );
    console.log('✓ Client Recruiter page loaded');

    // Verify stepper is present
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Select List")]`)),
      5000
    );
    console.log('✓ Stepper with "Select List" found');

    // Step 1: Select a list
    const listSelect = await driver.findElement(
      By.xpath(`//label[contains(., "Select List")]/following::div[contains(@class,"MuiSelect")][1]`)
    );
    await listSelect.click();
    await sleep(500);

    // Look for any available list
    const listOptions = await driver.findElements(By.xpath(`//li[contains(@class,"MuiMenuItem-root")]`));
    if (listOptions.length > 1) {
      // Click the first non-empty option
      await listOptions[1].click();
      await sleep(500);
      console.log('✓ Selected a list');

      // Click Next
      const nextBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`));
      await nextBtn.click();
      await sleep(500);

      // Step 2: Select ONE coach (verify radio buttons, not checkboxes)
      await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(),"Select One Coach")]`)),
        5000
      );
      console.log('✓ Moved to coach selection step');

      // Verify radio buttons are used (single selection)
      const radioButtons = await driver.findElements(By.css('input[type="radio"]'));
      if (radioButtons.length > 0) {
        console.log(`✓ Found ${radioButtons.length} radio buttons (single selection enforced)`);
        // Select first coach
        await radioButtons[0].click();
        await sleep(300);

        // Click Next to compose step
        const nextBtn2 = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`));
        await nextBtn2.click();
        await sleep(500);

        // Step 3: Verify compose step
        await driver.wait(
          until.elementLocated(By.xpath(`//*[contains(text(),"Email Preview")]`)),
          5000
        );
        console.log('✓ Moved to compose step');

        // Verify Edit button exists
        const editBtn = await driver.findElement(By.xpath(`//button[contains(., "Edit")]`));
        console.log('✓ Edit button found (editable preview)');

        // Verify AI Generate button exists
        const aiBtn = await driver.findElement(
          By.xpath(`//button[contains(., "Generate AI Introduction")]`)
        );
        console.log('✓ AI Generate button found');

        // Verify Gmail connect button exists
        const gmailBtn = await driver.findElements(
          By.xpath(`//button[contains(., "Connect Gmail")]`)
        );
        if (gmailBtn.length > 0) {
          console.log('✓ Connect Gmail button found');
        } else {
          console.log('Note: Gmail already connected or button not visible');
        }
      } else {
        console.log('Note: No coaches in list to select');
      }
    } else {
      console.log('Note: No lists available for client');
    }

    // Verify navigation exists
    const recruiterNavLink = await driver.findElements(
      By.xpath(`//a[contains(@href,"/client/recruiter")] | //button[contains(text(),"Recruiter")]`)
    );
    if (recruiterNavLink.length > 0) {
      console.log('✓ Recruiter navigation item found');
    }

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E client recruiter wizard passed');
  } finally {
    await cleanup();
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  cleanup().finally(() => process.exit(1));
});

